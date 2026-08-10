import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./Code.gs', import.meta.url), 'utf8');
const context = {
  PropertiesService: { getScriptProperties: () => ({ getProperties: () => ({}) }) },
  console
};
vm.createContext(context);
vm.runInContext(source + `
  globalThis.testApi = {
    slugify_, sourceSlug_, buildOccurrenceId_, logicalSignature_, makeRecord_,
    recordToArray_, requireEditionNumber_, requireTermKey_, requireFamilyId_,
    cleanDate_, cleanUrl_, assertSafeLabel_, CONFIG
  };
`, context);

const api = context.testApi;

assert.equal(api.slugify_('Tendências Brasil 2026'), 'tendencias-brasil-2026');
assert.equal(api.slugify_('Trader Joe’s mini tote craze'), 'trader-joes-mini-tote-craze');
assert.equal(api.slugify_("Lenny's Newsletter"), 'lennys-newsletter');
assert.equal(api.sourceSlug_('After School by Casey Lewis'), 'after-school');
assert.equal(api.sourceSlug_('TrendWatching via LinkedIn'), 'trendwatching');
assert.equal(
  api.buildOccurrenceId_(5, 'sabsing', 'After School by Casey Lewis', 'Quant Cash and SABSing Season'),
  'occurrence:5:sabsing:after-school:quant-cash-and-sabsing-season'
);

const existing = api.makeRecord_({
  record_id: 'occurrence:legacy-id',
  record_type: 'occurrence',
  edition_number: 5,
  term_key: 'physical-ai',
  source_name: 'Not Boring',
  email_subject: 'Weekly Dose of Optimism #204'
});
const candidate = api.makeRecord_({
  record_id: 'occurrence:new-id',
  record_type: 'occurrence',
  edition_number: 5,
  term_key: 'physical-ai',
  source_name: 'Not Boring',
  email_subject: 'Weekly Dose of Optimism #204'
});
assert.equal(api.logicalSignature_(existing), api.logicalSignature_(candidate));
assert.equal(api.recordToArray_(candidate).length, api.CONFIG.headers.length);
assert.equal(api.requireEditionNumber_('5'), 5);
assert.equal(api.requireTermKey_('physical-ai'), 'physical-ai');
assert.equal(api.requireFamilyId_('family:ia-fisica-a1b2c3d4'), 'family:ia-fisica-a1b2c3d4');
assert.equal(api.cleanDate_('2026-08-10'), '2026-08-10');
assert.equal(api.cleanDate_('10/08/2026'), '');
assert.equal(api.cleanUrl_('https://example.com/x'), 'https://example.com/x');
assert.equal(api.cleanUrl_('javascript:alert(1)'), '');
assert.throws(() => api.assertSafeLabel_('=IMPORTXML("x")'));

console.log('ok — contratos locais validados');
