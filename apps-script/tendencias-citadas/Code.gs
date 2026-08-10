/**
 * Voltinha do Trendices — camada isolada de tendências citadas.
 * Lê o Web App canônico e escreve somente na aba "Tendências Citadas".
 */

const CONFIG = Object.freeze({
  spreadsheetId: '1fFYxbJ_Es20tEpu-OcvOVOu81OiPELcPMPbUpkOOhgg',
  sheetName: 'Tendências Citadas',
  canonicalUrl: 'https://script.google.com/macros/s/AKfycbzEtcKNXviXzehRNxK2M31Jg_gSIyAR0_ReKLBn_CyQU1T05W0G2MQIQKXCyI9K0d4/exec',
  headers: ['record_id', 'record_type', 'edition_number', 'term_key', 'term_original', 'source_name', 'email_subject', 'source_date', 'source_url', 'excerpt_original', 'excerpt_pt', 'reaction_status', 'family_id', 'family_name', 'translation_status', 'translated_by', 'translated_at', 'created_at', 'updated_at'],
  reactions: ['sem_marcacao', 'acompanhar', 'nao_e_tendencia'],
  maxTextLength: 12000
});

const COL = Object.freeze(CONFIG.headers.reduce(function (map, name, index) {
  map[name] = index;
  return map;
}, {}));

/** Executar uma vez no editor do projeto isolado. */
function configureProject() {
  const properties = PropertiesService.getScriptProperties();
  const existing = properties.getProperties();
  const defaults = {
    SPREADSHEET_ID: CONFIG.spreadsheetId,
    SHEET_NAME: CONFIG.sheetName,
    CANONICAL_WEB_APP_URL: CONFIG.canonicalUrl,
    ACCESS_MODE: 'public',
    TRANSLATION_PROVIDER: 'language_app',
    TRANSLATION_BATCH_SIZE: '20'
  };
  Object.keys(defaults).forEach(function (key) {
    if (!existing[key]) properties.setProperty(key, defaults[key]);
  });
  return getConfiguration_();
}

/** Sincronização idempotente de uma edição específica. */
function syncEdition(editionNumber) {
  const number = requireEditionNumber_(editionNumber);
  const payload = fetchCanonicalEdition_(number);
  return withLock_(function () { return upsertNamedTrends_(payload); });
}

/** Sincronização idempotente da edição publicada mais recente. */
function syncLatestEdition() {
  const payload = fetchCanonicalEdition_();
  return withLock_(function () { return upsertNamedTrends_(payload); });
}

/** O pipeline canônico continua independente de qualquer falha de tradução. */
function syncLatestEditionAndTranslate() {
  return {
    sync: syncLatestEdition(),
    translation: translatePendingOccurrences()
  };
}

/**
 * Traduz somente excerpt_original de ocorrências pendentes.
 * Esta função não está disponível no endpoint público.
 */
function translatePendingOccurrences(limit) {
  const cfg = getConfiguration_();
  const batchSize = clampInteger_(limit || cfg.translationBatchSize, 1, 50);
  return withLock_(function () {
    const table = readTable_();
    const result = { ok: true, processed: 0, translated: 0, not_needed: 0, review: 0 };
    for (let i = 0; i < table.rows.length && result.processed < batchSize; i += 1) {
      const row = table.rows[i];
      if (row.record_type !== 'occurrence' || row.translation_status !== 'pendente') continue;
      const original = cleanText_(row.excerpt_original, CONFIG.maxTextLength);
      const now = new Date().toISOString();
      try {
        if (!original) throw new Error('Trecho vazio.');
        const translated = translateToPortuguese_(original, cfg.translationProvider);
        const same = normalizeComparable_(translated) === normalizeComparable_(original);
        updateCells_(table.sheet, row.__rowNumber, {
          excerpt_pt: same ? '' : translated,
          translation_status: same ? 'nao_necessaria' : 'traduzido',
          translated_by: cfg.translationProvider,
          translated_at: now,
          updated_at: now
        });
        if (same) result.not_needed += 1;
        else result.translated += 1;
      } catch (error) {
        updateCells_(table.sheet, row.__rowNumber, {
          translation_status: 'revisar',
          translated_by: cfg.translationProvider,
          translated_at: now,
          updated_at: now
        });
        result.review += 1;
      }
      result.processed += 1;
    }
    return result;
  });
}

/** Instala um único gatilho diário, por volta das 11h em São Paulo. */
function installMaintenanceTrigger() {
  const handler = 'syncLatestEditionAndTranslate';
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === handler) ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger(handler)
    .timeBased()
    .atHour(11)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone('America/Sao_Paulo')
    .create();
  return {
    ok: true,
    handler: handler,
    schedule: 'daily_around_11',
    timezone: 'America/Sao_Paulo'
  };
}

/** API de leitura da camada opcional. */
function doGet(event) {
  try {
    const params = (event && event.parameter) || {};
    if (params.mode === 'health') return jsonResponse_({ ok: true, service: 'tendencias-citadas', version: 1 });
    const edition = params.edition ? requireEditionNumber_(params.edition) : null;
    return jsonResponse_(buildOverlay_(edition));
  } catch (error) {
    return jsonResponse_({ ok: false, error: publicError_(error) });
  }
}

/**
 * Escrita pública v1 limitada a cinco ações. Não há edição genérica, exclusão,
 * sincronização ou tradução via Web App.
 */
function doPost(event) {
  try {
    const input = parseRequestBody_(event);
    authorizeWrite_(input);
    const action = cleanToken_(input.action, 40);
    const allowed = ['set_reaction', 'create_family', 'rename_family', 'assign_family', 'remove_from_family'];
    if (allowed.indexOf(action) === -1) throw new Error('Ação não permitida.');
    const result = withLock_(function () {
      if (action === 'set_reaction') return setReaction_(input);
      if (action === 'create_family') return createFamily_(input);
      if (action === 'rename_family') return renameFamily_(input);
      if (action === 'assign_family') return assignFamily_(input);
      return removeFromFamily_(input);
    });
    return jsonResponse_({ ok: true, action: action, result: result });
  } catch (error) {
    return jsonResponse_({ ok: false, error: publicError_(error) });
  }
}

function upsertNamedTrends_(payload) {
  const editionNumber = requireEditionNumber_((payload.edition || {}).edition_number);
  const trends = Array.isArray(payload.named_trends) ? payload.named_trends : [];
  const table = readTable_();
  const now = new Date().toISOString();
  const byId = {};
  const bySignature = {};
  table.rows.forEach(function (row) {
    byId[row.record_id] = row;
    bySignature[logicalSignature_(row)] = row;
  });
  const newRows = [];
  let inserted = 0;
  let updated = 0;

  trends.forEach(function (trend) {
    const termOriginal = cleanText_(trend.title, 300);
    if (!termOriginal) return;
    const termKey = slugify_(termOriginal);
    const term = makeRecord_({
      record_id: 'term:' + termKey,
      record_type: 'term',
      edition_number: editionNumber,
      term_key: termKey,
      term_original: termOriginal,
      reaction_status: 'sem_marcacao',
      created_at: now,
      updated_at: now
    });
    const oldTerm = byId[term.record_id] || bySignature[logicalSignature_(term)];
    if (oldTerm) {
      if (syncFields_(table.sheet, oldTerm, term, ['term_original', 'updated_at'])) updated += 1;
    } else {
      newRows.push(recordToArray_(term));
      byId[term.record_id] = term;
      bySignature[logicalSignature_(term)] = term;
      inserted += 1;
    }

    const occurrence = makeRecord_({
      record_id: buildOccurrenceId_(editionNumber, termKey, trend.source_name, trend.email_subject),
      record_type: 'occurrence',
      edition_number: editionNumber,
      term_key: termKey,
      term_original: termOriginal,
      source_name: cleanText_(trend.source_name, 300),
      email_subject: cleanText_(trend.email_subject, 500),
      source_date: cleanDate_(trend.source_date),
      source_url: cleanUrl_(trend.url),
      excerpt_original: cleanText_(trend.excerpt, CONFIG.maxTextLength),
      translation_status: 'pendente',
      created_at: now,
      updated_at: now
    });
    const signature = logicalSignature_(occurrence);
    const oldOccurrence = byId[occurrence.record_id] || bySignature[signature];
    if (oldOccurrence) {
      const fields = ['term_original', 'source_name', 'email_subject', 'source_date', 'source_url', 'excerpt_original', 'updated_at'];
      if (syncFields_(table.sheet, oldOccurrence, occurrence, fields)) updated += 1;
    } else {
      newRows.push(recordToArray_(occurrence));
      byId[occurrence.record_id] = occurrence;
      bySignature[signature] = occurrence;
      inserted += 1;
    }
  });

  appendRows_(table.sheet, newRows);
  return { ok: true, edition_number: editionNumber, trends: trends.length, inserted: inserted, updated: updated };
}

function buildOverlay_(requestedEdition) {
  const table = readTable_();
  const allOccurrences = table.rows.filter(function (row) { return row.record_type === 'occurrence'; });
  const latest = allOccurrences.reduce(function (max, row) { return Math.max(max, Number(row.edition_number) || 0); }, 0);
  const edition = requestedEdition || latest;
  const occurrences = allOccurrences.filter(function (row) { return Number(row.edition_number) === edition; });
  const needed = {};
  occurrences.forEach(function (row) { needed[row.term_key] = true; });
  const terms = {};
  table.rows.forEach(function (row) {
    if (row.record_type === 'term' && needed[row.term_key]) terms[row.term_key] = publicTerm_(row);
  });
  occurrences.forEach(function (row) {
    if (!terms[row.term_key]) terms[row.term_key] = publicTerm_(row);
    terms[row.term_key].occurrences.push(publicOccurrence_(row));
  });
  const families = table.rows.filter(function (row) { return row.record_type === 'family'; }).map(function (row) {
    return { family_id: row.family_id, family_name: row.family_name };
  });
  return { ok: true, edition_number: edition, terms: Object.keys(terms).map(function (key) { return terms[key]; }), families: families };
}

function setReaction_(input) {
  const termKey = requireTermKey_(input.term_key);
  const reaction = cleanToken_(input.reaction_status, 40);
  if (CONFIG.reactions.indexOf(reaction) === -1) throw new Error('Reação inválida.');
  const found = findTerm_(termKey);
  updateCells_(found.sheet, found.row.__rowNumber, { reaction_status: reaction, updated_at: new Date().toISOString() });
  return { term_key: termKey, reaction_status: reaction };
}

function createFamily_(input) {
  const name = cleanText_(input.family_name, 120);
  if (!name) throw new Error('Nome da família obrigatório.');
  assertSafeLabel_(name);
  const table = readTable_();
  const termKeys = input.term_keys ? requireTermKeys_(input.term_keys) : [];
  if (termKeys.length) assertTermsExist_(table.rows, termKeys);
  const familyId = 'family:' + slugify_(name) + '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  const now = new Date().toISOString();
  appendRows_(table.sheet, [recordToArray_(makeRecord_({
    record_id: familyId,
    record_type: 'family',
    family_id: familyId,
    family_name: name,
    created_at: now,
    updated_at: now
  }))]);
  if (termKeys.length) {
    const nowAssigned = new Date().toISOString();
    table.rows.forEach(function (row) {
      if (row.record_type === 'term' && termKeys.indexOf(row.term_key) >= 0) {
        updateCells_(table.sheet, row.__rowNumber, { family_id: familyId, family_name: name, updated_at: nowAssigned });
      }
    });
  }
  return { family_id: familyId, family_name: name };
}

function renameFamily_(input) {
  const familyId = requireFamilyId_(input.family_id);
  const name = cleanText_(input.family_name, 120);
  if (!name) throw new Error('Nome da família obrigatório.');
  assertSafeLabel_(name);
  const table = readTable_();
  const now = new Date().toISOString();
  let found = false;
  let affected = 0;
  table.rows.forEach(function (row) {
    if (row.record_type === 'family' && row.family_id === familyId) {
      updateCells_(table.sheet, row.__rowNumber, { family_name: name, updated_at: now });
      found = true;
    } else if (row.record_type === 'term' && row.family_id === familyId) {
      updateCells_(table.sheet, row.__rowNumber, { family_name: name, updated_at: now });
      affected += 1;
    }
  });
  if (!found) throw new Error('Família não encontrada.');
  return { family_id: familyId, family_name: name, affected_terms: affected };
}

function assignFamily_(input) {
  const familyId = requireFamilyId_(input.family_id);
  const termKeys = requireTermKeys_(input.term_keys);
  const table = readTable_();
  const family = table.rows.find(function (row) { return row.record_type === 'family' && row.family_id === familyId; });
  if (!family) throw new Error('Família não encontrada.');
  assertTermsExist_(table.rows, termKeys);
  const wanted = {};
  termKeys.forEach(function (key) { wanted[key] = true; });
  const now = new Date().toISOString();
  let affected = 0;
  table.rows.forEach(function (row) {
    if (row.record_type === 'term' && wanted[row.term_key]) {
      updateCells_(table.sheet, row.__rowNumber, { family_id: familyId, family_name: family.family_name, updated_at: now });
      affected += 1;
    }
  });
  return { family_id: familyId, affected_terms: affected };
}

function removeFromFamily_(input) {
  const termKeys = requireTermKeys_(input.term_keys);
  const table = readTable_();
  const wanted = {};
  termKeys.forEach(function (key) { wanted[key] = true; });
  const now = new Date().toISOString();
  let affected = 0;
  table.rows.forEach(function (row) {
    if (row.record_type === 'term' && wanted[row.term_key]) {
      updateCells_(table.sheet, row.__rowNumber, { family_id: '', family_name: '', updated_at: now });
      affected += 1;
    }
  });
  return { affected_terms: affected };
}

function findTerm_(termKey) {
  const table = readTable_();
  const row = table.rows.find(function (candidate) { return candidate.record_type === 'term' && candidate.term_key === termKey; });
  if (!row) throw new Error('Termo não encontrado.');
  return { sheet: table.sheet, row: row };
}

function readTable_() {
  const cfg = getConfiguration_();
  const sheet = SpreadsheetApp.openById(cfg.spreadsheetId).getSheetByName(cfg.sheetName);
  if (!sheet) throw new Error('Aba isolada não encontrada.');
  validateHeaders_(sheet);
  const lastRow = sheet.getLastRow();
  const values = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, CONFIG.headers.length).getValues() : [];
  const rows = values.map(function (valuesRow, index) {
    const record = { __rowNumber: index + 2 };
    CONFIG.headers.forEach(function (header, column) { record[header] = valuesRow[column]; });
    return record;
  }).filter(function (row) { return String(row.record_id || '').trim() !== ''; });
  return { sheet: sheet, rows: rows };
}

function validateHeaders_(sheet) {
  const actual = sheet.getRange(1, 1, 1, CONFIG.headers.length).getDisplayValues()[0];
  if (actual.join('\u001f') !== CONFIG.headers.join('\u001f')) throw new Error('Cabeçalhos da aba isolada não correspondem ao contrato esperado.');
}

function appendRows_(sheet, rows) {
  if (!rows.length) return;
  const start = sheet.getLastRow() + 1;
  sheet.getRange(start, 1, rows.length, CONFIG.headers.length).setValues(rows);
  ['B', 'L', 'O'].forEach(function (column) {
    sheet.getRange(column + '2').copyTo(
      sheet.getRange(column + start + ':' + column + (start + rows.length - 1)),
      SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,
      false
    );
  });
}

function syncFields_(sheet, oldRecord, newRecord, fields) {
  const changes = {};
  fields.forEach(function (field) {
    if (field === 'updated_at') return;
    if (String(oldRecord[field] || '') !== String(newRecord[field] || '')) changes[field] = newRecord[field];
  });
  if (!Object.keys(changes).length) return false;
  changes.updated_at = newRecord.updated_at;
  updateCells_(sheet, oldRecord.__rowNumber, changes);
  Object.keys(changes).forEach(function (field) { oldRecord[field] = changes[field]; });
  return true;
}

function assertTermsExist_(rows, termKeys) {
  const present = {};
  rows.forEach(function (row) {
    if (row.record_type === 'term') present[row.term_key] = true;
  });
  if (termKeys.some(function (key) { return !present[key]; })) throw new Error('Um ou mais termos não foram encontrados.');
}

function assertSafeLabel_(value) {
  if (/^[=+\-@]/.test(value)) throw new Error('Nome da família inválido.');
}

function updateCells_(sheet, row, changes) {
  Object.keys(changes).forEach(function (field) {
    if (COL[field] === undefined) throw new Error('Campo não permitido: ' + field);
    sheet.getRange(row, COL[field] + 1).setValue(changes[field]);
  });
}

function fetchCanonicalEdition_(editionNumber) {
  const cfg = getConfiguration_();
  const url = cfg.canonicalUrl + (editionNumber ? '?edition=' + encodeURIComponent(editionNumber) : '');
  const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
  if (response.getResponseCode() !== 200) throw new Error('Falha ao ler a edição canônica.');
  const data = JSON.parse(response.getContentText());
  if (!data.ok || !data.edition || !data.edition.edition || !Array.isArray(data.edition.named_trends)) throw new Error('Resposta canônica inválida.');
  return data.edition;
}

function translateToPortuguese_(text, provider) {
  if (provider !== 'language_app') throw new Error('Provedor de tradução não configurado.');
  return cleanText_(LanguageApp.translate(text, '', 'pt'), CONFIG.maxTextLength);
}

function getConfiguration_() {
  const p = PropertiesService.getScriptProperties().getProperties();
  return {
    spreadsheetId: p.SPREADSHEET_ID || CONFIG.spreadsheetId,
    sheetName: p.SHEET_NAME || CONFIG.sheetName,
    canonicalUrl: p.CANONICAL_WEB_APP_URL || CONFIG.canonicalUrl,
    accessMode: p.ACCESS_MODE || 'public',
    writeToken: p.WRITE_TOKEN || '',
    translationProvider: p.TRANSLATION_PROVIDER || 'language_app',
    translationBatchSize: clampInteger_(p.TRANSLATION_BATCH_SIZE || 20, 1, 50)
  };
}

function authorizeWrite_(input) {
  const cfg = getConfiguration_();
  if (cfg.accessMode === 'public') return;
  if (cfg.accessMode === 'token' && cfg.writeToken && input.token === cfg.writeToken) return;
  throw new Error('Escrita não autorizada.');
}

function parseRequestBody_(event) {
  if (!event || !event.postData || !event.postData.contents) throw new Error('Corpo da requisição ausente.');
  if (event.postData.contents.length > 20000) throw new Error('Corpo da requisição excede o limite.');
  let data;
  try { data = JSON.parse(event.postData.contents); } catch (error) { throw new Error('JSON inválido.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Objeto JSON esperado.');
  return data;
}

function logicalSignature_(row) {
  if (row.record_type === 'term') return 'term|' + row.term_key;
  if (row.record_type === 'occurrence') return ['occurrence', Number(row.edition_number), row.term_key, normalizeComparable_(row.source_name), normalizeComparable_(row.email_subject)].join('|');
  return 'family|' + row.family_id;
}

function buildOccurrenceId_(edition, termKey, source, subject) {
  return ['occurrence', edition, termKey, sourceSlug_(source), slugify_(subject)].join(':');
}

function sourceSlug_(value) {
  return slugify_(String(value || '').replace(/\s+by\s+.+$/i, '').replace(/\s+via\s+.+$/i, '').replace(/\s+[—–-]\s+.+$/i, ''));
}

function makeRecord_(values) {
  const record = {};
  CONFIG.headers.forEach(function (header) { record[header] = ''; });
  Object.keys(values || {}).forEach(function (header) { record[header] = values[header]; });
  return record;
}

function recordToArray_(record) {
  return CONFIG.headers.map(function (header) { return record[header] === undefined ? '' : record[header]; });
}

function publicTerm_(row) {
  return {
    term_key: String(row.term_key || ''),
    term_original: String(row.term_original || ''),
    reaction_status: CONFIG.reactions.indexOf(String(row.reaction_status)) >= 0 ? String(row.reaction_status) : 'sem_marcacao',
    family_id: String(row.family_id || ''),
    family_name: String(row.family_name || ''),
    occurrences: []
  };
}

function publicOccurrence_(row) {
  return {
    record_id: String(row.record_id || ''),
    source_name: String(row.source_name || ''),
    email_subject: String(row.email_subject || ''),
    source_date: cleanDate_(row.source_date),
    source_url: cleanUrl_(row.source_url),
    excerpt_original: String(row.excerpt_original || ''),
    excerpt_pt: String(row.excerpt_pt || ''),
    translation_status: String(row.translation_status || 'pendente')
  };
}

function requireEditionNumber_(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 99999) throw new Error('Número de edição inválido.');
  return number;
}

function requireTermKey_(value) {
  const key = cleanToken_(value, 160);
  if (!key || key !== slugify_(key)) throw new Error('term_key inválido.');
  return key;
}

function requireFamilyId_(value) {
  const id = cleanToken_(value, 180);
  if (!/^family:[a-z0-9-]+$/.test(id)) throw new Error('family_id inválido.');
  return id;
}

function requireTermKeys_(value) {
  const list = Array.isArray(value) ? value : [value];
  if (!list.length || list.length > 50) throw new Error('Lista de termos inválida.');
  const seen = {};
  return list.map(requireTermKey_).filter(function (key) {
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function cleanText_(value, maxLength) {
  return String(value === undefined || value === null ? '' : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLength || 1000);
}

function cleanToken_(value, maxLength) {
  return cleanText_(value, maxLength).replace(/\s+/g, '_');
}

function cleanDate_(value) {
  const text = cleanText_(value, 40);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

function cleanUrl_(value) {
  const text = cleanText_(value, 2000);
  return /^https:\/\//i.test(text) ? text : '';
}

function slugify_(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140) || 'sem-chave';
}

function normalizeComparable_(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}

function clampInteger_(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.max(min, Math.min(max, Math.floor(parsed)));
}

function withLock_(callback) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { return callback(); } finally { lock.releaseLock(); }
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function publicError_(error) {
  return String(error && error.message ? error.message : 'Erro inesperado.').slice(0, 300);
}
