function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();
    
    dataset.addColumn("documentId");                // ID do documento Fluig
    dataset.addColumn("sugestao_titulo");           // Título da sugestão
    dataset.addColumn("sugestao_tipo");             // melhoria, nova_funcionalidade, correcao
    dataset.addColumn("sugestao_modulo");           // Módulo/Área Afetada
    dataset.addColumn("sugestao_impacto");          // baixo, medio, alto
    dataset.addColumn("sugestao_descricao");        // Descrição detalhada
    dataset.addColumn("sugestao_solicitante");      // Nome do solicitante
    dataset.addColumn("sugestao_status");           // em_triagem, em_revisao, aprovado, reprovado, backlog
    dataset.addColumn("sugestao_prioridade");       // p0, p1, p2, p3
    dataset.addColumn("sugestao_area_responsavel"); // Área Responsável
    dataset.addColumn("sugestao_justificativa");    // Justificativa da decisão
    dataset.addColumn("sugestao_versao");           // Versão relacionada
    dataset.addColumn("sugestao_beneficio");        // Benefício principal
    dataset.addColumn("anexoDocumentId");           // DocumentId do anexo
    dataset.addColumn("anexoURL");                  // URL pública do anexo
    dataset.addColumn("data_criacao");              // Data de criação
    dataset.addColumn("data_atualizacao");          // Data de atualização
    
    try {
        var documentId = getConstraintValue(constraints, "documentId");
        var status = getConstraintValue(constraints, "status");
        var tipo = getConstraintValue(constraints, "tipo");
        var solicitante = getConstraintValue(constraints, "solicitante");
        
        var constraints_form = [];
        
        if (documentId) {
            constraints_form.push(DatasetFactory.createConstraint("documentid", documentId, documentId, ConstraintType.MUST));
        }
        
        if (status) {
            constraints_form.push(DatasetFactory.createConstraint("metadata#sugestao_status", status, status, ConstraintType.MUST));
        }
        
        if (tipo) {
            constraints_form.push(DatasetFactory.createConstraint("metadata#sugestao_tipo", tipo, tipo, ConstraintType.MUST));
        }
        
        var dsForm = null;
        var tableNames = ["sugestao", "Sugestao_Melhorias"];

        for (var t = 0; t < tableNames.length; t++) {
            var formConstraints = constraints_form.slice(0);
            formConstraints.push(DatasetFactory.createConstraint("tablename", tableNames[t], tableNames[t], ConstraintType.MUST));
            var current = DatasetFactory.getDataset("document", null, formConstraints, null);

            if (current && current.rowsCount > 0) {
                dsForm = current;
                break;
            }
        }
        
        if (dsForm && dsForm.rowsCount > 0) {
            for (var i = 0; i < dsForm.rowsCount; i++) {
                dataset.addRow([
                    dsForm.getValue(i, "documentid") || "",
                    dsForm.getValue(i, "sugestao_titulo") || "",
                    dsForm.getValue(i, "sugestao_tipo") || "",
                    dsForm.getValue(i, "sugestao_modulo") || "",
                    dsForm.getValue(i, "sugestao_impacto") || "",
                    dsForm.getValue(i, "sugestao_descricao") || "",
                    dsForm.getValue(i, "sugestao_solicitante") || "",
                    dsForm.getValue(i, "sugestao_status") || "em_triagem",
                    dsForm.getValue(i, "sugestao_prioridade") || "",
                    dsForm.getValue(i, "sugestao_area_responsavel") || "",
                    dsForm.getValue(i, "sugestao_justificativa") || "",
                    dsForm.getValue(i, "sugestao_versao") || "",
                    dsForm.getValue(i, "sugestao_beneficio") || "",
                    dsForm.getValue(i, "anexoDocumentId") || "",
                    dsForm.getValue(i, "anexoURL") || "",
                    dsForm.getValue(i, "documentcreationdate") || "",
                    dsForm.getValue(i, "documentlastmodifieddate") || ""
                ]);
            }
        }
        
    } catch (e) {
        safeLog("error", "Erro no dataset dsSugestoes: " + e.toString());
    }
    
    return dataset;
}

/**
 * Função auxiliar para extrair valor de constraint
 */
function getConstraintValue(constraints, fieldName) {
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            if (constraints[i].fieldName == fieldName) {
                return constraints[i].initialValue;
            }
        }
    }
    return null;
}

function safeLog(level, message) {
    try {
        if (typeof log !== "undefined" && log[level]) {
            log[level](message);
        }
    } catch (e) {
    }
}
