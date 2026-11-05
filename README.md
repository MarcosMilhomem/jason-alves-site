# Jason Alves · site

Site estático em HTML, CSS e um pouco de JavaScript, sem bibliotecas e sem build. A Vercel publica a pasta como está.

## Arquivos
- `index.html`: página inicial
- `trabalhos.html`: portfólio completo, em `/trabalhos`
- `assets/site.css`: estilos das duas páginas
- `assets/site.js`: carrossel, filtro, player, formulário para WhatsApp e o número do WhatsApp (constante `WHATSAPP`)
- `assets/trabalhos.js`: **a lista de trabalhos**, usada pelas duas páginas
- `media/`: logo, vídeos e capas

## Estrutura da página inicial
1. Cabeçalho fixo com o botão **Pedir orçamento**
2. Hero: o que ele faz, os dois botões e o vídeo vertical
3. Trabalhos: duas linhas de vídeos rodando, com link para o portfólio completo
4. Serviços
5. Como funciona (3 etapas)
6. Faixa vermelha com os segmentos atendidos
7. Contato: e-mail, redes e formulário que abre o WhatsApp
8. Rodapé

## Trocar ou adicionar trabalhos
Edite só `assets/trabalhos.js`. Cada trabalho tem título, cliente, categoria (vira filtro no portfólio), formato, capa (`poster`), vídeo curto mudo que roda no card (`loop`) e, se houver, o filme completo com som (`video`). Apague `exemplo:true` quando o trabalho for real. O carrossel da home e a página `/trabalhos` se atualizam sozinhos.

### Preparar vídeos e capas (ffmpeg)
```bash
ffmpeg -i original.mov -vf scale=720:1280 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart media/nome.mp4
ffmpeg -i original.mov -t 6 -vf scale=540:960 -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -an -movflags +faststart media/nome-loop.mp4
ffmpeg -ss 4 -i original.mov -frames:v 1 -vf scale=540:960 -q:v 4 media/nome-poster.jpg
```

## Dados provisórios para trocar
E-mail (`contato@jasonalves.com.br`), WhatsApp (`5511999999999`, na constante `WHATSAPP` de `assets/site.js` e no `href` de reserva dos links), links de Instagram e Vimeo, e os cinco trabalhos marcados como **Exemplo**.

## Versões anteriores (animadas)
- `referencia-producao-animada`: o site animado que estava no ar antes desta versão.
- `referencia-animada`: a versão animada completa, com partículas, leque, números com vídeo e índice lateral.
