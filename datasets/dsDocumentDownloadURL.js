/**
 * Dataset: dsDocumentDownloadURL
 * Descrição: Retorna URL pública de download para um documentId
 */

function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();
    dataset.addColumn("documentId");
    dataset.addColumn("downloadURL");
    dataset.addColumn("status");
    dataset.addColumn("message");

    try {
        var documentId = String(getConstraintValue(constraints, "documentId") || "").trim();

        if (!documentId) {
            dataset.addRow(["", "", "error", "Parâmetro documentId é obrigatório"]);
            return dataset;
        }

        if (!/^\d+$/.test(documentId)) {
            dataset.addRow([String(documentId), "", "error", "documentId inválido"]);
            return dataset;
        }

        var parsedDocumentId = parseInt(documentId, 10);

        var downloadURL = fluigAPI.getDocumentService().getDownloadURL(parsedDocumentId);

        dataset.addRow([
            String(parsedDocumentId),
            String(downloadURL),
            "success",
            "URL gerada com sucesso"
        ]);
    } catch (e) {
        dataset.addRow(["", "", "error", "Erro ao gerar downloadURL: " + e.message]);
    }

    return dataset;
}

function getConstraintValue(constraints, fieldName) {
    if (!constraints) return "";

    for (var i = 0; i < constraints.length; i++) {
        var c = constraints[i];
        if (c.fieldName === fieldName || c._field === fieldName) {
            return c.initialValue || c._initialValue || c.value || "";
        }
    }

    return "";
}