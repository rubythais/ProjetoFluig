/**
 * validateForm.js - Formulário de Sugestão de Melhorias
 * Validações antes de enviar o formulário
 */

function validateForm(form) {
    var erros = [];
    var mode = form.getFormMode();
    var activity = getValue("WKNumState");
    
    // PAINEL 1: Dados da Sugestão (obrigatórios na criação)
    if (mode === "ADD" || mode === "MOD") {
        
        // 1. Título obrigatório
        var titulo = form.getValue("sugestao_titulo");
        if (!titulo || titulo.trim() === "") {
            erros.push("Campo 'Título da Sugestão' (linha 1) é obrigatório");
        } else if (titulo.length < 10) {
            erros.push("Campo 'Título da Sugestão' deve ter no mínimo 10 caracteres");
        }
        
        // 2. Tipo obrigatório
        var tipo = form.getValue("sugestao_tipo");
        if (!tipo || tipo === "") {
            erros.push("Campo 'Tipo' (linha 1) é obrigatório");
        }
        
        // 3. Módulo obrigatório
        var modulo = form.getValue("sugestao_modulo");
        if (!modulo || modulo.trim() === "") {
            erros.push("Campo 'Módulo/Área Afetada' (linha 2) é obrigatório");
        }
        
        // 4. Descrição obrigatória
        var descricao = form.getValue("sugestao_descricao");
        if (!descricao || descricao.trim() === "") {
            erros.push("Campo 'Descrição Detalhada' (linha 3) é obrigatório");
        } else if (descricao.length < 20) {
            erros.push("Campo 'Descrição Detalhada' deve ter no mínimo 20 caracteres");
        } else if (descricao.length > 2000) {
            erros.push("Campo 'Descrição Detalhada' não pode exceder 2000 caracteres");
        }
    }
    
    // PAINEL 2: Análise e Revisão (validações condicionais em MOD)
    if (mode === "MOD" && activity > 0) {
        
        var status = form.getValue("sugestao_status");
        var justificativa = form.getValue("sugestao_justificativa");
        
        // 5. Status deve ser preenchido na revisão
        if (!status || status === "") {
            erros.push("Campo 'Status' (Painel Análise) é obrigatório na revisão");
        }
        
        // 6. Se status for "aprovado" ou "reprovado", justificativa é obrigatória
        if ((status === "aprovado" || status === "reprovado") && (!justificativa || justificativa.trim() === "")) {
            erros.push("Campo 'Justificativa da Decisão' é obrigatório quando status é Aprovado ou Reprovado");
        }
        
        // 7. Se aprovado, área responsável deve estar preenchida
        if (status === "aprovado") {
            var areaResponsavel = form.getValue("sugestao_area_responsavel");
            if (!areaResponsavel || areaResponsavel.trim() === "") {
                erros.push("Campo 'Área Responsável' é obrigatório quando sugestão é aprovada");
            }
        }
    }
    
    // Se houver erros, lança exceção com mensagens
    if (erros.length > 0) {
        var mensagemFinal = "Por favor, corrija os seguintes erros:\n\n";
        for (var i = 0; i < erros.length; i++) {
            mensagemFinal += "• " + erros[i] + "\n";
        }
        throw mensagemFinal;
    }
}