/**
 * validateForm.js - Validação do Formulário Changelog
 * Garante integridade dos dados antes de salvar
 */
function validateForm(form) {
    var erros = [];
    
    // Validar Status (obrigatório)
    var status = form.getValue("changelog_status");
    if (status == null || status == "") {
        erros.push("Campo 'Status' é obrigatório");
    }
    
    // Validar Descrição Curta (obrigatório, máximo 150)
    var descricao = form.getValue("changelog_description_short");
    if (descricao == null || descricao == "") {
        erros.push("Campo 'Descrição Curta' é obrigatório");
    } else if (descricao.length > 150) {
        erros.push("'Descrição Curta' não pode exceder 150 caracteres");
    }
    
    // Validar Data de Publicação (obrigatório)
    var data = form.getValue("changelog_release_date");
    if (data == null || data == "") {
        erros.push("Campo 'Data de Publicação' é obrigatório");
    } else {
        // Validar se data não é no futuro
        var releaseDate = new Date(data);
        var today = new Date();
        if (releaseDate > today) {
            erros.push("'Data de Publicação' não pode ser no futuro");
        }
    }
    
    // Validar Versão (obrigatório, formato X.X.X, deve ser único)
    var versao = form.getValue("changelog_version");
    if (versao == null || versao == "") {
        erros.push("Campo 'Versão' é obrigatório");
    } else {
        // Validar formato de versão (X.X.X)
        if (!versao.match(/^\d+\.\d+\.\d+$/)) {
            erros.push("'Versão' deve estar no formato X.X.X (ex: 1.0.0)");
        }
        
        // Validar unicidade de versão (se não for alteração)
        if (form.getFormMode() !== "EDIT") {
            if (isVersionExists(versao)) {
                erros.push("'Versão' " + versao + " já existe. Versões devem ser únicas");
            }
        }
    }
    
    // Validar Descrição Detalhada (máximo 1000)
    var descricaoDetalhada = form.getValue("changelog_description");
    if (descricaoDetalhada && descricaoDetalhada.length > 1000) {
        erros.push("'Descrição Detalhada' não pode exceder 1000 caracteres");
    }
    
    // Validar Itens de Mudança (ao menos um se status = publicado)
    var linhas = form.getChildrenIndexes("tb_mudancas");
    if (status === "publicado") {
        if (linhas == null || linhas.length == 0) {
            erros.push("Versão publicada deve ter pelo menos um 'Item de Mudança'");
        }
    }
    
    // Validar campos das mudanças
    if (linhas && linhas.length > 0) {
        for (var i = 0; i < linhas.length; i++) {
            var idx = linhas[i];
            var titulo = form.getValue("mudanca_titulo___" + idx);
            var tipo = form.getValue("mudanca_tipo___" + idx);
            
            if (titulo == null || titulo == "") {
                erros.push("Mudança #" + (i + 1) + ": 'Título' é obrigatório");
            }
            
            if (tipo == null || tipo == "") {
                erros.push("Mudança #" + (i + 1) + ": 'Tipo' é obrigatório");
            }
        }
    }
    
    // Lançar erros se houver
    if (erros.length > 0) {
        throw erros.join("\n");
    }
}

/**
 * Verifica se versão já existe no dataset
 */
function isVersionExists(versao) {
    try {
        var c1 = DatasetFactory.createConstraint("changelog_version", versao, versao, ConstraintType.MUST);
        var dataset = DatasetFactory.getDataset("dsThaisChangelog", null, [c1], null);
        return dataset && dataset.rowsCount > 0;
    } catch (e) {
        // Se erro ao validar, deixar passar
        return false;
    }
}