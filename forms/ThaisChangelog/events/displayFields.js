/**
 * displayFields.js - Evento Fluig
 * Controla a visibilidade e estado dos campos conforme o modo do formulário
 */

function displayFields(form, customHTML) {
	var mode = form.getFormMode();

	// Modo: VISUALIZAÇÃO (desabilitar todos os campos)
	if (mode === "VIEW") {
		// Painel 1
		form.setEnabled("changelog_status", false);
		form.setEnabled("changelog_release_date", false);
		form.setEnabled("changelog_version", false);
		form.setEnabled("changelog_description_short", false);
		form.setEnabled("changelog_image", false);
		form.setEnabled("changelog_category", false);
		form.setEnabled("changelog_description", false);
		
		// Painel 2 (tabela)
		form.setEnabled("mudanca_tipo", false);
		form.setEnabled("mudanca_titulo", false);
		form.setEnabled("mudanca_detalhes", false);
		form.setEnabled("mudanca_impacto", false);
		form.setEnabled("mudanca_modulo", false);
	}
	// Modo: CRIAÇÃO (pré-selecionar status = "rascunho")
	else if (mode === "ADD") {
		form.setValue("changelog_status", "rascunho");
	}

	form.setHidePrintLink(true);
}
