<template>
  <transition name="modal-fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Sugerir Melhoria</h2>
          <button class="modal-close" @click="closeModal" aria-label="Fechar">
            &times;
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="suggest-form">
            <div class="form-group">
              <label for="titulo" class="form-label">
                Título <span class="required">*</span>
              </label>
              <input
                id="titulo"
                v-model="formData.titulo"
                type="text"
                class="form-input"
                placeholder="Ex: Adicionar filtro por data no relatório"
                required
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label for="descricao" class="form-label">
                Descrição <span class="required">*</span>
              </label>
              <textarea
                id="descricao"
                v-model="formData.descricao"
                class="form-textarea"
                rows="4"
                placeholder="Descreva a melhoria ou problema encontrado..."
                required
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="versao" class="form-label">
                Versão relacionada
              </label>
              <input
                id="versao"
                v-model="formData.versao"
                type="text"
                class="form-input"
                placeholder="Ex: v2.4.2"
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="modulo" class="form-label">
                  Módulo/Área <span class="required">*</span>
                </label>
                <select
                  id="modulo"
                  v-model="formData.modulo"
                  class="form-select"
                  required
                  :disabled="isSubmitting"
                >
                  <option value="">Selecione...</option>
                  <option value="Portal">Portal</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="RH">Recursos Humanos</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Estoque">Estoque</option>
                  <option value="Relatorios">Relatórios</option>
                  <option value="Configuracoes">Configurações</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div class="form-group">
                <label for="tipo" class="form-label">
                  Tipo <span class="required">*</span>
                </label>
                <select
                  id="tipo"
                  v-model="formData.tipo"
                  class="form-select"
                  required
                  :disabled="isSubmitting"
                >
                  <option value="">Selecione...</option>
                  <option value="melhoria">Melhoria</option>
                  <option value="correcao">Correção</option>
                  <option value="funcionalidade">Nova Funcionalidade</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="impacto" class="form-label">
                  Impacto Esperado
                </label>
                <select
                  id="impacto"
                  v-model="formData.impacto"
                  class="form-select"
                  :disabled="isSubmitting"
                >
                  <option value="">Selecione...</option>
                  <option value="baixo">Baixo</option>
                  <option value="medio">Médio</option>
                  <option value="alto">Alto</option>
                </select>
              </div>

              <div class="form-group">
                <label for="beneficio" class="form-label">
                  Benefício Principal
                </label>
                <input
                  id="beneficio"
                  v-model="formData.beneficio"
                  type="text"
                  class="form-input"
                  placeholder="Ex: Redução de tempo, Melhoria de usabilidade"
                  :disabled="isSubmitting"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="anexo" class="form-label">
                Anexo (opcional)
              </label>
              <input
                id="anexo"
                ref="fileInput"
                type="file"
                class="form-file"
                accept="image/*,.pdf,.doc,.docx"
                @change="handleFileChange"
                :disabled="isSubmitting"
              />
              <small class="form-help">
                Imagens, PDF ou documentos (máx. 5MB)
              </small>
            </div>

            <div v-if="error" class="alert alert-error">
              {{ error }}
            </div>

            <div v-if="success" class="alert alert-success">
              <strong>Sucesso!</strong> Sugestão enviada.<br />
              Protocolo: <strong>{{ protocol }}</strong>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
                :disabled="isSubmitting"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isSubmitting || success"
              >
                <span v-if="isSubmitting">Enviando...</span>
                <span v-else>Enviar Sugestão</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { submitSuggestion } from '../services/fluigApi'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(props.modelValue)
const isSubmitting = ref(false)
const error = ref('')
const success = ref(false)
const protocol = ref('')

const formData = ref({
  titulo: '',
  versao: '',
  descricao: '',
  modulo: '',
  tipo: '',
  impacto: '',
  beneficio: '',
  anexoDocumentId: '',
  anexoURL: ''
})

const selectedFile = ref(null)
const fileInput = ref(null)

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
  if (newVal) {
    resetForm()
  }
})

function closeModal() {
  if (!isSubmitting.value) {
    emit('update:modelValue', false)
  }
}

function resetForm() {
  formData.value = {
    titulo: '',
    versao: '',
    descricao: '',
    modulo: '',
    tipo: '',
    impacto: '',
    beneficio: '',
    anexoDocumentId: '',
    anexoURL: ''
  }
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  error.value = ''
  success.value = false
  protocol.value = ''
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Arquivo muito grande. Máximo: 5MB'
      event.target.value = ''
      return
    }
    selectedFile.value = file
    error.value = ''
  }
}

async function handleSubmit() {
  error.value = ''
  isSubmitting.value = true

  try {
    // Validar campos obrigatórios
    if (!formData.value.titulo || !formData.value.descricao || !formData.value.modulo || !formData.value.tipo) {
      throw new Error('Preencha todos os campos obrigatórios')
    }

    // Upload opcional + Start BPM com formFields e anexo
    console.log('[SuggestModal] Enviando sugestão...')
    const processResult = await submitSuggestion(formData.value, selectedFile.value)
    
    protocol.value = processResult.protocol
    success.value = true
    console.log('[SuggestModal] Processo iniciado:', processResult)

    // Fechar modal após 3 segundos
    setTimeout(() => {
      closeModal()
    }, 3000)

  } catch (err) {
    console.error('[SuggestModal] Erro ao enviar sugestão:', err)
    error.value = err.message || 'Não foi possível enviar a sugestão. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: #ffffff;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 32px;
  color: #ffffff;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 24px;
}

.suggest-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  font-weight: 600;
  font-size: 14px;
  color: #1e293b;
}

.required {
  color: #dc2626;
}

.form-input,
.form-textarea,
.form-select {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-file {
  padding: 8px;
  font-size: 14px;
}

.form-help {
  font-size: 12px;
  color: #64748b;
}

.alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}

.alert-error {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.alert-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .modal-container {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
