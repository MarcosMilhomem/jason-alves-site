/* Jason Alves — 3D props: lens iris (loader + outro) and a real-proportion clapperboard.
   Loaded as an ES module; the page works without it (SVG fallbacks). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const DPR = Math.min(window.devicePixelRatio || 1, 1.5);

function makeRenderer(canvas){
  const r = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
  r.setPixelRatio(DPR);
  r.setClearColor(0x000000, 0);
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}
function envFor(renderer, scene){
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(renderer), .04).texture;
  pm.dispose();
}

/* ------------------------------------------------------------------ IRIS
   Same geometry as the SVG version (viewBox units, ±100), so the page's
   timelines drive it through the same {r, twist} state. Blades are bevelled
   anodised-metal plates, lit by an environment map plus a warm light that
   leaks through the opening. */
class Iris3D {
  constructor(host, state, N = 9){
    this.host = host; this.state = state; this.N = N;
    const cv = this.canvas = document.createElement('canvas');
    cv.className = 'iris3d';
    cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv);
    const R = this.renderer = makeRenderer(cv);
    const scene = this.scene = new THREE.Scene();
    envFor(R, scene);
    scene.environmentIntensity = .55;
    this.camera = new THREE.PerspectiveCamera(32, 1, 1, 4000);

    const mat = new THREE.MeshStandardMaterial({color:0x121212, metalness:.9, roughness:.34});
    const geo = new RoundedBoxGeometry(600, 600, 3, 3, 1.2);
    this.blades = [];
    for (let i = 0; i < N; i++){
      const pivot = new THREE.Group();
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = .018;            // slight pitch so neighbours overlap like real stacked blades
      pivot.add(m); scene.add(pivot);
      this.blades.push({pivot, m, z: i * 1.6});
    }
    // inner barrel ring — catches the light at the edge of the frame
    const ring = new THREE.Mesh(new THREE.TorusGeometry(160, 6, 24, 160), new THREE.MeshStandardMaterial({color:0x0c0c0c, metalness:.95, roughness:.25}));
    ring.position.z = 12; scene.add(ring); this.ring = ring;

    const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-300, 420, 700); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd2b0, .7); rim.position.set(500, -300, 300); scene.add(rim);
    this.leak = new THREE.PointLight(0xffa060, 0, 520, 1.6); this.leak.position.set(0, 0, 60); scene.add(this.leak);

    this.resize = this.resize.bind(this);
    addEventListener('resize', this.resize);
    this.resize();
  }
  resize(){
    const w = this.host.clientWidth || innerWidth, h = this.host.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    const A = w / h, hy = A >= 1 ? 100 / A : 100;          // matches SVG preserveAspectRatio="slice"
    this.camera.aspect = A;
    this.camera.position.set(0, 0, hy / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
    this.camera.updateProjectionMatrix();
    this.hy = hy; this.hx = hy * A;
    this.render();
  }
  render(){
    const {r: rr, twist} = this.state, N = this.N, r = Math.max(0, rr);
    const tanA = Math.tan(Math.PI / N), x0 = -r * tanA - 1.5;
    this.blades.forEach((b, i) => {
      b.pivot.rotation.z = -THREE.MathUtils.degToRad(i * 360 / N + twist);
      b.m.position.set(x0 + 300, -r - 300, b.z);
    });
    const open = Math.min(1, r / 60);
    this.leak.intensity = 2.2 * open * (1 - Math.min(1, r / 170));
    this.ring.visible = r < 150;
    this.ring.scale.setScalar(Math.max(this.hx, this.hy) / 150);
    this.renderer.render(this.scene, this.camera);
  }
  hideIfOpen(){ this.canvas.style.visibility = this.state.r > 168 ? 'hidden' : ''; }
}

/* ------------------------------------------------------------------ SLATE
   Real clapperboard proportions (cm): board 28 × 24 × 0.6, sticks 28 × 3 × 1.1.
   Glossy black acrylic, printed grid, hand-written marker fields, metal hinge. */
function slateTexture(logo){
  const W = 2048, H = Math.round(2048 * 24 / 28), c = document.createElement('canvas');
  c.width = W; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#121212'); g.addColorStop(1, '#070707');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // fine wear: scratches and chalk dust
  for (let i = 0; i < 260; i++){
    x.strokeStyle = `rgba(255,255,255,${Math.random()*.035})`; x.lineWidth = Math.random()*1.5;
    const sx = Math.random()*W, sy = Math.random()*H, a = Math.random()*Math.PI, l = 20 + Math.random()*180;
    x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + Math.cos(a)*l, sy + Math.sin(a)*l); x.stroke();
  }
  const m = 70, line = (x1, y1, x2, y2) => { x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
  x.strokeStyle = 'rgba(240,240,236,.92)'; x.lineWidth = 7;
  const rows = [m, 330, 560, 960, 1180, 1400, H - m];
  x.strokeRect(m, m, W - 2*m, H - 2*m);
  rows.slice(1, -1).forEach(y => line(m, y, W - m, y));
  line(W/3, 560, W/3, 960); line(W*2/3, 560, W*2/3, 960); line(W/2, 1400, W/2, H - m);

  const label = (t, px, py) => { x.fillStyle = 'rgba(240,240,236,.85)'; x.font = '500 46px Saira, Arial, sans-serif'; x.fillText(t, px, py); };
  const ink = (t, px, py, size, rot = 0) => {
    x.save(); x.translate(px, py); x.rotate(rot);
    x.fillStyle = 'rgba(250,250,246,.95)'; x.font = `${size}px "Permanent Marker", "Comic Sans MS", cursive`;
    x.shadowColor = 'rgba(255,255,255,.25)'; x.shadowBlur = 2; x.fillText(t, 0, 0); x.restore();
  };
  // header: logo + name, printed
  if (logo && logo.complete && logo.naturalWidth){ const lh = 190, lw = lh * logo.naturalWidth / logo.naturalHeight; x.drawImage(logo, m + 40, m + 35, lw, lh); }
  x.fillStyle = '#f2f2ee'; x.font = '400 92px Michroma, "Arial Black", sans-serif'; x.fillText('JASON ALVES', m + 330, m + 175);
  x.fillStyle = '#ff1620'; x.beginPath(); x.arc(W - m - 90, m + 130, 26, 0, Math.PI*2); x.fill();

  label('PROD.', m + 30, 395); ink('Seu próximo filme', m + 60, 520, 120, -.012);
  label('ROLL', m + 30, 625); label('SCENE', W/3 + 30, 625); label('TAKE', W*2/3 + 30, 625);
  ink('A001', m + 80, 880, 220, -.02); ink('01', W/3 + 150, 880, 230, .01); ink('1', W*2/3 + 230, 880, 240, -.015);
  label('DIRECTOR', m + 30, 1025); ink('Jason Alves', m + 380, 1135, 110, -.01);
  label('CAMERA', m + 30, 1245); ink('A-cam  ·  50mm  ·  T1.8', m + 380, 1355, 96, .008);
  const d = new Date(), dd = [d.getDate(), d.getMonth()+1, d.getFullYear()%100].map(n => String(n).padStart(2,'0')).join('.');
  label('DATE', m + 30, 1465); ink(dd, m + 60, 1620, 120, -.01);
  label('FPS', W/2 + 30, 1465); ink('24', W/2 + 60, 1620, 120, .012);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function stickTexture(){
  const c = document.createElement('canvas'); c.width = 2048; c.height = 220; const x = c.getContext('2d');
  x.fillStyle = '#0a0a0a'; x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = '#f1f0ec';
  for (let i = -2; i < 14; i++){
    const s = i * 180;
    x.beginPath(); x.moveTo(s, c.height); x.lineTo(s + 90, c.height); x.lineTo(s + 90 + 120, 0); x.lineTo(s + 120, 0); x.closePath(); x.fill();
  }
  for (let i = 0; i < 140; i++){ x.fillStyle = `rgba(0,0,0,${Math.random()*.25})`; x.fillRect(Math.random()*c.width, Math.random()*c.height, 1 + Math.random()*6, 1 + Math.random()*3); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function boxWithFront(w, h, d, frontMat, sideMat){
  const geo = new RoundedBoxGeometry(w, h, d, 4, Math.min(d, h) * .18);
  // RoundedBoxGeometry has one group; split front (+z) faces into material 1 by normal
  const nrm = geo.attributes.normal, idx = geo.index;
  geo.clearGroups();
  const tris = idx ? idx.count / 3 : nrm.count / 3;
  let cur = -1, start = 0;
  for (let t = 0; t < tris; t++){
    const a = idx ? idx.getX(t*3) : t*3;
    const m = nrm.getZ(a) > .9 ? 1 : 0;
    if (m !== cur){ if (cur !== -1) geo.addGroup(start*3, (t - start)*3, cur); cur = m; start = t; }
  }
  geo.addGroup(start*3, (tris - start)*3, cur);
  // planar UVs for the front so textures are not stretched by the bevel
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i)/w + .5, pos.getY(i)/h + .5);
  return new THREE.Mesh(geo, [sideMat, frontMat]);
}

class Slate3D {
  constructor(host, state){
    this.host = host; this.state = state;
    const cv = this.canvas = document.createElement('canvas'); cv.className = 'slate3d'; cv.setAttribute('aria-hidden','true');
    host.appendChild(cv);
    const R = this.renderer = makeRenderer(cv);
    const scene = this.scene = new THREE.Scene(); envFor(R, scene); scene.environmentIntensity = .7;
    this.camera = new THREE.PerspectiveCamera(28, 1.6, 1, 500); this.camera.position.set(0, 2, 82);

    const logo = new Image(); logo.src = 'media/logo-light.png';
    const black = new THREE.MeshPhysicalMaterial({color:0x0b0b0b, roughness:.3, metalness:0, clearcoat:.7, clearcoatRoughness:.2});
    const face = new THREE.MeshPhysicalMaterial({map: slateTexture(logo), roughness:.38, metalness:0, clearcoat:.6, clearcoatRoughness:.22});
    logo.onload = () => { face.map.dispose(); face.map = slateTexture(logo); face.needsUpdate = true; };
    document.fonts && document.fonts.ready.then(() => { face.map.dispose(); face.map = slateTexture(logo); face.needsUpdate = true; });
    const stripes = new THREE.MeshPhysicalMaterial({map: stickTexture(), roughness:.32, clearcoat:.5, clearcoatRoughness:.25});
    const metal = new THREE.MeshStandardMaterial({color:0xb9b9b9, metalness:1, roughness:.28});

    const rig = this.rig = new THREE.Group(); scene.add(rig);
    const board = boxWithFront(28, 24, .6, face, black); board.castShadow = true; rig.add(board);
    const low = boxWithFront(28, 3, 1.1, stripes, black); low.position.set(0, 12 + 1.5, .25); low.castShadow = true; rig.add(low);
    const hinge = this.hinge = new THREE.Group(); hinge.position.set(-14 + .6, 15, .25); rig.add(hinge);
    const top = boxWithFront(28, 3, 1.1, stripes, black); top.position.set(14 - .6, 1.5, 0); top.castShadow = true; hinge.add(top);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.6, 32), metal); pin.rotation.x = Math.PI/2; pin.position.set(-14 + .6, 15, .25); rig.add(pin);
    const plate = new THREE.Mesh(new RoundedBoxGeometry(2.2, 4.4, .25, 2, .08), metal); plate.position.set(-14 + 1.3, 15, .9); rig.add(plate);
    [-1, 1].forEach(s => { const sc = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .2, 16), metal); sc.rotation.x = Math.PI/2; sc.position.set(-14 + 1.3, 15 + s*1.4, 1.05); rig.add(sc); });

    // soft contact shadow baked into a texture (no shadow map pass every frame)
    const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sx = sc.getContext('2d');
    const gr = sx.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(46, 40), new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc), transparent:true, depthWrite:false}));
    blob.position.set(3, -4, -6); rig.add(blob);
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-30, 40, 60); 
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff3b30, 1.2); rim.position.set(40, 10, -20); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffe6cc, .5); fill.position.set(30, -10, 40); scene.add(fill);

    this.mx = 0; this.my = 0; this.tx = 0; this.ty = 0;
    addEventListener('pointermove', e => { this.tx = (e.clientX / innerWidth - .5); this.ty = (e.clientY / innerHeight - .5); });
    this.resize = this.resize.bind(this); addEventListener('resize', this.resize); this.resize();
    const loop = t => { requestAnimationFrame(loop); this.frame(t / 1000); };
    requestAnimationFrame(loop);
  }
  resize(){
    const w = this.host.clientWidth || 600, h = this.host.clientHeight || 400;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h;
    const fitH = 40, fitW = 36;  // board + open stick, with air
    const d1 = (fitH/2) / Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2));
    const d2 = (fitW/2) / (Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2)) * this.camera.aspect);
    this.camera.position.z = Math.max(d1, d2); this.camera.updateProjectionMatrix();
  }
  frame(t){
    const r = this.host.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || this.state.out >= .999) return;
    this.mx += (this.tx - this.mx) * .06; this.my += (this.ty - this.my) * .06;
    const out = this.state.out;
    this.hinge.rotation.z = THREE.MathUtils.degToRad(this.state.clap);
    this.rig.rotation.set(.1 + this.my*.25 + Math.sin(t*.6)*.015 + out*.6, -.38 + this.mx*.45 + Math.sin(t*.4)*.02, out*-.35);
    this.rig.position.set(0, -2 + Math.sin(t*.8)*.25 - out*42, 0);
    this.renderer.render(this.scene, this.camera);
  }
}


/* ------------------------------------------------------------------ PARTICLE LOGO
   Samples the logo PNG into points. Each point starts scattered, swirls in and settles on its
   spot in the mark (red dot stays red). One draw call, ~7k points, driven by a single uniform. */
class ParticleLogo {
  constructor(canvas, src, logoW, logoH, W, H){
    this.W = W; this.H = H; this.logoW = logoW; this.logoH = logoH;
    const R = this.renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:false, powerPreference:'high-performance'});
    R.setPixelRatio(DPR); R.setSize(W, H, false); R.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-W/2, W/2, H/2, -H/2, -10, 10);
    this.u = {uP:{value:0}, uT:{value:0}, uPR:{value:DPR}, uA:{value:1}};
    this.ready = new Promise((res, rej) => { const im = new Image(); im.onload = () => { try { this.build(im); res(); } catch(e){ rej(e); } }; im.onerror = rej; im.src = src; });
  }
  build(im){
    const sw = 190, sh = Math.round(sw * im.naturalHeight / im.naturalWidth);
    const c = document.createElement('canvas'); c.width = sw; c.height = sh;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0, sw, sh);
    const d = x.getImageData(0, 0, sw, sh).data, src = [];
    for (let y = 0; y < sh; y++) for (let xx = 0; xx < sw; xx++){
      const i = (y * sw + xx) * 4; if (d[i+3] > 140) src.push(xx, y, (d[i] > 150 && d[i+1] < 110) ? 1 : 0);
    }
    let n = src.length / 3; const MAX = 7000, keep = Math.min(1, MAX / n);
    const pos = [], start = [], rnd = [], col = [];
    const reach = Math.max(this.W, this.H) * .5;
    for (let k = 0; k < n; k++){
      if (Math.random() > keep) continue;
      const px = src[k*3] + Math.random() - .5, py = src[k*3+1] + Math.random() - .5;
      pos.push((px / sw - .5) * this.logoW, (.5 - py / sh) * this.logoH, 0);
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * reach;
      start.push(Math.cos(a) * r, Math.sin(a) * r);
      rnd.push(Math.random(), Math.random(), Math.random());
      col.push(src[k*3+2]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aStart', new THREE.Float32BufferAttribute(start, 2));
    g.setAttribute('aR', new THREE.Float32BufferAttribute(rnd, 3));
    g.setAttribute('aC', new THREE.Float32BufferAttribute(col, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: this.u, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute vec2 aStart; attribute vec3 aR; attribute float aC;
        uniform float uP, uT, uPR; varying float vC; varying float vA;
        void main(){
          float t = clamp((uP - aR.x * .55) / .45, 0., 1.);
          float e = t * t * (3. - 2. * t);
          vec2 tgt = position.xy, d = aStart - tgt;
          float ang = (1. - e) * (1.6 + aR.z * 2.2);
          float s = sin(ang), c = cos(ang);
          vec2 q = vec2(d.x * c - d.y * s, d.x * s + d.y * c) * (1. - e);
          vec2 p = tgt + q + vec2(sin(uT * 1.7 + aR.z * 20.), cos(uT * 1.3 + aR.y * 17.)) * .55 * e;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0., 1.);
          gl_PointSize = (1.2 + aR.y * 1.5 + (1. - e) * 1.4) * uPR;
          vC = aC; vA = .3 + .7 * e;
        }`,
      fragmentShader: `varying float vC; varying float vA; uniform float uA;
        void main(){
          float r = length(gl_PointCoord - .5); if (r > .5) discard;
          float a = smoothstep(.5, .12, r) * vA * uA;
          vec3 col = mix(vec3(.96, .96, .95), vec3(1., .09, .125), vC);
          gl_FragColor = vec4(col * a, a);
        }`
    });
    this.points = new THREE.Points(g, m); this.points.frustumCulled = false; this.scene.add(this.points);
    this.count = pos.length / 3;
  }
  setP(v){ this.u.uP.value = v; this.render(); }
  render(){ this.u.uT.value = performance.now() / 1000; this.renderer.render(this.scene, this.camera); }
  dispose(){ try { this.points.geometry.dispose(); this.points.material.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss(); } catch(e){} }
}

window.JA3D = {Iris3D, Slate3D, ParticleLogo, THREE};
window.dispatchEvent(new Event('ja3d-ready'));
