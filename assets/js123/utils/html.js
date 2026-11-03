/*
 * html.js — две мелочи.
 * escapeHtml: данные API вставляются в innerHTML, поэтому спецсимволы экранируются.
 * normalizeText: для поиска — нижний регистр, без знаков, чтобы «Alecto,» == «alecto».
 */
// Данные из API попадают в innerHTML, поэтому все строки экранируем
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Для поиска: нижний регистр, без знаков и диакритики
export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9а-яё ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
