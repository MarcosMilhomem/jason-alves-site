# Jason Alves · site

Site estático: um único `index.html` com HTML, CSS e um pouco de JavaScript (player, formulário para WhatsApp, copiar e-mail). Sem bibliotecas de animação e sem build. A Vercel publica a pasta como está.

## Estrutura da página
1. Cabeçalho fixo com o botão **Pedir orçamento**
2. Hero: o que ele faz, os dois botões e o vídeo vertical
3. Trabalhos: grade de cards (o primeiro é real, os outros são exemplos)
4. Serviços
5. Como funciona (3 etapas)
6. Faixa vermelha com os segmentos atendidos
7. Contato: e-mail, redes e formulário que abre o WhatsApp
8. Rodapé

## Trocar ou adicionar trabalhos
Na seção `#trabalhos` do `index.html`, cada card é um `<li class="work">`. Para um trabalho com vídeo, use o formato do primeiro card:

```html
<button class="work-media" type="button" data-play="media/arquivo.mp4" data-title="Título · Cliente">
  <img src="media/arquivo-poster.jpg" alt="Descrição da imagem" loading="lazy">
  <span class="badge">Assistir</span>
</button>
```

### Preparar vídeos e capas (ffmpeg)
```bash
ffmpeg -i original.mov -vf scale=720:1280 -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart media/nome.mp4
ffmpeg -ss 4 -i original.mov -frames:v 1 -vf scale=540:960 -q:v 4 media/nome-poster.jpg
```

## Dados provisórios para trocar
E-mail (`contato@jasonalves.com.br`), WhatsApp (`5511999999999`, aparece em dois lugares), links de Instagram e Vimeo, e os cinco trabalhos marcados como **Exemplo**.

## Versões anteriores (animadas)
- `referencia-producao-animada`: o site animado que estava no ar antes desta versão.
- `referencia-animada`: a versão animada completa, com partículas, leque, números com vídeo e índice lateral.
