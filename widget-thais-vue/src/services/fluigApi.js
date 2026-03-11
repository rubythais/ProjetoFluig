const PROCESS_ID = 'sugestao_melhorias'
const UPLOAD_FOLDER_ID = '2000'

// URL exata conforme documentação FluigHub
const FLUIGHUB_BASE_URL = '/fluighub/rest/service/execute'
const FLUIGHUB_MOVESTART_URL = `${FLUIGHUB_BASE_URL}/movestart-process`
const FLUIGHUB_CRYPTO_URL = `${FLUIGHUB_BASE_URL}/crypto`

const PUBLIC_START_ROUTES = [
  '/api/public/2.0/workflows/start',
  '/api/public/2.0/workflows/startProcess',
  '/api/public/ecm/workflow/startProcess'
]

const ENABLE_FLUIGHUB_FALLBACK = true

function createConstraint(field, value, type = 1) {
  const safeValue = value == null ? '' : String(value)

  return {
    _field: field,
    _initialValue: safeValue,
    _finalValue: safeValue,
    _type: type,
    fieldName: field,
    initialValue: safeValue,
    finalValue: safeValue,
    constraintType: type
  }
}

async function postDataset(name, fields, constraints = [], extra = {}) {
  const payload = {
    name,
    fields: fields || [],
    constraints: constraints || [],
    order: [],
    ...extra
  }

  console.log(`[fluigApi] postDataset('${name}') - enviando payload:`, JSON.stringify(payload, null, 2))

  const response = await fetch('/api/public/ecm/dataset/datasets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    console.error(`[fluigApi] postDataset('${name}') - HTTP ${response.status}`, errorText)
    throw new Error(`Dataset ${name} HTTP ${response.status}${errorText ? ': ' + errorText : ''}`)
  }

  const data = await response.json()

  console.log(`[fluigApi] postDataset('${name}') - resposta recebida:`, JSON.stringify(data, null, 2))

  return {
    data,
    values: data?.content?.values || []
  }
}

async function fetchWithFallback(urls, options) {
  let lastError = null

  for (const url of urls) {
    try {
      const response = await fetch(url, options)
      if (response.status === 404) continue
      return response
    } catch (err) {
      lastError = err
    }
  }

  if (lastError) throw lastError
  throw new Error('Nenhuma rota respondeu')
}

function parseJsonSafely(value) {
  if (typeof value !== 'string') return value || {}

  try {
    return JSON.parse(value)
  } catch (_) {
    return {}
  }
}

function extractProcessInstanceId(result) {
  const payload =
    typeof result?.message === 'string'
      ? parseJsonSafely(result.message)
      : result?.message || result || {}

  return String(
    payload?.processInstanceId ||
    payload?.processInstance ||
    result?.processInstanceId ||
    result?.content?.processInstanceId ||
    ''
  )
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = String(reader.result || '')
      const parts = result.split(',')
      resolve(parts.length > 1 ? parts[1] : result)
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function resolveDownloadURLByDataset(documentId) {
  if (!documentId) return ''

  try {
    const { values } = await postDataset(
      'dsDocumentDownloadURL',
      ['documentId', 'downloadURL', 'status', 'message'],
      [createConstraint('documentId', documentId)]
    )

    const row = values[0] || {}

    if (row.status === 'success' && row.downloadURL) {
      return String(row.downloadURL)
    }
  } catch (err) {
    console.warn('[fluigApi] dataset downloadURL falhou:', err)
  }

  return `/api/public/ecm/document/downloadURL/${encodeURIComponent(
    String(documentId)
  )}`
}

export async function uploadFileToFluig(file) {
  if (!file) {
    return { documentId: '', downloadURL: '', fileName: '', success: false }
  }

  try {
    const base64 = await fileToBase64(file)

    const { values } = await postDataset(
      'dsUploadFile',
      ['documentId', 'downloadURL', 'status', 'message'],
      [
        createConstraint('action', 'UPLOAD'),
        createConstraint('fileName', file.name),
        createConstraint('fileContent', base64),
        createConstraint('folderId', UPLOAD_FOLDER_ID)
      ]
    )

    const row = values[0] || {}

    if (row.status === 'error') {
      throw new Error(row.message || 'dsUploadFile retornou erro')
    }

    if (!row.documentId) {
      throw new Error('dsUploadFile não retornou documentId')
    }

    const documentId = String(row.documentId)

    const downloadURL =
      row.downloadURL || (await resolveDownloadURLByDataset(documentId))

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
  // Validar campos obrigatórios
  if (!formData.titulo || !formData.descricao || !formData.modulo || !formData.tipo) {
    const missing = [
      !formData.titulo && 'titulo',
      !formData.descricao && 'descricao',
      !formData.modulo && 'modulo',
      !formData.tipo && 'tipo'
    ].filter(Boolean).join(', ')
    throw new Error(`Campos obrigatórios não preenchidos: ${missing}`)
  }

  const fields = {
    sugestao_titulo: String(formData.titulo).trim(),
    sugestao_descricao: String(formData.descricao).trim(),
    sugestao_versao: formData.versao ? String(formData.versao).trim() : '',
    sugestao_modulo: String(formData.modulo).trim(),
    sugestao_tipo: String(formData.tipo).trim(),
    sugestao_impacto: formData.impacto ? String(formData.impacto).trim() : '',
    sugestao_beneficio: formData.beneficio ? String(formData.beneficio).trim() : '',
    anexoDocumentId: formData.anexoDocumentId ? String(formData.anexoDocumentId).trim() : '',
    anexoURL: formData.anexoURL ? String(formData.anexoURL).trim() : '',
    sugestao_solicitante: currentUser.name || currentUser.login || ''
  }

  console.log('[fluigApi] buildFormFields - dados validados:', JSON.stringify(fields, null, 2))
  return fields
}

function buildStartContentPayload(formData) {
  if (!formData.titulo || !formData.descricao || !formData.modulo || !formData.tipo) {
    throw new Error('Campos obrigatórios não preenchidos')
  }

  return {
    content: {
      columns: ['titulo', 'descricao', 'modulo', 'tipo'],
      values: [[
        String(formData.titulo).trim(),
        String(formData.descricao).trim(),
        String(formData.modulo).trim(),
        String(formData.tipo).trim()
      ]]
    }
  }
}

async function startWorkflowViaDataset(formData, currentUser) {
  console.log('[fluigApi] startWorkflowViaDataset - iniciando com formData:', JSON.stringify(formData, null, 2))
  console.log('[fluigApi] startWorkflowViaDataset - currentUser:', JSON.stringify(currentUser, null, 2))

  const formFields = buildFormFields(formData, currentUser)
  const startContentPayload = buildStartContentPayload(formData)

  const constraints = [
    createConstraint('action', 'startProcess', 0),
    createConstraint('processId', PROCESS_ID, 0),
    createConstraint(
      'startUserId',
      currentUser.login || currentUser.userCode || '',
      0
    )
  ]

  Object.keys(formFields).forEach((key) => {
    constraints.push(createConstraint(key, formFields[key], 0))
  })

  constraints.push(createConstraint('titulo', formData.titulo, 0))
  constraints.push(createConstraint('descricao', formData.descricao, 0))
  constraints.push(createConstraint('modulo', formData.modulo, 0))
  constraints.push(createConstraint('tipo', formData.tipo, 0))

  console.log('[fluigApi] startWorkflowViaDataset - total de constraints:', constraints.length)
  console.log('[fluigApi] startWorkflowViaDataset - constraints (resumo):', {
    action: constraints.find(c => c.fieldName === 'action')?._initialValue,
    processId: constraints.find(c => c.fieldName === 'processId')?._initialValue,
    startUserId: constraints.find(c => c.fieldName === 'startUserId')?._initialValue,
    campos_formulario: constraints.filter(c => c.fieldName?.startsWith('sugestao_')).length
  })

  console.log('Payload enviado ao Fluig:', {
    name: 'dsStartProcess',
    ...startContentPayload,
    constraints
  })

  const { data, values } = await postDataset(
    'dsStartProcess',
    ['processInstanceId', 'status', 'message'],
    constraints,
    startContentPayload
  )

  console.log('[fluigApi] startWorkflowViaDataset - resposta do dataset:', JSON.stringify(data, null, 2))
  console.log('[fluigApi] startWorkflowViaDataset - rows retornadas:', values.length)

  if (!values.length) {
    console.error('[fluigApi] ERRO CRÍTICO: dsStartProcess retornou vazio!', JSON.stringify(data, null, 2))
    throw new Error(`dsStartProcess vazio: ${JSON.stringify(data)}`)
  }

  const row = values[0] || {}

  if (row.status === 'error') {
    throw new Error(row.message || 'dsStartProcess retornou erro')
  }

  if (!row.processInstanceId) {
    throw new Error('dsStartProcess não retornou processInstanceId')
  }

  console.log('[fluigApi] Processo iniciado com sucesso. ProcessInstanceId:', row.processInstanceId)

  return {
    processInstanceId: String(row.processInstanceId),
    protocol: `SUGESTAO-${row.processInstanceId}`
  }
}

async function startWorkflowViaPublicApi(formData, currentUser) {
  const formFields = buildFormFields(formData, currentUser)

  const payloadCandidates = [
    {
      processId: PROCESS_ID,
      targetState: 0,
      assignee: currentUser.login || '',
      comment: '',
      formFields
    },
    {
      processId: PROCESS_ID,
      choosedState: 0,
      colleagueId: currentUser.login || '',
      comments: '',
      cardData: formFields
    },
    {
      processId: PROCESS_ID,
      ...buildStartContentPayload(formData)
    }
  ]

  let lastError = ''

  for (const route of PUBLIC_START_ROUTES) {
    for (const payload of payloadCandidates) {
      try {
        console.log(`[fluigApi] Tentando start via API pública: ${route}`, payload)

        const response = await fetch(route, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const raw = await response.text().catch(() => '')
          lastError = `HTTP ${response.status}${raw ? ` - ${raw}` : ''} @ ${route}`
          continue
        }

        const result = await response.json().catch(() => ({}))
        const processInstanceId = extractProcessInstanceId(result)

        if (processInstanceId) {
          return {
            processInstanceId,
            protocol: `SUGESTAO-${processInstanceId}`
          }
        }

        lastError = `Resposta sem processInstanceId @ ${route}`
      } catch (err) {
        lastError = `${err?.message || String(err)} @ ${route}`
      }
    }
  }

  throw new Error(lastError || 'Falha ao iniciar processo via API pública')
}

async function encryptProcessId(processId) {
  try {
    const response = await fetch(FLUIGHUB_CRYPTO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: 'crypto', passphrase: processId })
    })

    if (!response.ok) {
      throw new Error(`Crypto HTTP ${response.status}`)
    }

    const result = await response.json()

    if (result?.code !== 200 || !result?.message) {
      throw new Error(`Crypto retornou code ${result?.code}: ${result?.message}`)
    }

    console.log('[fluigApi] encryptProcessId - processo criptografado com sucesso')
    return String(result.message)
  } catch (err) {
    console.error('[fluigApi] encryptProcessId - erro:', err)
    throw err
  }
}

async function startWorkflowViaFluigHub(formData, currentUser) {
  // Conforme documentação FluigHub - Endpoint '/movestart-process'
  // O campo 'process' deve ser o processId criptografado via /crypto
  // O campo 'params' deve ser JSON.stringify do objeto com targetState, targetAssignee, comment e formFields

  const formFields = buildFormFields(formData, currentUser)

  console.log('[fluigApi] startWorkflowViaFluigHub - criptografando processId:', PROCESS_ID)
  const encryptedProcessId = await encryptProcessId(PROCESS_ID)

  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR')
  const timeStr = now.toLocaleTimeString('pt-BR')

  // Formato exato conforme documentação FluigHub /movestart-process
  // targetState: 0 = atividade inicial
  // targetAssignee: usuário solicitante (process.bpmn: assignType REQUESTER)
  const body = {
    endpoint: 'start',
    method: 'post',
    params: JSON.stringify({
      targetState: 0,
      targetAssignee: currentUser.login || 'usuario',
      comment: `Sugestão de melhoria aberta em ${dateStr} ${timeStr}`,
      formFields
    }),
    process: encryptedProcessId
  }

  console.log('[fluigApi] startWorkflowViaFluigHub - chamando:', FLUIGHUB_MOVESTART_URL)
  console.log('[fluigApi] startWorkflowViaFluigHub - body (sem params expandido):', {
    endpoint: body.endpoint,
    method: body.method,
    process: body.process,
    paramsPreview: body.params?.substring(0, 120) + '...'
  })

  const response = await fetch(FLUIGHUB_MOVESTART_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  const rawText = await response.text().catch(() => '')

  if (!response.ok) {
    throw new Error(`FluigHub HTTP ${response.status} - ${rawText}`)
  }

  let result
  try {
    result = JSON.parse(rawText)
  } catch (_) {
    throw new Error(`FluigHub retornou resposta não-JSON: ${rawText}`)
  }

  console.log('[fluigApi] startWorkflowViaFluigHub - resposta:', JSON.stringify(result, null, 2))

  if (result?.code !== 200) {
    throw new Error(`FluigHub code ${result?.code}: ${result?.message || rawText}`)
  }

  const parsedMessage = parseJsonSafely(result?.message)
  const processInstanceId = extractProcessInstanceId({ ...result, ...parsedMessage })

  if (!processInstanceId) {
    throw new Error(`FluigHub não retornou processInstanceId. Resposta: ${rawText}`)
  }

  return {
    processInstanceId,
    protocol: `SUGESTAO-${processInstanceId}`
  }
}

export async function startWorkflowProcess(processId, formData) {
  if (!formData) {
    throw new Error('Dados do formulário são obrigatórios')
  }

  if (processId && processId !== PROCESS_ID) {
    console.warn(`[fluigApi] processId '${processId}' ignorado. Usando '${PROCESS_ID}'.`)
  }

  const currentUser = await getCurrentUser()

  // Ordem de tentativas:
  // 1. FluigHub /movestart-process (API documentada, formato correto)
  // 2. dsStartProcess (dataset backend)
  // 3. API Pública Fluig (fallback genérico)

  if (ENABLE_FLUIGHUB_FALLBACK) {
    try {
      console.log('[fluigApi] startWorkflowProcess - tentando FluigHub como método primário')
      return await startWorkflowViaFluigHub(formData, currentUser)
    } catch (hubErr) {
      const hubError = hubErr?.message || String(hubErr)
      console.warn('[fluigApi] FluigHub falhou, tentando dsStartProcess:', hubError)

      try {
        return await startWorkflowViaDataset(formData, currentUser)
      } catch (datasetErr) {
        const datasetError = datasetErr?.message || String(datasetErr)
        console.warn('[fluigApi] dsStartProcess falhou, tentando API pública:', datasetError)

        try {
          return await startWorkflowViaPublicApi(formData, currentUser)
        } catch (publicErr) {
          const publicApiError = publicErr?.message || String(publicErr)
          throw new Error(`FluigHub: ${hubError} | dsStartProcess: ${datasetError} | PublicAPI: ${publicApiError}`)
        }
      }
    }
  }

  // FluigHub desabilitado: usar dataset -> API pública
  try {
    return await startWorkflowViaDataset(formData, currentUser)
  } catch (err) {
    const datasetError = err?.message || String(err)
    console.warn('[fluigApi] dsStartProcess falhou, tentando API pública:', err)

    try {
      return await startWorkflowViaPublicApi(formData, currentUser)
    } catch (publicErr) {
      const publicApiError = publicErr?.message || String(publicErr)
      throw new Error(`dsStartProcess: ${datasetError} | PublicAPI: ${publicApiError}`)
    }
  }
}

export async function submitSuggestion(formData, selectedFile) {
  console.log('[fluigApi] submitSuggestion - iniciando')
  console.log('[fluigApi] submitSuggestion - formData recebido:', JSON.stringify(formData, null, 2))
  console.log('[fluigApi] submitSuggestion - arquivo selecionado:', selectedFile?.name || 'nenhum')

  // Validar campos obrigatórios AQUI também
  if (!formData?.titulo || !formData?.descricao || !formData?.modulo || !formData?.tipo) {
    const missing = [
      !formData?.titulo && 'titulo',
      !formData?.descricao && 'descricao',
      !formData?.modulo && 'modulo',
      !formData?.tipo && 'tipo'
    ].filter(Boolean).join(', ')
    const errMsg = `Campos obrigatórios não preenchidos: ${missing}`
    console.error('[fluigApi] submitSuggestion - ' + errMsg)
    throw new Error(errMsg)
  }

  const payload = {
    ...formData,
    anexoDocumentId: formData.anexoDocumentId || '',
    anexoURL: formData.anexoURL || ''
  }

  console.log('[fluigApi] submitSuggestion - payload antes do upload:', JSON.stringify(payload, null, 2))

  if (selectedFile && !payload.anexoDocumentId) {
    console.log('[fluigApi] submitSuggestion - fazendo upload do arquivo:', selectedFile.name)
    const uploadResult = await uploadFileToFluig(selectedFile)

    if (uploadResult.success) {
      payload.anexoDocumentId = uploadResult.documentId
      payload.anexoURL = uploadResult.downloadURL
      console.log('[fluigApi] submitSuggestion - upload sucesso, documentId:', uploadResult.documentId)
    } else {
      console.warn('[fluigApi] submitSuggestion - upload falhou, continuando sem anexo')
    }
  }

  console.log('[fluigApi] submitSuggestion - payload final a enviar ao startWorkflowProcess:', JSON.stringify(payload, null, 2))
  return startWorkflowProcess(PROCESS_ID, payload)
}

export async function getCurrentUser() {
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
  } catch (_) {}

  return { login: 'usuario', email: '', name: 'Usuário' }
}

export function getDocumentUrl(documentId) {
  if (!documentId) return ''
  return `/api/public/ecm/document/downloadURL/${encodeURIComponent(
    documentId
  )}`
}

export async function queryDataset(datasetName, filters = {}) {
  try {
    const constraints = Object.keys(filters).map((key) =>
      createConstraint(key, filters[key])
    )

    const { values } = await postDataset(datasetName, [], constraints)

    return values
  } catch (error) {
    console.error('[fluigApi] erro dataset:', error)
    return []
  }
}