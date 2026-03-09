/**
 * ESTRUTURA DE DADOS DO CHANGELOG
 * 
 * Este arquivo define a estrutura esperada para o dataset/formulário
 * que alimenta o widget de Changelog.
 */

// ============================================================================
// 1. ESTRUTURA DO DATASET PRINCIPAL: dsChangelog
// ============================================================================

const CHANGELOG_RECORD_SCHEMA = {
    /**
     * Identificador único do registro (gerado automaticamente pelo Fluig)
     * @type {string}
     * @example "12345"
     */
    documentId: "12345",

    // ─────────────────────────────────────────────────────────────────────
    // CAMPOS OBRIGATÓRIOS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Número da versão (obrigatório, único)
     * @type {string}
     * @required
     * @regex /^\d+\.\d+\.\d+$/ (ex.: 2.4.1)
     * @example "2.4.1"
     */
    version: "2.4.1",

    /**
     * Data de publicação da versão
     * @type {date}
     * @required
     * @format YYYY-MM-DD
     * @example "2026-03-04"
     */
    releaseDate: "2026-03-04",

    /**
     * Status do registro
     * @type {enum}
     * @required
     * @values ["rascunho", "publicado", "arquivado"]
     * @default "rascunho"
     * @note: Item não aparece no widget se status != "publicado"
     */
    status: "publicado",

    // ─────────────────────────────────────────────────────────────────────
    // CAMPOS OPCIONAIS - CONTEÚDO
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Sumário/título curto da versão
     * @type {string}
     * @maxLength 200
     * @example "Correções de bugs e melhorias de performance"
     */
    summary: "Correções de bugs e melhorias de performance",

    /**
     * Descrição detalhada (suporta HTML/Markdown)
     * @type {richtext|html}
     * @maxLength 10000
     * @example "<p>Esta versão traz...</p>"
     */
    description: "<p>Esta versão traz melhorias significativas...</p>",

    /**
     * Categoria principal da versão
     * @type {enum|select}
     * @values ["Novidades", "Correções", "Melhorias", "Segurança", "Manutenção"]
     * @example "Correções"
     */
    category: "Correções",

    /**
     * Tags adicionais (separadas por vírgula)
     * @type {string|multiselect}
     * @separator ","
     * @example "Portal,Financeiro,Integração"
     */
    tags: "Portal,Segurança",

    /**
     * Imagem/banner da versão
     * @type {file|url|document_id}
     * @description Referência do documento Fluig ou URL completa
     * @naming_convention "v{version}.{ext}" (ex.: v2.4.1.png)
     * @folder "/changelog-images/"
     * @example "/document/123456" ou "/changelog-images/v2.4.1.png"
     */
    imageRef: "/document/123456",

    /**
     * URL para mais detalhes (página completa da versão)
     * @type {url}
     * @example "https://app.fluig.com/pages/v2.4.1"
     */
    detailsUrl: "https://app.fluig.com/pages/v2.4.1",

    /**
     * Destacar versão (pin) - aparece com badge especial
     * @type {boolean|checkbox}
     * @default false
     * @example true
     */
    isPinned: false,

    // ─────────────────────────────────────────────────────────────────────
    // TABELA FILHA: MUDANÇAS (CHANGES)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Lista de mudanças nesta versão (tabela pai-filho)
     * @type {table}
     * @struct {Object}
     */
    changes: [
        {
            /**
             * Tipo de mudança
             * @type {enum}
             * @values ["novidade", "melhoria", "correção", "segurança", "update"]
             */
            type: "correção",

            /**
             * Título/descrição curta da mudança
             * @type {string}
             * @required
             * @maxLength 150
             */
            title: "Corrigido erro de login em dispositivos móveis",

            /**
             * Detalhes adicionais
             * @type {text}
             * @maxLength 500
             */
            details: "Fixado problema de autenticação mobile via token JWT",

            /**
             * Módulo ou feature afetada
             * @type {string|select}
             * @values ["Portal", "Admin", "Integração", "Relatórios", "Financeiro"]
             */
            module: "Portal",

            /**
             * Nível de impacto da mudança
             * @type {enum}
             * @values ["baixo", "médio", "alto"]
             */
            impact: "médio"
        },
        {
            type: "novidade",
            title: "Novo filtro avançado de relatórios",
            module: "Relatórios",
            impact: "alto"
        }
    ],

    // ─────────────────────────────────────────────────────────────────────
    // CAMPOS DE AUDITORIA (AUTO-PREENCHIDOS)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Usuário que criou o registro
     * @type {user|select}
     * @autoFill true
     */
    createdBy: "admin",

    /**
     * Data de criação
     * @type {datetime}
     * @autoFill true
     */
    createdAt: "2026-03-01 14:30:00",

    /**
     * Usuário que atualizou o registro
     * @type {user|select}
     * @autoFill true
     */
    updatedBy: "admin",

    /**
     * Data da última atualização
     * @type {datetime}
     * @autoFill true
     */
    updatedAt: "2026-03-04 10:15:00"
};

// ============================================================================
// 2. EXEMPLOS DE REGISTROS COMPLETOS
// ============================================================================

const EXAMPLE_RECORDS = [
    {
        documentId: "1001",
        version: "2.4.1",
        releaseDate: "2026-03-04",
        status: "publicado",
        summary: "Correções de bugs e melhorias de performance",
        description: "<p><strong>Highlights:</strong></p><ul><li>Corrigido erro de login mobile</li></ul>",
        category: "Correções",
        tags: "Portal,Segurança",
        imageRef: "/document/1234",
        detailsUrl: "https://app.fluig.com/changelog/v2.4.1",
        isPinned: false,
        changes: [
            {
                type: "correção",
                title: "Corrigido erro de login em dispositivos móveis",
                details: "Problema de autenticação via token JWT",
                module: "Portal",
                impact: "médio"
            }
        ],
        createdBy: "admin",
        createdAt: "2026-03-01 14:30:00",
        updatedBy: "admin",
        updatedAt: "2026-03-04 10:15:00"
    },
    {
        documentId: "1002",
        version: "2.4.0",
        releaseDate: "2026-02-20",
        status: "publicado",
        summary: "Nova interface de relatórios",
        category: "Novidades",
        tags: "Relatórios,Interface",
        isPinned: true,
        changes: [
            {
                type: "novidade",
                title: "Novo filtro avançado de relatórios",
                module: "Relatórios",
                impact: "alto"
            },
            {
                type: "melhoria",
                title: "Exportação mais rápida",
                module: "Relatórios",
                impact: "médio"
            }
        ],
        createdBy: "product_team",
        createdAt: "2026-02-15 09:00:00"
    }
];

// ============================================================================
// 3. ESTRUTURA DO FORMULÁRIO DE SUGESTÕES (BPM)
// ============================================================================

const SUGGESTION_RECORD_SCHEMA = {
    // Identificadores
    protocolId: "SGT-2026-00123",
    processInstanceId: "54321",
    createdAt: "2026-03-04 15:20:00",
    
    // ─────────────────────────────────────────────────────────────────────
    // DADOS DA SUGESTÃO (Preenchidos pelo solicitante)
    // ─────────────────────────────────────────────────────────────────────
    
    titulo: "Adicionar filtro por período no portal",
    descricao: "Seria interessante poder filtrar dados por intervalo de datas...",
    tipo: "melhoria",                    // melhoria | correção | nova_funcionalidade
    modulo: "Portal",                    // campo obrigatório
    impacto: "médio",                    // baixo | médio | alto
    beneficio: "Melhor experiência do usuário",
    anexos: ["document_id_1", "document_id_2"],
    
    // Dados do solicitante (auto-preenchidos)
    solicitante: "john.doe",
    nomeSolicitante: "João da Silva",
    emailSolicitante: "john.doe@company.com",
    
    origem: "widget",                    // widget | interno
    
    // ─────────────────────────────────────────────────────────────────────
    // DADOS DE GESTÃO (Preenchidos na triagem/revisão)
    // ─────────────────────────────────────────────────────────────────────
    
    status: "aberto",
    /*
     * Estados possíveis:
     *  - aberto: Sugestão recém-criada
     *  - em_triagem: Sendo avaliada pela triagem
     *  - aguardando_solicitante: Esperando complementação
     *  - em_revisao: Sendo revisada pelo comitê
     *  - aprovado: Aprovada para implementação
     *  - backlog: Aprovada mas não priorizada
     *  - reprovado: Rejeitada
     *  - finalizado: Processo encerrado
     */
    
    // Triagem
    categoriaTriagem: "Feature",         // Classificação interna
    duplicadoDe: null,                   // ID se duplicada
    statusTriagem: "pendente",           // pendente | validada | incompleta
    observacoesTriagem: "",
    responsavelTriagem: "triagem_team",
    dataTriagem: null,
    
    // Complementação (se necessário)
    dataComplementacaoSolicitado: null,
    prazoDias: 3,
    statusComplementacao: null,          // em_progresso | respondida | sem_retorno
    
    // Revisão/Aprovação
    prioridade: null,                    // P0 | P1 | P2 | P3
    decisao: null,                       // aprovar | reprovar | backlog
    justificativaDecisao: "",
    responsavelArea: null,               // Gerente/PO responsável
    estimativaAlta: null,                // horas estimadas
    prazoSugerido: null,                 // data sugerida
    linkItemInterno: null,               // Link para card/tarefa interna
    
    dataAprovacao: null,
    aprovadoPor: null,
    
    // ─────────────────────────────────────────────────────────────────────
    // AUDITORIA
    // ─────────────────────────────────────────────────────────────────────
    
    historico: [
        {
            timestamp: "2026-03-04 15:20:00",
            acao: "created",
            usuario: "john.doe",
            detalhes: "Sugestão criada via widget"
        },
        {
            timestamp: "2026-03-05 09:00:00",
            acao: "triagem_received",
            usuario: "triagem_team",
            detalhes: "Encaminhada para triagem"
        }
    ]
};

// ============================================================================
// 4. VALIDAÇÕES E REGRAS DE NEGÓCIO
// ============================================================================

const VALIDATION_RULES = {
    changelog: {
        version: {
            required: true,
            unique: true,
            pattern: /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/,
            message: "Versão deve estar no formato X.Y.Z (ex.: 2.4.1)"
        },
        releaseDate: {
            required: true,
            type: "date",
            maxFutureDate: 0,
            message: "Data não pode ser no futuro"
        },
        status: {
            required: true,
            enum: ["rascunho", "publicado", "arquivado"],
            message: "Status inválido"
        },
        summary: {
            maxLength: 200,
            message: "Sumário não pode exceder 200 caracteres"
        }
    },
    
    suggestion: {
        titulo: {
            required: true,
            minLength: 10,
            maxLength: 200,
            message: "Título deve ter entre 10 e 200 caracteres"
        },
        descricao: {
            required: true,
            minLength: 20,
            maxLength: 5000,
            message: "Descrição deve ter entre 20 e 5000 caracteres"
        },
        modulo: {
            required: true,
            message: "Módulo é obrigatório"
        },
        tipo: {
            required: true,
            enum: ["melhoria", "correção", "nova_funcionalidade"],
            message: "Tipo inválido"
        }
    }
};

// ============================================================================
// 5. ENUMERAÇÕES E CONSTANTES
// ============================================================================

const ENUMS = {
    // Tipos de mudança
    CHANGE_TYPES: {
        novidade: "Novidade",
        melhoria: "📈 Melhoria",
        correção: "🐛 Correção",
        segurança: "🔒 Segurança",
        update: "Atualização"
    },
    
    // Categorias de versão
    CATEGORIES: {
        "Novidades": "Novas funcionalidades",
        "Correções": "Bug fixes",
        "Melhorias": "Performance e UX",
        "Segurança": "Security patches",
        "Manutenção": "Maintenance"
    },
    
    // Módulos
    MODULES: {
        "Portal": "Portal do usuário",
        "Admin": "Painel administrativo",
        "Integração": "APIs e integrações",
        "Relatórios": "Sistema de relatórios",
        "Financeiro": "Módulo financeiro"
    },
    
    // Níveis de impacto
    IMPACT_LEVELS: {
        "baixo": "Impacto mínimo",
        "médio": "Impacto moderado",
        "alto": "Impacto significativo"
    },
    
    // Status de sugestão
    SUGGESTION_STATUS: {
        "aberto": "Sugestão aberta",
        "em_triagem": "Em triagem",
        "aguardando_solicitante": "Aguardando resposta",
        "em_revisao": "Em revisão",
        "aprovado": "Aprovado",
        "backlog": "Em backlog",
        "reprovado": "Reprovado",
        "finalizado": "Finalizado"
    },
    
    // Prioridades
    PRIORITIES: {
        "P0": "Crítica (24h)",
        "P1": "Muito alta (3d)",
        "P2": "Alta (1s)",
        "P3": "Normal (2s)"
    }
};

// ============================================================================
// 6. FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Converte tags string para array
 * @param {string} tags - Tags separadas por vírgula
 * @returns {Array<string>}
 */
function parseTags(tags) {
    if (!tags) return [];
    return tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}

/**
 * Converte array de tags para string
 * @param {Array<string>} tagArray - Array de tags
 * @returns {string}
 */
function stringifyTags(tagArray) {
    return (tagArray || []).join(', ');
}

/**
 * Valida versão
 * @param {string} version - Versão a validar
 * @returns {boolean}
 */
function isValidVersion(version) {
    const pattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9]+)?$/;
    return pattern.test(version);
}

/**
 * Compara duas versões
 * @param {string} v1 - Primeira versão
 * @param {string} v2 - Segunda versão
 * @returns {number} -1 se v1 < v2, 0 se iguais, 1 se v1 > v2
 */
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
        if (parts1[i] > parts2[i]) return 1;
        if (parts1[i] < parts2[i]) return -1;
    }
    return 0;
}

// ============================================================================
// EXPORT (para uso em outros arquivos)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CHANGELOG_RECORD_SCHEMA,
        SUGGESTION_RECORD_SCHEMA,
        VALIDATION_RULES,
        ENUMS,
        EXAMPLE_RECORDS,
        parseTags,
        stringifyTags,
        isValidVersion,
        compareVersions
    };
}
