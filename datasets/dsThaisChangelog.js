function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("id");                        
    dataset.addColumn("changelog_version");         
    dataset.addColumn("changelog_status");          
    dataset.addColumn("changelog_release_date");    
    dataset.addColumn("changelog_description_short"); 
    dataset.addColumn("changelog_description");     
    dataset.addColumn("changelog_category");        
    dataset.addColumn("changelog_image");           
    dataset.addColumn("changelog_tags");            
    dataset.addColumn("createDate");                
    dataset.addColumn("updateDate");                
    dataset.addColumn("changes");                   

    try {
        var documentId = getConstraintValue(constraints, "documentId");
        var status = getConstraintValue(constraints, "status") || "publicado";
        var version = getConstraintValue(constraints, "version");
        
        var c1 = DatasetFactory.createConstraint("tablename", "ThaisChangelog", "ThaisChangelog", ConstraintType.MUST);
        var constraintsForm = [c1];
        
        if (documentId) {
            constraintsForm.push(DatasetFactory.createConstraint("documentid", documentId, documentId, ConstraintType.MUST));
        }
        
        if (status) {
            constraintsForm.push(DatasetFactory.createConstraint("metadata#changelog_status", status, status, ConstraintType.MUST));
        }
        
        if (version) {
            constraintsForm.push(DatasetFactory.createConstraint("metadata#changelog_version", version, version, ConstraintType.MUST));
        }
        
        var dsForm = DatasetFactory.getDataset("document", null, constraintsForm, null);
        
        if (dsForm && dsForm.rowsCount > 0) {
            log("[dsThaisChangelog] Encontrados " + dsForm.rowsCount + " registros");
            
            for (var i = 0; i < dsForm.rowsCount; i++) {
                var docId = dsForm.getValue(i, "documentid");
                
                var changes = getChangesFromChildTable(docId);
                
                dataset.addRow([
                    docId,
                    dsForm.getValue(i, "changelog_version") || "",
                    dsForm.getValue(i, "changelog_status") || "rascunho",
                    dsForm.getValue(i, "changelog_release_date") || "",
                    dsForm.getValue(i, "changelog_description_short") || "",
                    dsForm.getValue(i, "changelog_description") || "",
                    dsForm.getValue(i, "changelog_category") || "",
                    dsForm.getValue(i, "changelog_image") || "",
                    "", // tags (não implementado ainda)
                    dsForm.getValue(i, "documentcreationdate") || "",
                    dsForm.getValue(i, "documentlastmodifieddate") || "",
                    JSON.stringify(changes)
                ]);
            }
        } else {
            log("[dsThaisChangelog] Nenhum registro encontrado. Retornando dados de exemplo.");
            
            dataset.addRow([
                "exemplo_1",
                "2.4.2",
                "publicado",
                "2026-03-05",
                "Melhorias de performance e segurança",
                "Release com otimizações no widget e correções de vulnerabilidades.",
                "manutencao",
                "",
                "performance,seguranca",
                "2026-03-05T10:00:00Z",
                "2026-03-05T15:30:00Z",
                JSON.stringify([
                    {
                        type: "melhoria",
                        title: "Otimização de cache",
                        details: "Implementado cache de 10 minutos para dados do changelog",
                        impact: "alto",
                        module: "Widget"
                    },
                    {
                        type: "correcao",
                        title: "Corrigido problema de responsividade",
                        details: "Ajustado CSS para mobile",
                        impact: "medio",
                        module: "Frontend"
                    }
                ])
            ]);
            
            dataset.addRow([
                "exemplo_2",
                "2.4.1",
                "publicado",
                "2026-03-01",
                "Integração com Vue 3 concluída",
                "Componente ChangelogList totalmente integrado com o widget Fluig.",
                "novidades",
                "",
                "vue,frontend",
                "2026-03-01T09:00:00Z",
                "2026-03-01T14:20:00Z",
                JSON.stringify([
                    {
                        type: "novidade",
                        title: "Widget Vue 3",
                        details: "Migração completa para Vue 3 com Composition API",
                        impact: "alto",
                        module: "Frontend"
                    }
                ])
            ]);
            
            dataset.addRow([
                "exemplo_3",
                "2.4.0",
                "publicado",
                "2026-02-15",
                "Versão inicial com Widget e Changelog",
                "Primeira release do sistema de changelog integrado ao Fluig.",
                "novidades",
                "",
                "inicial,lancamento",
                "2026-02-15T08:00:00Z",
                "2026-02-15T10:00:00Z",
                JSON.stringify([
                    {
                        type: "novidade",
                        title: "Sistema de Changelog",
                        details: "Implementação inicial do sistema de versionamento",
                        impact: "alto",
                        module: "Sistema"
                    }
                ])
            ]);
        }
        
    } catch (error) {
        log("[dsThaisChangelog] Erro: " + error.message);
        log("[dsThaisChangelog] Stack: " + error.stack);
    }

    return dataset;
}


function getChangesFromChildTable(documentId) {
    var changes = [];
    
    try {
        var c1 = DatasetFactory.createConstraint("tablename", "tb_mudancas", "tb_mudancas", ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("metadata#parentDocumentId", documentId, documentId, ConstraintType.MUST);
        
        var dsChild = DatasetFactory.getDataset("document", null, [c1, c2], null);
        
        if (dsChild && dsChild.rowsCount > 0) {
            for (var i = 0; i < dsChild.rowsCount; i++) {
                changes.push({
                    type: dsChild.getValue(i, "mudanca_tipo") || "melhoria",
                    title: dsChild.getValue(i, "mudanca_titulo") || "",
                    details: dsChild.getValue(i, "mudanca_detalhes") || "",
                    impact: dsChild.getValue(i, "mudanca_impacto") || "medio",
                    module: dsChild.getValue(i, "mudanca_modulo") || ""
                });
            }
        }
    } catch (e) {
        log("[dsThaisChangelog] Erro ao buscar tabela pai-filho: " + e.message);
    }
    
    return changes;
}


function getConstraintValue(constraints, key) {
    if (!constraints || constraints.length === 0) return null;
    
    for (var i = 0; i < constraints.length; i++) {
        if (constraints[i].fieldName === key) {
            return constraints[i].initialValue || constraints[i].value;
        }
    }
    return null;
}


function log(message) {
    try {
        if (typeof console !== "undefined" && console.log) {
            console.log(message);
        }
    } catch (e) {
    }
}
