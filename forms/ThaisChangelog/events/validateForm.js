function validateForm(form) {
    var erros = [];
    
    var status = form.getValue("changelog_status");
    if (status == null || status == "") {
        erros.push("Campo 'Status' não foi preenchido");
    }
    
    var descricao = form.getValue("changelog_description_short");
    if (descricao == null || descricao == "") {
        erros.push("Campo 'Descrição Curta' não foi preenchido");
    }
    
    var data = form.getValue("changelog_release_date");
    if (data == null || data == "") {
        erros.push("Campo 'Data de Publicação' não foi preenchido");
    }
    
    var versao = form.getValue("changelog_version");
    if (versao == null || versao == "") {
        erros.push("Campo 'Versão' não foi preenchido");
    }

    var linhas = form.getChildrenIndexes("tb_mudancas");
    
    if (linhas == null || linhas.length == 0) {
        erros.push("Campo 'Itens de Mudança' não foi preenchido (adicione pelo menos uma mudança)");
    } else {
        for (var i = 0; i < linhas.length; i++) {
            var idx = linhas[i];
            var titulo = form.getValue("mudanca_titulo___" + idx);
            
            if (titulo == null || titulo == "") {
                erros.push("Campo 'Título' - Mudança #" + (i + 1) + " não foi preenchido");
            }
        }
    }
    
    if (erros.length > 0) {
        throw erros.join("\n");
    }
}