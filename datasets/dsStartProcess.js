function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();
    
    dataset.addColumn("processInstanceId");
    dataset.addColumn("status");
    dataset.addColumn("message");
    
    try {
        // Extrair parâmetros (action/processId são obrigatórios no fluxo)
        var action = getConstraintValue(constraints, "action") || "START";
        var processId = getConstraintValue(constraints, "processId") || "sugestao_melhorias";

        safeLog("info", "[dsStartProcess] Iniciando processamento. Action: " + action + ", ProcessId: " + processId);
        safeLog("info", "[dsStartProcess] Total de constraints recebidas: " + (constraints ? constraints.length : 0));

        var normalizedAction = String(action).toUpperCase();

        if (normalizedAction === "START" || normalizedAction === "STARTPROCESS") {
            safeLog("info", "[dsStartProcess] Ação reconhecida como START/STARTPROCESS");
            
            // Priorizar usuário vindo do widget (mais confiável para dataset chamado via API)
            var currentUserId = getConstraintValue(constraints, "startUserId") || "";

            // Fallback: tentar contexto do Fluig
            if (!currentUserId) {
                try {
                    var userService = fluigAPI.getUserService();
                    var currentUser = userService.getCurrent();
                    if (currentUser && currentUser.getColleagueId()) {
                        currentUserId = currentUser.getColleagueId();
                    }
                } catch (userErr) {
                    safeLog("warn", "[dsStartProcess] Não foi possível obter usuário via getCurrent: " + userErr);
                }
            }

            // Último fallback (evitar valor vazio)
            if (!currentUserId) {
                currentUserId = "adm";
            }

            safeLog("info", "[dsStartProcess] Usuário iniciador confirmado: " + currentUserId);

            // Montar cardData
            var cardData = new java.util.HashMap();
            var fieldMap = {
                "sugestao_titulo": "titulo",
                "sugestao_descricao": "descricao",
                "sugestao_versao": "versao",
                "sugestao_modulo": "modulo",
                "sugestao_tipo": "tipo",
                "sugestao_impacto": "impacto",
                "sugestao_beneficio": "beneficio",
                "anexoDocumentId": "anexoDocumentId",
                "anexoURL": "anexoURL",
                "sugestao_solicitante": "sugestao_solicitante"
            };

            for (var key in fieldMap) {
                if (!fieldMap.hasOwnProperty(key)) {
                    continue;
                }

                var val = getMappedConstraintValue(constraints, key, fieldMap[key]);
                cardData.put(key, val || "");
                safeLog("debug", "[dsStartProcess] Campo '" + key + "' = '" + (val || "(vazio)") + "'");
            }

            safeLog("info", "[dsStartProcess] CardData montado com " + cardData.size() + " campos");

            // Próximos responsáveis como ArrayList (obrigatório no Rhino/Fluig)
            var nextColleagues = new java.util.ArrayList();
            nextColleagues.add(currentUserId);

            // Iniciar processo — assinatura completa:
            // startProcess(processId, version, userId, nextUsers, comment, cardData, attachments)
            safeLog("info", "[dsStartProcess] Chamando processService.startProcess com parametros: processId=" + processId + ", version=0, userId=" + currentUserId);
            
            var processService = fluigAPI.getProcessService();
            var processInstance = processService.startProcess(
                processId,
                0,
                currentUserId,
                nextColleagues,
                "",
                cardData,
                null
            );

            var processInstanceId = "";
            if (processInstance) {
                if (typeof processInstance.getProcessInstanceId === "function") {
                    processInstanceId = processInstance.getProcessInstanceId();
                } else if (typeof processInstance.getInstanceId === "function") {
                    processInstanceId = processInstance.getInstanceId();
                } else if (processInstance.processInstanceId) {
                    processInstanceId = processInstance.processInstanceId;
                }
            }

            if (!processInstanceId) {
                safeLog("error", "[dsStartProcess] startProcess não retornou um ID válido");
                throw "startProcess não retornou processInstanceId";
            }
            
            dataset.addRow([
                String(processInstanceId),
                "success",
                "Processo iniciado com sucesso"
            ]);
            
            safeLog("info", "[dsStartProcess] Processo criado com sucesso. processId=" + processId + ", instanceId=" + processInstanceId);
        } else {
            safeLog("error", "[dsStartProcess] Ação inválida: " + action);
            dataset.addRow([
                "",
                "error",
                "Ação inválida para dsStartProcess: " + action
            ]);
        }
    } catch (e) {
        safeLog("error", "[dsStartProcess] Erro ao iniciar processo: " + e.toString());
        dataset.addRow([
            "",
            "error",
            "Erro ao iniciar processo: " + (e.message || e)
        ]);
    }
    
    return dataset;
}

function safeLog(level, message) {
    try {
        if (typeof log !== "undefined" && log[level]) {
            log[level](message);
        } else if (typeof log !== "undefined" && log.info) {
            // Fallback para info se o level não existir
            log.info("[" + level.toUpperCase() + "] " + message);
        }
    } catch (e) {
        // Silent fail
    }
}

/**
 * Helper para extrair valor de constraint
 */
function getConstraintValue(constraints, fieldName) {
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            var c = constraints[i];
            if (c.fieldName === fieldName || c._field === fieldName) {
                return c.initialValue || c._initialValue || c.value || "";
            }
        }
    }
    return "";
}

function getMappedConstraintValue(constraints, primaryField, fallbackField) {
    var primary = getConstraintValue(constraints, primaryField);
    if (primary) {
        return primary;
    }

    if (fallbackField) {
        return getConstraintValue(constraints, fallbackField);
    }

    return "";
}
