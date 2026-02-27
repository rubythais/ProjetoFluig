/**
 * ChangelogWidget.js
 * Widget Público do Changelog
 * Exibe as versões publicadas em um layout de Accordion/Collapse
 */

// Estender SuperWidget para criar o widget customizado
var ChangelogWidget = SuperWidget.extend({
	
	// ===== CONFIGURAÇÕES INICIAIS =====
	init: function() {
		// Esta função é chamada quando o widget é inicializado
		this.carregarDadosChangelog();
	},

	// ===== FUNÇÃO PRINCIPAL: CARREGAR DADOS =====
	carregarDadosChangelog: function() {
		// Buscar dados do dataset com filtro e ordenação
		try {
			// Criar constraint para filtrar apenas registros com status = "Publicado"
			var constraint = new Array();
			constraint.push(DatasetFactory.createConstraint("changelog_status", "publicado", "publicado", ConstraintType.MUST));

			// Criar ordenação: campo de data em ordem DECRESCENTE (mais recente primeiro)
			var sortFields = new Array();
			sortFields.push(new SortField("changelog_release_date", SortField.DESC));

			// Buscar dados do dataset "dsThaisChangelog"
			var dataset = DatasetFactory.getDataset("dsThaisChangelog", null, constraint, sortFields);

			// Verificar se retornou dados
			if (dataset && dataset.rowsCount > 0) {
				this.renderizarChangelog(dataset);
			} else {
				// Se não houver dados, mostrar mensagem vazia
				document.getElementById("changelog-list").innerHTML = 
					"<p style='text-align: center; color: #999;'>Nenhuma versão publicada ainda.</p>";
			}
		} catch (error) {
			console.error("Erro ao carregar changelog: " + error);
			document.getElementById("changelog-list").innerHTML = 
				"<p style='color: red;'>Erro ao carregar dados do changelog.</p>";
		}
	},

	// ===== FUNÇÃO: RENDERIZAR CHANGELOG COM ACCORDION =====
	renderizarChangelog: function(dataset) {
		var htmlAccordion = "";

		// Percorrer cada linha do dataset
		for (var i = 0; i < dataset.rowsCount; i++) {
			var row = dataset.getValue(i, 0); // Obter a linha
			
			// Extrair dados da versão
			var versao = dataset.getValue(i, "changelog_version");
			var data = dataset.getValue(i, "changelog_release_date");
			var descricao = dataset.getValue(i, "changelog_description_short");
			var descricaoCompleta = dataset.getValue(i, "changelog_description");
			var categoria = dataset.getValue(i, "changelog_category");
			var imagem = dataset.getValue(i, "changelog_image");

			// Criar ID único para o accordion
			var collapseId = "collapse-v" + versao.replace(/\./g, "-"); // Versão 1.0.0 vira collapse-v1-0-0

			// Construir HTML do painel accordion
			htmlAccordion += this.criarPainelAccordion(
				collapseId,
				versao,
				data,
				descricao,
				descricaoCompleta,
				categoria,
				imagem
			);
		}

		// Injetar HTML na DIV changelog-list
		document.getElementById("changelog-list").innerHTML = htmlAccordion;
	},

	// ===== FUNÇÃO: CRIAR UM PAINEL DO ACCORDION =====
	criarPainelAccordion: function(id, versao, data, descricao, descricaoCompleta, categoria, imagem) {
		var html = "";

		// PAINEL EXTERNO
		html += '<div class="panel panel-default" style="margin-bottom: 15px; border-radius: 4px; border: 1px solid #ddd;">';

		// CABEÇALHO (Título clicável)
		html += '<div class="panel-heading" style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); color: white; cursor: pointer; padding: 15px; border-radius: 4px 4px 0 0;"';
		html += 'onclick="document.getElementById(\'' + id + '\').style.display = (document.getElementById(\'' + id + '\').style.display === \'none\' ? \'block\' : \'none\');">';
		html += '  <h4 style="margin: 0; display: flex; justify-content: space-between; align-items: center;">';
		html += '    <span>' + versao + ' <small style="font-size: 12px;">' + data + '</small></span>';
		html += '    <span style="font-size: 14px;">▼</span>';
		html += '  </h4>';
		html += '</div>';

		// CORPO DO PAINEL (Conteúdo que expande/colapsa)
		html += '<div id="' + id + '" class="panel-body" style="display: none; padding: 20px; background: #f9f9f9;">';

		// Descrição curta
		if (descricao) {
			html += '<p style="margin-bottom: 15px;"><strong>Resumo:</strong> ' + descricao + '</p>';
		}

		// Descrição completa (se houver)
		if (descricaoCompleta) {
			html += '<p style="margin-bottom: 15px;"><strong>Detalhes:</strong></p>';
			html += '<p style="color: #555; line-height: 1.6;">' + descricaoCompleta + '</p>';
		}

		// Categoria (se houver)
		if (categoria) {
			html += '<p style="margin-bottom: 15px;"><strong>Categoria:</strong> <span style="background: #FFF3E0; padding: 4px 8px; border-radius: 4px;">' + categoria + '</span></p>';
		}

		// Imagem (se houver)
		if (imagem) {
			html += '<p style="margin-bottom: 15px;"><strong>Imagem:</strong></p>';
			html += '<img src="' + imagem + '" style="max-width: 100%; height: auto; border-radius: 4px;" alt="Banner da versão ' + versao + '">';
		}

		html += '</div>';
		html += '</div>';

		return html;
	}
});
