/**
 * dsThaisChangelog.js
 * Dataset que expõe dados do Changelog
 */

function createDataset(fields, constraints, sortFields) {
	var dataset = typeof DatasetBuilder !== "undefined" ? DatasetBuilder.newDataset() : {};

	// Colunas do Dataset
	dataset.addColumn("id");                        // ID único do registro
	dataset.addColumn("changelog_version");         // Versão (X.X.X)
	dataset.addColumn("changelog_status");          // Status: rascunho, publicado, arquivado
	dataset.addColumn("changelog_release_date");    // Data de publicação
	dataset.addColumn("changelog_description_short"); // Descrição curta (resumo)
	dataset.addColumn("changelog_description");     // Descrição completa
	dataset.addColumn("changelog_category");        // Categoria principal
	dataset.addColumn("changelog_image");           // Imagem/banner da versão
	dataset.addColumn("createDate");                // Data de criação
	dataset.addColumn("updateDate");                // Data de última atualização
	dataset.addColumn("changes");                   // JSON array das mudanças (tabela pai-filho agregada)

	return dataset;
}
