// Smash Client - conversor de texturas: roda o Python (Pyodide) fora da tela principal
importScripts('pyodide/pyodide.js');

let py = null;
const diga = (tipo, dados) => self.postMessage(Object.assign({ tipo }, dados || {}));

async function preparar() {
  if (py) return py;
  diga('etapa', { texto: 'Carregando o Python no navegador' });
  py = await loadPyodide({ indexURL: new URL('pyodide/', self.location.href).href });
  diga('etapa', { texto: 'Carregando Pillow e NumPy' });
  await py.loadPackage(['numpy', 'pillow']);
  diga('etapa', { texto: 'Carregando o conversor' });
  const r = await fetch('conversor.zip');
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
      p.FS.writeFile(nome, new Uint8Array(m.dados));
      const info = JSON.parse(p.runPython(`web.inspecionar(${JSON.stringify(nome)})`));
      diga('info', { info, caminho: nome });
    } else if (m.tipo === 'converter') {
      diga('etapa', { texto: 'Convertendo texturas' });
      const t0 = performance.now();
      const res = JSON.parse(p.runPython(`web.converter(${JSON.stringify(m.caminho)})`));
      const ler = (c) => (c ? p.FS.readFile(c) : null);
      const arquivos = {
        mcpack: { nome: res.mcpack.split('/').pop(), dados: ler(res.mcpack) },
        apk: { nome: res.apk.split('/').pop(), dados: ler(res.apk) },
        relatorio: res.relatorio ? { nome: res.relatorio.split('/').pop(), dados: ler(res.relatorio) } : null,
      };
      const transf = [arquivos.mcpack.dados.buffer, arquivos.apk.dados.buffer];
      if (arquivos.relatorio) transf.push(arquivos.relatorio.dados.buffer);
      self.postMessage({ tipo: 'feito', res, arquivos, segundos: (performance.now() - t0) / 1000 }, transf);
      try { p.FS.unlink(m.caminho); } catch (e) {}
    }
  } catch (e) {
    let msg = String(e && e.message || e);
    if (/MemoryError|memory access out of bounds|Cannot enlarge memory/i.test(msg)) msg = 'MEMORIA: ' + msg;
    diga('erro', { mensagem: msg });
  }
};
