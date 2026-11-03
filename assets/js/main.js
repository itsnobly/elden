/*
 * main.js — единая точка входа для ВСЕХ страниц.
 * Шапка, футер и модалки живут один раз; router подменяет только содержимое
 * блока #page, поэтому при переходах нет перезагрузки и «кружочка» на вкладке.
 */
import './components/modal.js';
import './modules/up.js';
import { startRouter } from './router.js';

startRouter();
