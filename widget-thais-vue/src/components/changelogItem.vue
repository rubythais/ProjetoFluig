<template>
  <div class="card">
    <button class="header" @click="open = !open">
      <div class="left">
        <div class="version">
          v{{ item.version }}
        </div>
        <div class="meta">
          <span class="date">{{ formatDate(item.releaseDate) }}</span>
          <span class="summary">{{ item.summary }}</span>
        </div>
      </div>

      <div class="right">
        <span class="chev">{{ open ? '▲' : '▼' }}</span>
      </div>
    </button>

    <div v-if="open" class="body">
      <div class="badges">
        <span v-for="c in item.categories" :key="c" class="badge">{{ c }}</span>
        <span v-for="t in item.tags" :key="t" class="tag">{{ t }}</span>
      </div>

      <div v-if="imageUrl" class="banner">
        <img :src="imageUrl" alt="banner" />
      </div>

      <ul class="changes">
        <li v-for="(ch, idx) in item.changes" :key="idx" class="change">
          <div class="change-top">
            <span class="type">{{ ch.type }}</span>
            <span class="title">{{ ch.title }}</span>
            <span v-if="ch.impact" class="impact">Impacto: {{ ch.impact }}</span>
          </div>
          <div v-if="ch.details" class="details">{{ ch.details }}</div>
          <div v-if="ch.module" class="module">Módulo: {{ ch.module }}</div>
        </li>
      </ul>

      <a v-if="detailsHref" class="details-link" :href="detailsHref">
        Ver detalhes
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
  showDetailsLink: { type: Boolean, default: false }
})

const open = ref(false)

function formatDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR')
  } catch {
    return iso
  }
}


const imageUrl = computed(() => {
  if (!props.item.imageDocumentId) return ''
  return `/ecm/document/downloadURL/${props.item.imageDocumentId}`
})

const detailsHref = computed(() => {
  if (!props.showDetailsLink) return ''
  return `/portal/p/1/page/changelog-detalhe?version=${encodeURIComponent(props.item.version)}`
})
</script>

<style scoped>
.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #667eea;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card:hover {
  border-left-color: #764ba2;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border: none;
  cursor: pointer;
  transition: background 0.3s ease;
}

.header:hover {
  background: linear-gradient(135deg, #f0f2ff 0%, #f8f9ff 100%);
}

.left {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
}

.version {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  min-width: 60px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date {
  font-size: 13px;
  color: #64748b;
}

.summary {
  font-size: 15px;
  color: #1e293b;
  font-weight: 500;
}

.right {
  display: flex;
  align-items: center;
}

.chev {
  font-size: 14px;
  color: #667eea;
  transition: transform 0.3s ease;
}

.body {
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.tag {
  padding: 6px 12px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.banner {
  margin: 16px 0;
  border-radius: 8px;
  overflow: hidden;
}

.banner img {
  width: 100%;
  height: auto;
  display: block;
}

.changes {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.change {
  padding: 12px;
  margin-bottom: 12px;
  background: #f8f9ff;
  border-left: 3px solid #cbd5e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.change:hover {
  background: #f0f2ff;
  border-left-color: #667eea;
}

.change-top {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.type {
  padding: 4px 10px;
  background: #667eea;
  color: #ffffff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.title {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.impact {
  padding: 4px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.details {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 6px;
}

.module {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

.details-link {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.details-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>
