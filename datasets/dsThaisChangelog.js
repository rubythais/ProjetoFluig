function createDataset(fields, constraints, sortFields) {

    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("id");
    dataset.addColumn("changelog_version");
    dataset.addColumn("changelog_status");
    dataset.addColumn("changelog_release_date");
    dataset.addColumn("changelog_description_short");
    dataset.addColumn("changelog_description");
    dataset.addColumn("changelog_category");
    dataset.addColumn("changelog_image");
    dataset.addColumn("changelog_tags");
    dataset.addColumn("createDate");
    dataset.addColumn("updateDate");
    dataset.addColumn("changes");

    try {

        var params = extractParams(constraints);

        var constraintsForm = buildFormConstraints(params);

        var dsForm = DatasetFactory.getDataset("document", null, constraintsForm, null);

        if (!dsForm || dsForm.rowsCount === 0) {
            log("[dsThaisChangelog] Nenhum registro encontrado");
            return dataset;
        }

        log("[dsThaisChangelog] Encontrados " + dsForm.rowsCount + " registros");

        for (var i = 0; i < dsForm.rowsCount; i++) {

            var docId = dsForm.getValue(i, "documentid");

            var changes = getChangesFromChildTable(docId);

            dataset.addRow([
                docId,
                getValue(dsForm, i, "changelog_version"),
                getValue(dsForm, i, "changelog_status", "rascunho"),
                getValue(dsForm, i, "changelog_release_date"),
                getValue(dsForm, i, "changelog_description_short"),
                getValue(dsForm, i, "changelog_description"),
                getValue(dsForm, i, "changelog_category"),
                getValue(dsForm, i, "changelog_image"),
                "", // tags (ainda não implementado),
                getValue(dsForm, i, "documentcreationdate"),
                getValue(dsForm, i, "documentlastmodifieddate"),
                JSON.stringify(changes)
            ]);
        }

    } catch (error) {

        log("[dsThaisChangelog] Erro: " + error);
        log("[dsThaisChangelog] Stack: " + error.stack);

    }

    return dataset;
}


function extractParams(constraints) {

    return {
        documentId: getConstraintValue(constraints, "documentId"),
        status: getConstraintValue(constraints, "status") || "publicado",
        version: getConstraintValue(constraints, "version")
    };
}


function buildFormConstraints(params) {

    var constraints = [];

    constraints.push(
        DatasetFactory.createConstraint(
            "tablename",
            "ThaisChangelog",
            "ThaisChangelog",
            ConstraintType.MUST
        )
    );

    if (params.documentId) {
        constraints.push(
            DatasetFactory.createConstraint(
                "documentid",
                params.documentId,
                params.documentId,
                ConstraintType.MUST
            )
        );
    }

    if (params.status) {
        constraints.push(
            DatasetFactory.createConstraint(
                "metadata#changelog_status",
                params.status,
                params.status,
                ConstraintType.MUST
            )
        );
    }

    if (params.version) {
        constraints.push(
            DatasetFactory.createConstraint(
                "metadata#changelog_version",
                params.version,
                params.version,
                ConstraintType.MUST
            )
        );
    }

    return constraints;
}


function getChangesFromChildTable(documentId) {

    var changes = [];

    try {

        var constraints = [
            DatasetFactory.createConstraint(
                "tablename",
                "tb_mudancas",
                "tb_mudancas",
                ConstraintType.MUST
            ),
            DatasetFactory.createConstraint(
                "metadata#parentDocumentId",
                documentId,
                documentId,
                ConstraintType.MUST
            )
        ];

        var dsChild = DatasetFactory.getDataset("document", null, constraints, null);

        if (!dsChild || dsChild.rowsCount === 0) {
            return changes;
        }

        for (var i = 0; i < dsChild.rowsCount; i++) {

            changes.push({
                type: getValue(dsChild, i, "mudanca_tipo", "melhoria"),
                title: getValue(dsChild, i, "mudanca_titulo"),
                details: getValue(dsChild, i, "mudanca_detalhes"),
                impact: getValue(dsChild, i, "mudanca_impacto", "medio"),
                module: getValue(dsChild, i, "mudanca_modulo")
            });
        }

    } catch (e) {

        log("[dsThaisChangelog] Erro ao buscar tabela pai-filho: " + e);

    }

    return changes;
}


function getValue(dataset, row, field, fallback) {

    var value = dataset.getValue(row, field);

    if (value === null || value === undefined || value === "") {
        return fallback || "";
    }

    return value;
}


function getConstraintValue(constraints, key) {

    if (!constraints || constraints.length === 0) {
        return null;
    }

    for (var i = 0; i < constraints.length; i++) {

        var c = constraints[i];

        if (c.fieldName === key || c._field === key) {
            return c.initialValue || c._initialValue || c.value || null;
        }
    }

    return null;
}


function log(message) {

    try {

        if (typeof console !== "undefined" && console.log) {
            console.log(message);
        }

    } catch (e) {}
}