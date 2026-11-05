# Jason Alves — site portfólio

Site estático (HTML + GSAP 3.13 + Three.js 0.160 via CDN). Não tem build: a Vercel publica a pasta como está.

## Estrutura
- `index.html` — página inteira (estilos e scripts inline).
- `scenes3d.js` — íris da abertura e claquete em 3D (Three.js, módulo ES). Se não carregar, o site usa as versões em SVG.
- `media/` — logo (versões clara e escura), vídeos e poster.

## Trocar ou adicionar trabalhos
No `index.html`, procure `const PROJECTS = [`. Cada item aceita:

```js
{id:'slug', title:'Nome do filme', client:'Cliente', year:2026, vertical:true,
 video:'media/arquivo-loop.mp4',   // prévia muda em loop (540×960, H.264, sem áudio)
 full:'media/arquivo.mp4',         // versão com som para o player
 dur:'00:30'}
```

Itens sem `video` usam as prévias geradas em canvas.

### Preparar vídeos (ffmpeg)
```bash
ffmpeg -i original.mov -vf scale=540:960 -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -an -movflags +faststart media/nome-loop.mp4
ffmpeg -i original.mov -vf scale=720:1280 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart media/nome.mp4
```

## Dados provisórios para trocar
E-mail (`contato@jasonalves.com.br`), WhatsApp (`5511999999999`), links de Instagram/Vimeo/YouTube e os projetos de exemplo.
