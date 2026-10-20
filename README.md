# Smash Texturas

Conversor de resource packs do **Minecraft Java 1.8.9** para o **MCPE 1.1.5** do Smash Client, sem reduzir as imagens.
Roda inteiro no navegador (Python + Pillow + NumPy via Pyodide); o pack não sai do aparelho de quem usa.

- `index.html` – página (configuração `SMASH` no topo do script; cores `--smash` / `--smash-2` no topo do CSS)
- `worker.js` – executa o conversor fora da tela principal
- `conversor.zip` – `converter.py`, `ui_scale.py`, `web.py` e `base/` (texturas do Bedrock)
- `pyodide/` – Pyodide 0.26.4 + wheels de numpy e pillow (não editar)

Publicação: GitHub Pages (Settings › Pages › Branch `main`, pasta `/`). Detalhes em `LEIA-ME-HOSPEDAGEM.txt`.

Não afiliado à Mojang/Microsoft.
