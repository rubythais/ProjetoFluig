/**
 * displayFields.js - Formulário de Sugestão de Melhorias
 * Controla a visibilidade e estado dos campos conforme o modo do formulário
 */

function displayFields(form, customHTML) {
	var mode = form.getFormMode();
	var activity = form.getActivity();

	// Modo: VISUALIZAÇÃO (desabilitar todos os campos)
	if (mode === "VIEW") {
		// Painel 1: Dados da Sugestão
		form.setEnabled("sugestao_titulo", false);
		form.setEnabled("sugestao_tipo", false);
		form.setEnabled("sugestao_modulo", false);
		form.setEnabled("sugestao_impacto", false);
		form.setEnabled("sugestao_descricao", false);
		form.setEnabled("sugestao_solicitante", false);
		
		// Painel 2: Análise e Revisão
		form.setEnabled("sugestao_status", false);
		form.setEnabled("sugestao_prioridade", false);
		form.setEnabled("sugestao_area_responsavel", false);
		form.setEnabled("sugestao_justificativa", false);
	}

	// Modo: CRIAÇÃO (atividade inicial)
	if (mode === "ADD") {
		// Preencher nome do solicitante automaticamente
		var usuario = getValue("WKUser");
		form.setValue("sugestao_solicitante", usuario);
		
		// Painel 2 visível, mas desabilitado (apenas usuário vê, não edita)
		form.setEnabled("sugestao_status", false);
		form.setEnabled("sugestao_prioridade", false);
		form.setEnabled("sugestao_area_responsavel", false);
		form.setEnabled("sugestao_justificativa", false);
	}

	// Modo: EDIÇÃO (atividades subsequentes)
	if (mode === "MOD") {
		// Bloquear campos do Painel 1 (dados do solicitante) após criação
		form.setEnabled("sugestao_titulo", false);
		form.setEnabled("sugestao_tipo", false);
		form.setEnabled("sugestao_modulo", false);
		form.setEnabled("sugestao_impacto", false);
		form.setEnabled("sugestao_descricao", false);
		form.setEnabled("sugestao_solicitante", false);
		
		// Liberar Painel 2 para análise (campos editáveis pela equipe)
		form.setEnabled("sugestao_status", true);
		form.setEnabled("sugestao_prioridade", true);
		form.setEnabled("sugestao_area_responsavel", true);
		form.setEnabled("sugestao_justificativa", true);
	}

	// Ocultar link de impressão
	form.setHidePrintLink(true);
}
