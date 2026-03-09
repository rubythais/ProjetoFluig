function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

export async function fetchChangelogVersions(params) {
  params = params || {};
  var datasetName = params.datasetName || 'dsThaisChangelog';

  var mock = [
    {
      version: '2.4.1',
      releaseDate: '2026-02-20',
      status: 'ativo',
      summary: 'Melhorias no login e correções no relatório',
      categories: 'Melhorias;Correções',
      tags: 'Portal;Financeiro',
      pinned: 'true',
      imageDocumentId: '',
      changesJson: JSON.stringify([
        { type: 'melhoria', title: 'Login mais rápido', details: 'Otimizamos validações', impact: 'médio', module: 'Portal' },
        { type: 'correção', title: 'Relatório de vendas', details: 'Corrigido filtro por data', impact: 'alto', module: 'Financeiro' }
      ])
    },
    {
      version: '2.4.0',
      releaseDate: '2026-02-10',
      status: 'ativo',
      summary: 'Novas telas no portal',
      categories: 'Novidades',
      tags: 'Portal',
      pinned: 'false',
      imageDocumentId: '',
      changesJson: JSON.stringify([
        { type: 'novidade', title: 'Nova página inicial', details: '', impact: 'baixo', module: 'Portal' }
      ])
    }
  ];

  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return normalizeRows(mock);
  }

  try {
    var resp = await fetch('/api/public/ecm/dataset/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: datasetName,
        fields: [],
        constraints: [],
        order: []
      })
    });

    if (!resp.ok) throw new Error('HTTP ' + resp.status);

    var data = await resp.json();
    var rows =
      data && data.content && data.content.values
        ? data.content.values
        : [];

    return normalizeRows(rows);
  } catch (e) {
    console.error('Falha ao buscar dataset no Fluig. Usando mock.', e);
    return normalizeRows(mock);
  }
}

function normalizeRows(rows) {
  return (rows || []).map(function (r) {
    var categories = splitList(r.categories);
    var tags = splitList(r.tags);

    var pinned = String(r.pinned).toLowerCase() === 'true';

    var changes = Array.isArray(r.changes)
      ? r.changes
      : safeJsonParse(r.changesJson || '[]', []);

    return {
      version: r.version,
      releaseDate: r.releaseDate,
      status: r.status,
      summary: r.summary,
      description: r.description || '',
      categories: categories,
      tags: tags,
      pinned: pinned,
      imageDocumentId: r.imageDocumentId || '',
      changes: changes
    };
  });
}

function splitList(value) {
  if (!value) return [];

  var raw = String(value);
  return raw
    .split(raw.indexOf(';') >= 0 ? ';' : ',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}
