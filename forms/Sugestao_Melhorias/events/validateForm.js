/**
 * validateForm.js - Formulário de Sugestão de Melhorias
 * Validações antes de enviar o formulário
 */

function validateForm(form) {
    var erros = [];
    var mode = form.getFormMode();

    // VALIDAÇÃO NA CRIAÇÃO (ADD): Campos do Painel 1
    if (mode == "ADD") {
        // Título
        var titulo = form.getValue("sugestao_titulo");
        if (titulo == null || titulo == "") {
            erros.push("Campo 'Título da Sugestão' não foi preenchido.");
        }

        // Tipo
        var tipo = form.getValue("sugestao_tipo");
        if (tipo == null || tipo == "") {
            erros.push("Campo 'Tipo' não foi preenchido.");
        }

        // Módulo/Área
        var modulo = form.getValue("sugestao_modulo");
        if (modulo == null || modulo == "") {
            erros.push("Campo 'Módulo/Área Afetada' não foi preenchido.");
        }

        // Descrição Detalhada
        var descricao = form.getValue("sugestao_descricao");
        if (descricao == null || descricao == "") {
            erros.push("Campo 'Descrição Detalhada' não foi preenchido.");
        }
    }

    // VALIDAÇÃO NA EDIÇÃO (MOD): Campos do Painel 2
    if (mode == "MOD") {
        var status = form.getValue("sugestao_status");
        if (status == null || status == "") {
            erros.push("Campo 'Status' não foi preenchido. Defina o status da análise.");
        }
    }

    // Lançar exceção se houver erros
    if (erros.length > 0) {
        throw erros.join("\n");
    }
}