function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();
    
    dataset.addColumn("processInstanceId");
    dataset.addColumn("status");
    dataset.addColumn("message");
    
    try {
        // Extrair parâmetros (action/processId são obrigatórios no fluxo)
        var action = getConstraintValue(constraints, "action") || "START";
        var processId = getConstraintValue(constraints, "processId") || "sugestao_melhorias";

        var normalizedAction = String(action).toUpperCase();

        if (normalizedAction === "START" || action === "startProcess") {
            log.info("[dsStartProcess] Iniciando processo: " + processId);
            
            // Obter usuário atual de forma segura
            var currentUserId = "admin";
            try {
                var userService = fluigAPI.getUserService();
                var currentUser = userService.getCurrent();
                if (currentUser && currentUser.getColleagueId()) {
                    currentUserId = currentUser.getColleagueId();
                }
            } catch (userErr) {
                log.warn("[dsStartProcess] Não foi possível obter usuário atual, usando admin: " + userErr);
            }

            // Montar cardData
            var cardData = new java.util.HashMap();
            var fieldNames = [
                "sugestao_titulo", "sugestao_descricao", "sugestao_versao", "sugestao_modulo",
                "sugestao_tipo", "sugestao_impacto", "sugestao_beneficio",
                "anexoDocumentId", "anexoURL", "sugestao_solicitante"
            ];
            for (var i = 0; i < fieldNames.length; i++) {
                var val = getConstraintValue(constraints, fieldNames[i]);
                if (val) {
                    cardData.put(fieldNames[i], val);
                }
            }

            // Próximos responsáveis como ArrayList (obrigatório no Rhino/Fluig)
            var nextColleagues = new java.util.ArrayList();
            nextColleagues.add(currentUserId);

            // Iniciar processo — assinatura: (processAlias, version, startUser, nextUsers, cardData)
            var processService = fluigAPI.getProcessService();
            var processInstance = processService.startProcess(
                processId,
                0,
                currentUserId,
                nextColleagues,
                cardData
            );

            var processInstanceId = processInstance.getProcessInstanceId();
            
            dataset.addRow([
                String(processInstanceId),
                "success",
                "Processo iniciado com sucesso"
            ]);
            
            log.info("[dsStartProcess] Processo criado. ID: " + processInstanceId);
        } else {
            dataset.addRow([
                "",
                "error",
                "Ação inválida para dsStartProcess"
            ]);
        }
    } catch (e) {
        log.error("[dsStartProcess] Erro ao iniciar processo: " + e.toString());
        dataset.addRow([
            "",
            "error",
            "Erro ao iniciar processo: " + e.message
        ]);
    }
    
    return dataset;
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
