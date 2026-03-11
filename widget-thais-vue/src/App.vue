<template>
  <div class="widget-thais-scope">
    <div class="mw-portal-wrap">
      <div class="mw-portal-card">

        <!-- Topbar -->
        <div class="mw-topbar">

          <div class="mw-title-row">
            <div class="mw-title">{{ titleText }}</div>

            <button
              class="btn-suggest"
              @click="showSuggestModal = true"
            >
              Sugerir Melhoria
            </button>
          </div>

          <!-- filtros -->
          <div class="mw-controls">

            <input
              class="mw-input"
              v-model="q"
              placeholder="Buscar (ex.: login, relatório)"
            />

            <!-- categoria -->
            <select class="mw-select" v-model="category">

              <option value="">Categoria</option>

              <!-- categorias padrão -->
              <option value="novidades">Novidades</option>
              <option value="correcoes">Correções</option>
              <option value="melhorias">Melhorias</option>
              <option value="seguranca">Segurança</option>

              <!-- categorias vindas do dataset -->
              <option
                v-if="allCategories.length === 0"
                disabled
              >
                Sem categorias disponíveis
              </option>

              <option
                v-for="c in allCategories"
                :key="c"
                :value="c"
              >
                {{ c }}
              </option>

            </select>

            <!-- tags -->
            <select class="mw-select" v-model="tag">

              <option value="">Tag (todas)</option>

              <option
                v-if="allTags.length === 0"
                disabled
              >
                Sem tags disponíveis
              </option>

              <option
                v-for="t in allTags"
                :key="t"
                :value="t"
              >
                {{ t }}
              </option>

            </select>

          </div>
        </div>

        <!-- estados -->
        <div v-if="loading" class="mw-state">
          Carregando...
        </div>

        <div v-else-if="error" class="mw-state mw-error">
          {{ error }}
        </div>

        <div v-else-if="filtered.length === 0" class="mw-state">
          Nenhuma versão encontrada.
        </div>

        <!-- lista -->
        <div v-else class="mw-list">
          <ChangelogItem
            v-for="v in filtered"
            :key="v.version || v.id || v.documentId"
            :item="v"
            :showDetailsLink="true"
          />
        </div>

      </div>
    </div>

    <SuggestModal v-model="showSuggestModal" />
  </div>
</template>

<script setup>

import { ref, computed, onMounted } from 'vue'
import ChangelogItem from './components/changelogItem.vue'
import SuggestModal from './components/SuggestModal.vue'
import { fetchChangelogVersions } from './services/changelogService'

const props = defineProps({
  datasetName: { type: String, default: 'dsThaisChangelog' },
  statusPublico: { type: String, default: 'publicado' },
  title: { type: String, default: 'Changelog' }
})

const loading = ref(true)
const error = ref('')
const versions = ref([])

const q = ref('')
const category = ref('')
const tag = ref('')
const showSuggestModal = ref(false)

const titleText = computed(() => props.title || 'Changelog')

/* utils */

function toArray(value) {

  if (Array.isArray(value)) return value

  if (!value) return []

  if (typeof value === 'string') {

    return value
      .split(/[,;]+/)
      .map(v => v.trim())
      .filter(Boolean)

  }

  return []
}

function normalizeStatus(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
}

function safeDate(d) {

  const dt = new Date(d)

  return isNaN(dt.getTime())
    ? new Date(0)
    : dt
}

/* categorias */

const allCategories = computed(() => {

  const set = new Set()

  versions.value.forEach(v => {

    toArray(v.categories)
      .forEach(c => set.add(c))

  })

  return Array
    .from(set)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))

})

/* tags */

const allTags = computed(() => {

  const set = new Set()

  versions.value.forEach(v => {

    toArray(v.tags)
      .forEach(t => set.add(t))

  })

  return Array
    .from(set)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))

})

/* filtro principal */

const filtered = computed(() => {

  const query = q.value
    .trim()
    .toLowerCase()

  const wantStatus =
    normalizeStatus(props.statusPublico)

  return (versions.value || [])

    .filter(v => {

      if (!wantStatus) return true

      return normalizeStatus(v.status) === wantStatus

    })

    .filter(v => {

      const cats = toArray(v.categories)
      const tags = toArray(v.tags)
      const changes = toArray(v.changes)

      if (category.value && !cats.includes(category.value)) {
        return false
      }

      if (tag.value && !tags.includes(tag.value)) {
        return false
      }

      if (!query) return true

      const hay = [

        v.version,
        v.summary,
        v.description,
        cats.join(' '),
        tags.join(' '),

        ...changes.map(ch => {

          if (typeof ch === 'string') {
            return ch
          }

          const type = ch.type || ''
          const title = ch.title || ''
          const details = ch.details || ''
          const mod = ch.module || ''

          return `${type} ${title} ${details} ${mod}`

        })

      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return hay.includes(query)

    })

    .sort((a, b) => {

      const ap = !!a.pinned
      const bp = !!b.pinned

      if (ap !== bp) {
        return ap ? -1 : 1
      }

      return safeDate(b.releaseDate)
        - safeDate(a.releaseDate)

    })

})

/* carregamento */

onMounted(async () => {

  loading.value = true
  error.value = ''

  try {

    const data = await fetchChangelogVersions({
      datasetName: props.datasetName
    })

    versions.value =
      Array.isArray(data) ? data : []

  } catch (e) {

    console.error(e)

    error.value =
      'Não foi possível carregar o changelog.'

    versions.value = []

  } finally {

    loading.value = false

  }

})

</script>

<style scoped>
.widget-thais-scope {
  width: 100%;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 50%, #fff8f9 100%);
  min-height: 400px;
}

.mw-portal-wrap {
  width: 100%;
  box-sizing: border-box;
  padding: 20px 12px;
}

.mw-portal-card {
  width: 100%;
  box-sizing: border-box;
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border: 2px solid transparent;
  border-image: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-image-slice: 1;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.12), 0 4px 12px rgba(118, 75, 162, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
}

.mw-portal-card:hover {
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.18), 0 6px 16px rgba(118, 75, 162, 0.12);
}

.mw-topbar {
  padding: 0 0 20px 0;
  margin-bottom: 20px;
  background: transparent;
  border-bottom: 2px solid;
  border-image: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-image-slice: 1;
}

.mw-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.mw-title {
  font-size: clamp(24px, 4vw, 32px);
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  padding: 2px 0 4px;
  text-align: center;
  display: block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.btn-suggest {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  white-space: nowrap;
}

.btn-suggest:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
}

.btn-suggest:active {
  transform: translateY(0);
}

.mw-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.mw-input,
.mw-select {
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  box-sizing: border-box;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #ffffff;
}

.mw-input:focus,
.mw-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.mw-input:hover,
.mw-select:hover {
  border-color: #cbd5e0;
}

.mw-input {
  flex: 1;
  min-width: 240px;
}

.mw-select {
  min-width: 160px;
  cursor: pointer;
}

.mw-state {
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 15px;
}

.mw-error {
  color: #dc2626;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
}

.mw-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>