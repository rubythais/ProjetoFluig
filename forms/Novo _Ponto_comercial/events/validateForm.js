function validateForm(form){
    var msg = "";

    /*Requisitante*/
	
	if (form.getValue("requisitanteNome") == "" || form.getValue("requisitanteNome") == null){
    	msg += "O campo Nome do Requisitante é obrigatório.\n";
    }
    if (form.getValue("requisitanteEmail") == "" || form.getValue("requisitanteEmail") == null){
    	msg += "O campo E-mail do Requisitante é obrigatório.\n";
    }
    
    /*Financeiro*/
    if (form.getValue("moedaFinanceira") == "" || form.getValue("moedaFinanceira") == null){
    	msg += "O campo Moeda é obrigatório.\n";
    }
    if (form.getValue("valor") == "" || form.getValue("valor") == null){
    	msg += "O campo Valor é obrigatório.\n";
    }

    if (msg != ""){
        throw msg;
    }
}