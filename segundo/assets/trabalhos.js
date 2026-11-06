/* Lista de trabalhos — é daqui que saem o carrossel da home e a página /trabalhos.
   Para adicionar um trabalho, copie um item e troque os campos:
     titulo, cliente, categoria  → texto mostrado no card (a categoria também vira filtro)
     formato                     → ex.: "Reels 9:16", "Publicidade 30″"
     poster                      → imagem de capa (vertical, 540×960)
     loop                        → vídeo curto, mudo, que roda no card (vertical, 540×960, sem áudio)
     video                       → filme completo com som, aberto no player (deixe vazio se não houver)
     exemplo: true               → marca o card como "Exemplo" (apague quando for um trabalho real) */
window.TRABALHOS = [
  {titulo:'Forró de Respeito', cliente:'Recanto Nordestino', categoria:'Reels', formato:'Reels 9:16',
   poster:'/segundo/media/recanto-poster.jpg', loop:'/segundo/media/recanto-loop.mp4', video:'/segundo/media/recanto.mp4'},
  {titulo:'Maré Alta', cliente:'Hotelaria', categoria:'Filme de marca', formato:'Filme de marca',
   poster:'/segundo/media/work-sunset.jpg', loop:'/segundo/media/work-sunset-loop.mp4', exemplo:true},
  {titulo:'Noite Elétrica', cliente:'Automotivo', categoria:'Publicidade', formato:'Publicidade 30″',
   poster:'/segundo/media/work-city.jpg', loop:'/segundo/media/work-city-loop.mp4', exemplo:true},
  {titulo:'Duna', cliente:'Moda', categoria:'Publicidade', formato:'Campanha',
   poster:'/segundo/media/work-dunes.jpg', loop:'/segundo/media/work-dunes-loop.mp4', exemplo:true},
  {titulo:'Depois da Chuva', cliente:'Música', categoria:'Videoclipe', formato:'Videoclipe',
   poster:'/segundo/media/work-rain.jpg', loop:'/segundo/media/work-rain-loop.mp4', exemplo:true},
  {titulo:'Pela Última Vez', cliente:'Eventos', categoria:'Eventos', formato:'Aftermovie',
   poster:'/segundo/media/work-concert.jpg', loop:'/segundo/media/work-concert-loop.mp4', exemplo:true}
];
