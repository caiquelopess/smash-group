# Smash Group

Site do **Smash Client** (download e novidades) e do **conversor de texturas**: resource packs do Minecraft Java 1.8.9 para o MCPE 1.1.5 ou 0.15.10, sem reduzir as imagens.

Site: https://caiquelopess.github.io/smash-group/
Roda inteiro no navegador (Python + Pillow + NumPy via Pyodide); o pack não sai do aparelho de quem usa.

- `index.html` – página (configuração `SMASH` no topo do script; cores `--smash` / `--smash-2` no topo do CSS)
- `worker.js` – executa o conversor fora da tela principal
- `conversor.zip` – `converter.py`, `ui_scale.py`, `conv015.py`, `web.py`, `base/` (texturas do 1.1.5) e `base015/` (do 0.15.10)
- `sw.js` – guarda o Python e o conversor no aparelho (abre rápido da segunda vez)
- `identidade/` – logo, ícone e cores do Smash Client
- `pyodide/` – Pyodide 0.26.4 + wheels de numpy e pillow (não editar)

Publicação: GitHub Pages (Settings › Pages › Branch `main`, pasta `/`). Detalhes em `LEIA-ME-HOSPEDAGEM.txt`.

Não afiliado à Mojang/Microsoft.
