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
    dataset.addColumn("data_criacao");              // Data de criação
    dataset.addColumn("data_atualizacao");          // Data de atualização
    
    try {
        var documentId = getConstraintValue(constraints, "documentId");
        var status = getConstraintValue(constraints, "status");
        var tipo = getConstraintValue(constraints, "tipo");
        var solicitante = getConstraintValue(constraints, "solicitante");
        
        var c1 = DatasetFactory.createConstraint("tablename", "sugestao", "sugestao", ConstraintType.MUST);
        var constraints_form = [c1];
        
        if (documentId) {
            constraints_form.push(DatasetFactory.createConstraint("documentid", documentId, documentId, ConstraintType.MUST));
        }
        
        if (status) {
            constraints_form.push(DatasetFactory.createConstraint("metadata#sugestao_status", status, status, ConstraintType.MUST));
        }
        
        if (tipo) {
            constraints_form.push(DatasetFactory.createConstraint("metadata#sugestao_tipo", tipo, tipo, ConstraintType.MUST));
        }
        
        var dsForm = DatasetFactory.getDataset("document", null, constraints_form, null);
        
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
                    dsForm.getValue(i, "documentcreationdate") || "",
                    dsForm.getValue(i, "documentlastmodifieddate") || ""
                ]);
            }
        } else {
            dataset.addRow([
                "1",
                "Melhorar performance do dashboard principal",
                "melhoria",
                "Dashboard",
                "alto",
                "O dashboard demora muito para carregar quando há muitos registros. Seria interessante implementar paginação ou lazy loading.",
                "João Silva",
                "em_triagem",
                "p1",
                "",
                "",
                "2026-01-15 10:30:00",
                "2026-01-15 10:30:00"
            ]);
            
            dataset.addRow([
                "2",
                "Adicionar filtro avançado nos relatórios",
                "nova_funcionalidade",
                "Relatórios",
                "medio",
                "Incluir opção de filtrar relatórios por múltiplos critérios simultâneos (data, usuário, status, módulo).",
                "Maria Santos",
                "em_revisao",
                "p2",
                "Desenvolvimento",
                "Funcionalidade aprovada para próxima sprint. Benefício claro para usuários.",
                "2026-01-14 09:15:00",
                "2026-01-17 16:45:00"
            ]);
            
            dataset.addRow([
                "3",
                "Corrigir problema de logout automático",
                "correcao",
                "Login",
                "alto",
                "Usuários estão sendo deslogados automaticamente após 5 minutos de inatividade, quando o esperado seria 30 minutos.",
                "Carlos Souza",
                "aprovado",
                "p0",
                "Infraestrutura",
                "Bug crítico identificado. Problema na configuração do timeout de sessão. Será corrigido na próxima manutenção.",
                "2026-01-10 14:20:00",
                "2026-01-12 11:30:00"
            ]);
        }
        
    } catch (e) {
        log.error("Erro no dataset dsSugestoes: " + e.toString());
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
