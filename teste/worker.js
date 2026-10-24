// Smash Client - conversor de texturas: roda o Python (Pyodide) fora da tela principal
importScripts('../pyodide/pyodide.js');

let py = null;
const titulos = {};
const diga = (tipo, dados) => self.postMessage(Object.assign({ tipo }, dados || {}));

async function preparar() {
  if (py) return py;
  diga('carga', { ate: 45 });
  py = await loadPyodide({ indexURL: new URL('../pyodide/', self.location.href).href });
  diga('carga', { ate: 92 });
  await py.loadPackage(['numpy', 'pillow']);
  diga('carga', { ate: 99 });
  const r = await fetch('conversor.zip?v=6');
  if (!r.ok) throw new Error('nao achei conversor.zip no servidor');
  py.unpackArchive(await r.arrayBuffer(), 'zip', { extractDir: '/app' });
  py.runPython("import sys; sys.path.insert(0, '/app/conversor'); import web");
  py.FS.mkdirTree('/work');
  return py;
}

self.onmessage = async (ev) => {
  const m = ev.data;
  try {
    if (m.tipo === 'preparar') { await preparar(); diga('pronto'); return; }
    const p = await preparar();
    if (m.tipo === 'inspecionar') {
      const nome = '/work/' + m.nome.replace(/[^\w.\- ]+/g, '_');
      for (const f of p.FS.readdir('/work')) if (f.endsWith('.zip')) { try { p.FS.unlink('/work/' + f); } catch (e) {} }  // so o pack atual fica guardado
      p.FS.writeFile(nome, new Uint8Array(m.dados));
      const info = JSON.parse(p.runPython(`web.inspecionar(${JSON.stringify(nome)})`));
      titulos[nome] = m.nome.replace(/\.zip$/i, '');
      diga('info', { info, caminho: nome });
    } else if (m.tipo === 'converter') {
      diga('etapa', { texto: 'Convertendo texturas' });
      const t0 = performance.now();
      const res = JSON.parse(p.runPython(`web.converter(${JSON.stringify(m.caminho)}, titulo=${JSON.stringify(titulos[m.caminho] || null).replace(/^null$/, 'None')}, alvo=${JSON.stringify(m.alvo || '1.1.5')})`));
      const ler = (c) => (c ? p.FS.readFile(c) : null);
      const arquivos = {
        pack: { nome: res.pack.split('/').pop(), dados: ler(res.pack) },
        relatorio: res.relatorio ? { nome: res.relatorio.split('/').pop(), dados: ler(res.relatorio) } : null,
      };
      const transf = [arquivos.pack.dados.buffer];
      if (arquivos.relatorio) transf.push(arquivos.relatorio.dados.buffer);
      self.postMessage({ tipo: 'feito', res, arquivos, segundos: (performance.now() - t0) / 1000 }, transf);
    }
  } catch (e) {
    let msg = String(e && e.message || e);
    const se = msg.match(/SystemExit: ([^\n]+)/); if (se) msg = se[1];   // erro do conversor: so a frase, sem o traceback
    if (/MemoryError|memory access out of bounds|Cannot enlarge memory/i.test(msg)) msg = 'MEMORIA: ' + msg;
    diga('erro', { mensagem: msg });
  }
};
