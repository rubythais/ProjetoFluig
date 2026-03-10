var FOLDER_ID = 2000;

function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();
    
    dataset.addColumn("documentId");
    dataset.addColumn("downloadURL");
    dataset.addColumn("status");
    dataset.addColumn("message");
    
    try {
        var action = getConstraintValue(constraints, "action");
        var fileName = getConstraintValue(constraints, "fileName");
        var fileContent = getConstraintValue(constraints, "fileContent");
        var folderIdParam = getConstraintValue(constraints, "folderId");
        var folderId = folderIdParam ? parseInt(folderIdParam) : FOLDER_ID;
        
        if (action === "upload" && fileName && fileContent) {
            log.info("[dsUploadFile] Iniciando upload: " + fileName + " na pasta " + folderId);
            
            var decoded = org.apache.commons.codec.binary.Base64.decodeBase64(fileContent);
            var inputStream = new java.io.ByteArrayInputStream(decoded);
            
            var docService = fluigAPI.getDocumentService();
            var documentDTO = docService.createDocument(
                folderId,
                fileName,
                inputStream,
                "Anexo de sugestão de melhoria",
                "active"
            );
            
            var docId = documentDTO.getDocumentId();
            
            var downloadURL = "";
            try {
                downloadURL = docService.getDownloadURL(docId);
            } catch (urlErr) {
                log.warn("[dsUploadFile] Não foi possível obter URL pública: " + urlErr);
                downloadURL = "/api/public/ecm/document/downloadURL/" + docId;
            }
            
            dataset.addRow([
                String(docId),
                String(downloadURL),
                "success",
                "Upload realizado com sucesso"
            ]);
            
            log.info("[dsUploadFile] Upload concluído. DocumentId: " + docId + " URL: " + downloadURL);
        } else {
            dataset.addRow([
                "",
                "",
                "error",
                "Parâmetros inválidos (action, fileName ou fileContent ausentes)"
            ]);
        }
    } catch (e) {
        log.error("[dsUploadFile] Erro no upload: " + e.toString());
        dataset.addRow([
            "",
            "",
            "error",
            "Erro ao fazer upload: " + e.message
        ]);
    }
    
    return dataset;
}

/**
 * Helper para extrair valor de constraint
 */
function getConstraintValue(constraints, fieldName) {
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            if (constraints[i].fieldName === fieldName || constraints[i]._field === fieldName) {
                return constraints[i].initialValue || constraints[i]._initialValue || "";
            }
        }
    }
    return "";
}
