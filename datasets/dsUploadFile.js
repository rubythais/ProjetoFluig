var FOLDER_ID = 2000;

function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("documentId");
    dataset.addColumn("downloadURL");
    dataset.addColumn("status");
    dataset.addColumn("message");

    try {

        var params = extractParams(constraints);

        var normalizedAction = String(params.action || "").toUpperCase();

        if (normalizedAction !== "UPLOAD") {
            dataset.addRow(["", "", "error", "Ação inválida"]);
            return dataset;
        }

        if (!params.fileName || !params.fileContent) {
            dataset.addRow(["", "", "error", "fileName ou fileContent ausente"]);
            return dataset;
        }

        logInfo("[dsUploadFile] Upload iniciado: " + params.fileName + " pasta=" + params.folderId);

        var inputStream = decodeBase64ToStream(params.fileContent);

        var result = createDocument(params.folderId, params.fileName, inputStream);

        var downloadURL = resolveDownloadURL(result.documentId);

        dataset.addRow([
            String(result.documentId),
            String(downloadURL),
            "success",
            "Upload realizado com sucesso"
        ]);

        logInfo("[dsUploadFile] Upload concluído documentId=" + result.documentId);

    } catch (e) {

        logError("[dsUploadFile] Erro upload: " + e);

        dataset.addRow([
            "",
            "",
            "error",
            "Erro ao fazer upload: " + (e.message || e)
        ]);
    }

    return dataset;
}


function extractParams(constraints) {

    var folderParam = getConstraintValue(constraints, "folderId");

    return {
        action: getConstraintValue(constraints, "action"),
        fileName: getConstraintValue(constraints, "fileName"),
        fileContent: getConstraintValue(constraints, "fileContent"),
        folderId: folderParam ? parseInt(folderParam) : FOLDER_ID
    };
}


function decodeBase64ToStream(base64Content) {

    try {

        var decoded = org.apache.commons.codec.binary.Base64.decodeBase64(base64Content);
        return new java.io.ByteArrayInputStream(decoded);

    } catch (e) {

        throw "Falha ao decodificar Base64: " + e;
    }
}


function createDocument(folderId, fileName, inputStream) {

    var docService = fluigAPI.getDocumentService();

    var documentDTO = docService.createDocument(
        folderId,
        fileName,
        inputStream,
        "Upload via dataset dsUploadFile",
        "active"
    );

    return {
        documentId: documentDTO.getDocumentId()
    };
}


function resolveDownloadURL(documentId) {

    try {

        var docService = fluigAPI.getDocumentService();
        return docService.getDownloadURL(documentId);

    } catch (e) {

        logWarn("[dsUploadFile] Fallback URL download");

        return "/api/public/ecm/document/downloadURL/" + documentId;
    }
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


function logInfo(msg) {
    try { if (log && log.info) log.info(msg); } catch(e){}
}

function logWarn(msg) {
    try { if (log && log.warn) log.warn(msg); } catch(e){}
}

function logError(msg) {
    try { if (log && log.error) log.error(msg); } catch(e){}
}