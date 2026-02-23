/**
 * Validação do formulário de Agendamento de Consulta Médica
 * Este arquivo é processado pelo Fluig e valida os campos antes do envio
 */

function validateForm(form) {
    var msg = "";
    var hasError = false;
    
    // Validação do campo Nome
    if (form.getValue("campo_nome") == null || form.getValue("campo_nome").trim() == "") {
        msg += "O campo 'Nome' é obrigatório.\n";
        hasError = true;
    }
    
    // Validação do campo Email
    var email = form.getValue("campo_email");
    if (email == null || email.trim() == "") {
        msg += "O campo 'Email' é obrigatório.\n";
        hasError = true;
    } else {
        // Valida formato do email
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            msg += "O campo 'Email' deve estar em um formato válido (exemplo@email.com).\n";
            hasError = true;
        }
    }
    
    // Validação da Data de Nascimento
    if (form.getValue("data_nascimento") == null || form.getValue("data_nascimento").trim() == "") {
        msg += "O campo 'Data de Nascimento' é obrigatório.\n";
        hasError = true;
    }
    
    // Validação do campo Telefone
    if (form.getValue("campo_telefone") == null || form.getValue("campo_telefone").trim() == "") {
        msg += "O campo 'Telefone' é obrigatório.\n";
        hasError = true;
    }
    
    // Validação do campo CPF
    var cpf = form.getValue("campo_cpf");
    if (cpf == null || cpf.trim() == "") {
        msg += "O campo 'CPF' é obrigatório.\n";
        hasError = true;
    }
    
    // Se houver erros, lança exceção com todas as mensagens
    if (hasError) {
        throw "⚠ ERROS DE VALIDAÇÃO:\n\n" + msg + "\nPor favor, corrija os campos acima antes de enviar o formulário.";
    }
}
