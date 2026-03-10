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
      status: 'publicado',
      summary: 'Melhorias no login e correções no relatório',
      categories: 'Melhorias;Correções',
      tags: 'Portal;Financeiro',
      pinned: 'true',
      imageRef: '',
      imageDocumentId: '',
      changesJson: JSON.stringify([
        { type: 'melhoria', title: 'Login mais rápido', details: 'Otimizamos validações', impact: 'médio', module: 'Portal' },
        { type: 'correção', title: 'Relatório de vendas', details: 'Corrigido filtro por data', impact: 'alto', module: 'Financeiro' }
      ])
    },
    {
      version: '2.4.0',
      releaseDate: '2026-02-10',
      status: 'publicado',
      summary: 'Novas telas no portal',
      categories: 'Novidades',
      tags: 'Portal',
      pinned: 'false',
      imageRef: '',
      imageDocumentId: '',
      changesJson: JSON.stringify([
        { type: 'novidade', title: 'Nova página inicial', details: '', impact: 'baixo', module: 'Portal' }
      ])
    }
  ];

  // Sempre tentar o dataset primeiro
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

    var normalized = normalizeRows(rows);
    normalized = await hydrateImageUrls(normalized);
    
    // Se dataset vazio, usar mock
    if (normalized.length === 0) {
      console.warn('[changelogService] Dataset vazio, usando dados mock');
      var normalizedMock = normalizeRows(mock);
      return await hydrateImageUrls(normalizedMock);
    }
    
    console.log('[changelogService] Dados do dataset carregados:', normalized.length, 'versões');
    return normalized;
  } catch (e) {
    console.error('[changelogService] Falha ao buscar dataset. Usando mock.', e);
    return normalizeRows(mock);
  }
}

async function hydrateImageUrls(items) {
  if (!Array.isArray(items) || items.length === 0) return [];

  var hydrated = await Promise.all(
    items.map(async function (item) {
      var documentId = extractDocumentId(item.imageDocumentId || item.imageRef || '');
      if (!documentId) return item;

      var publicUrl = await resolvePublicDownloadUrl(documentId);
      if (!publicUrl) return item;

      return {
        ...item,
        imageRef: publicUrl,
        imageDocumentId: String(documentId)
      };
    })
  );

  return hydrated;
}

function extractDocumentId(value) {
  if (!value) return '';

  var raw = String(value).trim();
  if (!raw) return '';

  if (/^\d+$/.test(raw)) return raw;

  var fromApiUrl = raw.match(/downloadURL\/(\d+)/i);
  if (fromApiUrl && fromApiUrl[1]) return fromApiUrl[1];

  return '';
}

async function resolvePublicDownloadUrl(documentId) {
  try {
    var response = await fetch('/api/public/ecm/dataset/datasets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'dsDocumentDownloadURL',
        fields: ['downloadURL', 'status', 'message'],
        constraints: [
          {
            _field: 'documentId',
            _initialValue: String(documentId),
            _finalValue: String(documentId),
            _type: 1
          }
        ],
        order: []
      })
    });

    if (response.ok) {
      var data = await response.json();
      var values = (data && data.content && data.content.values) ? data.content.values : [];
      var row = values[0] || {};
      if (row.downloadURL) return String(row.downloadURL);
    }
  } catch (e) {
    console.warn('[changelogService] Falha ao resolver downloadURL público via dataset:', e);
  }

  return '/api/public/ecm/document/downloadURL/' + encodeURIComponent(String(documentId));
}

function normalizeRows(rows) {
  var normalized = (rows || []).map(function (r) {
    var categories = splitList(
      r.categories ||
      r.category ||
      r.changelog_category ||
      r.categorias
    );

    var tags = splitList(
      r.tags ||
      r.tag ||
      r.changelog_tags ||
      r.etiquetas
    );

    var pinned = String(r.pinned).toLowerCase() === 'true';

    var changes = Array.isArray(r.changes)
      ? r.changes
      : safeJsonParse(r.changesJson || '[]', []);

    return {
      version: r.version || r.changelog_version || '',
      releaseDate: r.releaseDate || r.changelog_release_date || '',
      status: r.status || r.changelog_status || '',
      summary: r.summary || r.changelog_description_short || '',
      description: r.description || '',
      categories: categories,
      tags: tags,
      pinned: pinned,
      imageRef: r.imageRef || r.image || r.changelog_image || '',
      imageDocumentId: r.imageDocumentId || r.imageDocId || '',
      changes: changes,
      createdBy: r.createdBy || '',
      createdAt: r.createdAt || r.createDate || '',
      updatedAt: r.updatedAt || r.updateDate || '',
      publishedBy: r.publishedBy || '',
      publishedAt: r.publishedAt || ''
    };
  });

  var byVersion = {};
  normalized.forEach(function (item) {
    var key = String(item.version || '').trim();
    if (!key) return;

    var current = byVersion[key];
    if (!current) {
      byVersion[key] = item;
      return;
    }

    var currentDate = new Date(current.updatedAt || current.releaseDate || 0).getTime();
    var nextDate = new Date(item.updatedAt || item.releaseDate || 0).getTime();
    if (nextDate >= currentDate) {
      byVersion[key] = item;
    }
  });

  return Object.keys(byVersion).map(function (version) {
    return byVersion[version];
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
