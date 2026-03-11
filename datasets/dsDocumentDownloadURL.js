/**
 * Dataset: dsDocumentDownloadURL
 * Descrição: Retorna URL pública de download para um documentId
 * Compatível com widgets públicos
 */

function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("documentId");
    dataset.addColumn("downloadURL");
    dataset.addColumn("status");
    dataset.addColumn("message");

    try {

        var documentId = extractDocumentId(constraints);

        if (!documentId) {
            dataset.addRow([
                "",
                "",
                "error",
                "Parâmetro documentId é obrigatório"
            ]);
            return dataset;
        }

        if (!isValidDocumentId(documentId)) {
            dataset.addRow([
                String(documentId),
                "",
                "error",
                "documentId inválido"
            ]);
            return dataset;
        }

        var parsedDocumentId = parseInt(documentId, 10);

        var downloadURL = generatePublicDownloadURL(parsedDocumentId);

        dataset.addRow([
            String(parsedDocumentId),
            String(downloadURL),
            "success",
            "URL gerada com sucesso"
        ]);

        logInfo("[dsDocumentDownloadURL] URL pública gerada para documentId=" + parsedDocumentId);

    } catch (e) {

        logError("[dsDocumentDownloadURL] Erro ao gerar URL: " + e);

        dataset.addRow([
            "",
            "",
            "error",
            "Erro ao gerar downloadURL: " + (e.message || e)
        ]);
    }

    return dataset;
}


/**
 * Extrai documentId das constraints
 */
function extractDocumentId(constraints) {

    var value = getConstraintValue(constraints, "documentId");

    if (!value) {
        return "";
    }

    return String(value).trim();
}


/**
 * Valida se documentId é número
 */
function isValidDocumentId(id) {
    return /^\d+$/.test(id);
}


/**
 * Gera URL pública para widget público
 */
function generatePublicDownloadURL(documentId) {

    try {

        // tentativa usando API Fluig
        var docService = fluigAPI.getDocumentService();
        return docService.getDownloadURL(documentId);

    } catch (e) {

        // fallback para endpoint público
        return "/api/public/ecm/document/downloadURL/" + documentId;
    }
}


/**
 * Helper para pegar constraint
 */
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


/**
 * Logs seguros
 */
function logInfo(msg) {
    try {
        if (log && log.info) log.info(msg);
    } catch (e) {}
}

function logError(msg) {
    try {
        if (log && log.error) log.error(msg);
    } catch (e) {}
}