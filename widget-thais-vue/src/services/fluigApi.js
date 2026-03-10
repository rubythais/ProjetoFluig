const UPLOAD_FOLDER_ID = '2000'

const FLUIGHUB_ROUTES = {
  moveStartProcess: [
    '/fluighub/rest/service/execute/movestart-process',
    '/fluighub/rest/movestart-process',
    '/fluighub/rest/_movestart-process'
  ]
}

const PROCESS_ID = 'sugestao_melhorias'

async function fetchWithFallback(urls, options) {
  let lastError = null

  for (const url of urls) {
    try {
      const response = await fetch(url, options)
      if (response.status === 404) {
        continue
      }
      return response
    } catch (err) {
      lastError = err
    }
  }

  if (lastError) {
    throw lastError
  }

  throw new Error('Nenhuma rota FluigHub respondeu')
}

function extractDocumentId(uploadResponse) {
  const id =
    uploadResponse?.content?.documentId ||
    uploadResponse?.content?.id ||
    uploadResponse?.content?.files?.[0]?.documentId ||
    uploadResponse?.content?.uploadedFiles?.[0]?.documentId ||
    uploadResponse?.content?.documents?.[0]?.documentId ||
    uploadResponse?.documentId ||
    uploadResponse?.id ||
    uploadResponse?.files?.[0]?.documentId ||
    uploadResponse?.documents?.[0]?.documentId ||
    ''

  return id ? String(id) : ''
}

async function resolveDownloadURLByDataset(documentId) {
  if (!documentId) return ''

  try {
    const constraints = [{
      _field: 'documentId',
      _initialValue: String(documentId),
      _finalValue: String(documentId),
      _type: 1,
      fieldName: 'documentId',
      initialValue: String(documentId),
      finalValue: String(documentId),
      constraintType: 1
    }]

    const response = await fetch('/api/public/ecm/dataset/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'dsDocumentDownloadURL',
        fields: ['documentId', 'downloadURL', 'status', 'message'],
        constraints,
        order: []
      })
    })

    if (!response.ok) {
      return `/api/public/ecm/document/downloadURL/${encodeURIComponent(String(documentId))}`
    }

    const data = await response.json()
    const row = data?.content?.values?.[0] || {}

    if (row.status === 'success' && row.downloadURL) {
      return String(row.downloadURL)
    }
  } catch (err) {
    console.warn('[fluigApi] Falha ao resolver downloadURL via dataset:', err)
  }

  return `/api/public/ecm/document/downloadURL/${encodeURIComponent(String(documentId))}`
}

/**
 * Upload único para Fluig GED.
 * Endpoint obrigatório: /api/public/ecm/document/upload
 *
 * @param {File} file
 * @returns {Promise<{documentId: string, downloadURL: string, fileName: string, success: boolean}>}
 */
export async function uploadFileToFluig(file) {
  if (!file) {
    return { documentId: '', downloadURL: '', fileName: '', success: false }
  }

  try {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('parentDocumentId', UPLOAD_FOLDER_ID)
    formData.append('description', file.name)

    const response = await fetch('/api/public/ecm/document/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const raw = await response.text().catch(() => '')
      throw new Error(`Upload HTTP ${response.status}${raw ? ` - ${raw}` : ''}`)
    }

    const uploadResponse = await response.json()
    const documentId = extractDocumentId(uploadResponse)

    if (!documentId) {
      throw new Error('Upload concluído sem documentId no retorno')
    }

    const downloadURL = await resolveDownloadURLByDataset(documentId)
    console.log('[fluigApi] Upload concluído com sucesso. documentId:', documentId)

    return {
      documentId,
      downloadURL,
      fileName: file.name,
      success: true
    }
  } catch (err) {
    console.error('[fluigApi] Erro no upload:', err)
    return {
      documentId: '',
      downloadURL: '',
      fileName: file.name,
      success: false
    }
  }
}

function buildFormFields(formData, currentUser) {
  return {
    sugestao_titulo: formData.titulo || '',
    sugestao_descricao: formData.descricao || '',
    sugestao_versao: formData.versao || '',
    sugestao_modulo: formData.modulo || '',
    sugestao_tipo: formData.tipo || '',
    sugestao_impacto: formData.impacto || '',
    sugestao_beneficio: formData.beneficio || '',
    anexoDocumentId: formData.anexoDocumentId || '',
    anexoURL: formData.anexoURL || '',
    sugestao_solicitante: currentUser.name || currentUser.login || ''
  }
}

function extractProcessInstanceId(result) {
  const payload = typeof result?.message === 'string'
    ? (() => {
      try {
        return JSON.parse(result.message)
      } catch (_) {
        return {}
      }
    })()
    : (result?.message || result || {})

  return String(
    payload?.processInstanceId ||
    payload?.processInstance ||
    result?.processInstanceId ||
    result?.content?.processInstanceId ||
    ''
  )
}

async function startWorkflowViaEndpoint(formData, currentUser) {
  const payload = {
    action: 'START',
    processId: PROCESS_ID,
    targetState: 0,
    assignee: currentUser.login || '',
    formFields: buildFormFields(formData, currentUser)
  }

  const response = await fetchWithFallback(FLUIGHUB_ROUTES.moveStartProcess, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const raw = await response.text().catch(() => '')
    throw new Error(`Start process HTTP ${response.status}${raw ? ` - ${raw}` : ''}`)
  }

  const result = await response.json()
  const processInstanceId = extractProcessInstanceId(result)

  if (!processInstanceId) {
    throw new Error('Endpoint de processo não retornou processInstanceId')
  }

  return {
    processInstanceId,
    protocol: `SUGESTAO-${processInstanceId}`
  }
}

async function startWorkflowViaDataset(formData, currentUser) {
  const createConstraint = (field, value) => ({
    _field: field,
    _initialValue: value,
    _finalValue: value,
    _type: 1,
    fieldName: field,
    initialValue: value,
    finalValue: value,
    constraintType: 1
  })

  const formFields = buildFormFields(formData, currentUser)

  const constraints = [
    createConstraint('action', 'START'),
    createConstraint('processId', PROCESS_ID)
  ]

  Object.keys(formFields).forEach((key) => {
    constraints.push(createConstraint(key, formFields[key]))
  })

  const response = await fetch('/api/public/ecm/dataset/datasets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'dsStartProcess',
      fields: ['processInstanceId', 'status', 'message'],
      constraints,
      order: []
    })
  })

  if (!response.ok) {
    throw new Error(`Dataset HTTP ${response.status}`)
  }

  const data = await response.json()
  const values = data?.content?.values || []
  const row = values[0] || {}

  if (row.status === 'error') {
    throw new Error(row.message || 'dsStartProcess retornou erro')
  }

  if (!row.processInstanceId) {
    throw new Error('dsStartProcess não retornou processInstanceId')
  }

  return {
    processInstanceId: String(row.processInstanceId),
    protocol: `SUGESTAO-${row.processInstanceId}`
  }
}

/**
 * Iniciar processo BPM de sugestão
 * @param {string} processId - alias do processo (ex: 'sugestao_melhorias')
 * @param {object} formData - dados do formulário
 * @returns {Promise<{processInstanceId: string, protocol: string}>}
 */
export async function startWorkflowProcess(processId, formData) {
  if (!formData) {
    throw new Error('ProcessId e formData são obrigatórios')
  }

  if (processId && processId !== PROCESS_ID) {
    console.warn(`[fluigApi] processId '${processId}' ignorado. Usando '${PROCESS_ID}'.`)
  }

  try {
    const currentUser = await getCurrentUser()

    try {
      return await startWorkflowViaEndpoint(formData, currentUser)
    } catch (endpointError) {
      console.warn('[fluigApi] Start via endpoint indisponível, usando fallback dataset:', endpointError)
    }

    return await startWorkflowViaDataset(formData, currentUser)
  } catch (datasetError) {
    console.error('[fluigApi] Erro ao iniciar processo via dsStartProcess:', datasetError)
    throw new Error(`Falha ao enviar sugestão: ${datasetError.message}`)
  }
}

/**
 * Fluxo completo de envio da sugestão:
 * 1) upload opcional
 * 2) start do processo com formFields + anexo
 */
export async function submitSuggestion(formData, selectedFile) {
  if (!formData) {
    throw new Error('Dados do formulário são obrigatórios')
  }

  const payload = {
    ...formData,
    anexoDocumentId: formData.anexoDocumentId || '',
    anexoURL: formData.anexoURL || ''
  }

  if (selectedFile && !payload.anexoDocumentId) {
    const uploadResult = await uploadFileToFluig(selectedFile)
    if (!uploadResult.success || !uploadResult.documentId) {
      throw new Error('Falha no upload do anexo. Verifique permissões/formato do arquivo.')
    }

    payload.anexoDocumentId = uploadResult.documentId
    payload.anexoURL = uploadResult.downloadURL || ''
  }

  return startWorkflowProcess(PROCESS_ID, payload)
}

/**
 * Obter dados do usuário logado
 * @returns {Promise<{login: string, email: string, name: string}>}
 */
export async function getCurrentUser() {
  // 1. Tentar contexto global do Fluig (mais confiável dentro do widget)
  if (window.WCMAPI && window.WCMAPI.userCode) {
    return {
      login: window.WCMAPI.userCode,
      email: window.WCMAPI.userEmail || '',
      name: window.WCMAPI.userName || window.WCMAPI.userCode
    }
  }

  try {
    const response = await fetch('/api/public/ecm/currentUser/getCurrent')
    if (response.ok) {
      const data = await response.json()
      const c = data.content || data
      return {
        login: c.login || c.userCode || 'usuario',
        email: c.email || '',
        name: c.fullName || c.name || c.login || 'Usuário'
      }
    }
  } catch (_) { /* ignora */ }

  console.warn('[fluigApi] Usuário não identificado, usando fallback')
  return { login: 'usuario', email: '', name: 'Usuário' }
}

/**
 * Obter URL de download de documento
 * @param {string|number} documentId
 * @returns {string}
 */
export function getDocumentUrl(documentId) {
  if (!documentId) return ''
  return `/api/public/ecm/document/downloadURL/${documentId}`
}

/**
 * Buscar dados de dataset via API Fluig
 * @param {string} datasetName
 * @param {object} filters
 * @returns {Promise<Array>}
 */
export async function queryDataset(datasetName, filters = {}) {
  try {
    const constraints = Object.keys(filters).map(key => ({
      _field: key,
      _initialValue: filters[key],
      _finalValue: filters[key],
      _type: 1
    }))

    const response = await fetch('/api/public/ecm/dataset/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: datasetName,
        fields: [],
        constraints,
        order: []
      })
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    return data?.content?.values || []
  } catch (error) {
    console.error('[fluigApi] Erro ao consultar dataset:', error)
    return []
  }
}
