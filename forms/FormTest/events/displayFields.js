/**
 * Controla a exibição dos campos do formulário
 */

function displayFields(form, customHTML) {
    var activity = getValue("WKNumState");
    var mode = form.getFormMode();
    
    // form.getFormMode() retorna:
    // 'ADD' - Modo de criação
    // 'MOD' - Modo de edição
    // 'VIEW' - Modo de visualização
    
    // Exemplo: desabilitar todos os campos no modo de visualização
    if (mode == 'VIEW') {
        form.setEnabled("campo_nome", false);
        form.setEnabled("campo_email", false);
        form.setEnabled("data_nascimento", false);
        form.setEnabled("campo_telefone", false);
        form.setEnabled("campo_cpf", false);
        form.setEnabled("campo_data_consulta", false);
        form.setEnabled("campo_especialidade", false);
        form.setEnabled("campo_tipo_consulta", false);
        form.setEnabled("campo_texto", false);
    }
    
    log.info("Formulário carregado no modo: " + mode);
}
