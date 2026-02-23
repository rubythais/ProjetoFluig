// @ts-nocheck
// quick-lint-js disable
/*global addColumn, DatasetBuilder */
var addColumn = typeof addColumn !== "undefined" ? addColumn : this.addColumn;
var DatasetBuilder =
	typeof DatasetBuilder !== "undefined" ? DatasetBuilder : this.DatasetBuilder;
function defineStructure() {
	addColumn("simbolo");
	addColumn("nomeMoeda");
}

function onSync(lastSyncDate) {
	return [];
}

function createDataset(fields, constraints, sortFields) {
	var ds = DatasetBuilder.newDataset();

	ds.addColumn("simbolo");
	ds.addColumn("nomeMoeda");

	ds.addRow(["R$", "Real"]);
	ds.addRow(["US$", "Dólar Americano"]);
	ds.addRow(["U$", "Dólar Uruguaio"]);

	return ds;
}

function onMobileSync(user) {
	return [];
}