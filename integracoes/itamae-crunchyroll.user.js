// ==UserScript==
// @name         Itamae corrigido - Exportador Crunchyroll
// @namespace    https://github.com/ryn-cx/itamae
// @version      0.0.6-local
// @description  Exporta historico de visualizacao; barra flutuante, captura fetch e XHR
// @match        https://www.crunchyroll.com/*
// @match        https://crunchyroll.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(() => {
  'use strict';
  const entries = new Map();
  const historyUrl = /\/content\/v2\/[^/?]+\/watch-history(?:[/?#]|$)/i;
  let loading = false;
  let stopRequested = false;
  let panel, status, loadBtn, saveBtn;
  const isHistory = () => /\/history\/?$/.test(location.pathname);
  const label = () => {
    if (status) status.textContent = `${entries.size} registros capturados`;
    if (saveBtn) saveBtn.disabled = entries.size === 0;
  };
  function ingest(url, data) {
    if (!historyUrl.test(String(url))) return;
    try {
      const rows = Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.data?.items) ? data.data.items :
        Array.isArray(data?.items) ? data.items : [];
      for (const item of rows) {
        const key = item?.id ?? item?.panel?.id ?? item?.content_id ?? JSON.stringify(item);
        entries.set(String(key), item);
      }
      label();
    } catch (e) { console.warn('[Itamae corrigido] Erro ao ler historico', e); }
  }
  // Captura as requisicoes que a propria pagina realiza; nao acessa credenciais.
  const nativeFetch = window.fetch;
  if (typeof nativeFetch === 'function') {
    window.fetch = function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      return nativeFetch.apply(this, args).then(response => {
        if (historyUrl.test(String(url))) {
          response.clone().json().then(data => ingest(url, data)).catch(() => {});
        }
        return response;
      });
    };
  }
  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__itamaeHistoryUrl = String(url);
    this.addEventListener('load', function () {
      if (!historyUrl.test(this.__itamaeHistoryUrl)) return;
      try { ingest(this.__itamaeHistoryUrl, JSON.parse(this.responseText)); } catch (_) {}
    });
    return nativeOpen.call(this, method, url, ...rest);
  };
  function button(text, click) {
    const el = document.createElement('button');
    el.textContent = text;
    Object.assign(el.style, {background:'#f47521',color:'#fff',border:'0',borderRadius:'6px',padding:'8px 10px',cursor:'pointer',fontWeight:'bold'});
    el.addEventListener('click', click);
    return el;
  }
  function download() {
    if (!entries.size) return alert('Nenhum registro capturado. Recarregue a pagina de historico e role ate o final antes de salvar.');
    const blob = new Blob([JSON.stringify([...entries.values()], null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'crunchyroll-watch-history.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  async function autoLoad() {
    if (loading) { stopRequested = true; return; }
    loading = true; stopRequested = false;
    loadBtn.textContent = 'Parar';
    let stable = 0;
    let previousCount = -1;
    let previousHeight = -1;
    for (let n = 0; n < 300 && !stopRequested; n++) {
      window.scrollTo(0, document.documentElement.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 1800));
      const height = document.documentElement.scrollHeight;
      if (entries.size === previousCount && height === previousHeight) stable++;
      else stable = 0;
      previousCount = entries.size;
      previousHeight = height;
      if (stable >= 4) break;
    }
    loading = false;
    loadBtn.textContent = 'Carregar tudo';
    label();
    if (!entries.size) status.textContent = '0 registros: API nao capturada; veja instrucoes';
    window.scrollTo(0, 0);
  }
  function render() {
    if (!document.body) return;
    if (!isHistory()) { panel?.remove(); panel = null; return; }
    if (panel?.isConnected) return;
    panel = document.createElement('div');
    panel.id = 'itamae-fixed-toolbar';
    Object.assign(panel.style, {position:'fixed',bottom:'18px',right:'18px',zIndex:'2147483647',background:'#202020',border:'1px solid #f47521',borderRadius:'10px',padding:'12px',display:'flex',gap:'8px',alignItems:'center',boxShadow:'0 3px 18px #0009',font:'13px Arial,sans-serif',color:'#fff'});
    const heading = document.createElement('strong'); heading.textContent = 'Itamae';
    status = document.createElement('span');
    loadBtn = button('Carregar tudo', autoLoad);
    saveBtn = button('Salvar JSON', download);
    panel.append(heading, status, loadBtn, saveBtn);
    document.body.appendChild(panel);
    label();
  }
  function init() {
    render();
    // O site navega entre paginas sem recarregar (SPA).
    let lastPath = location.pathname;
    setInterval(() => {
      if (lastPath !== location.pathname || (isHistory() && !panel?.isConnected)) {
        lastPath = location.pathname;
        render();
      }
    }, 750);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
