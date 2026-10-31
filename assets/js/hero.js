/* Hero: iridescent noise-displaced blob (Three.js r128) */
(function () {
  var cv = document.getElementById('blob');
  if (!cv || typeof THREE === 'undefined') return;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
  document.documentElement.classList.add('webgl');
  renderer.setPixelRatio(window.innerWidth < 700 ? 1.25 : Math.min(2, window.devicePixelRatio || 1));
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
  camera.position.z = 6;

  var noise = [
    'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}',
    'vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
    'float snoise(vec3 v){',
    ' const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);',
    ' vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);',
    ' vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);',
    ' vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;',
    ' i=mod289(i);',
    ' vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));',
    ' float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;',
    ' vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);',
    ' vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);',
    ' vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);',
    ' vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));',
    ' vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
    ' vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);',
    ' vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));',
    ' p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;',
    ' vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;',
    ' return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));',
    '}'
  ].join('\n');

  var uniforms = { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uAmp: { value: .42 } };
  var mat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: noise + [
      'uniform float uTime; uniform vec2 uMouse; uniform float uAmp;',
      'varying vec3 vN; varying float vD; varying vec3 vV;',
      'void main(){',
      ' vec3 p=position;',
      ' float n=snoise(normal*1.2+vec3(uTime*.25,uTime*.18,0.0)+vec3(uMouse,0.0)*.4);',
      ' float n2=snoise(normal*3.0-uTime*.35)*.25;',
      ' float d=(n+n2)*uAmp;',
      ' p+=normal*d; vD=d;',
      ' vec4 mv=modelViewMatrix*vec4(p,1.0);',
      ' vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz);',
      ' gl_Position=projectionMatrix*mv;',
      '}'].join('\n'),
    fragmentShader: [
      'uniform float uTime; varying vec3 vN; varying float vD; varying vec3 vV;',
      'vec3 pal(float t){t=fract(t);vec3 v=vec3(.54,.42,1.0);vec3 c=vec3(1.0,.35,.21);vec3 s=vec3(.31,.82,1.0);vec3 p=vec3(1.0,.44,.71);if(t<.33)return mix(v,c,t/.33);if(t<.66)return mix(c,p,(t-.33)/.33);return mix(p,v,(t-.66)/.34);}',
      'void main(){',
      ' float fr=pow(1.0-max(dot(vN,vV),0.0),2.2);',
      ' vec3 col=pal(vD*1.4+fr*.6+uTime*.05);',
      ' col=mix(col,vec3(.05,.04,.08),smoothstep(-.1,-.45,vD)*.6);',
      ' col+=fr*vec3(.31,.82,1.0)*.55;',
      ' col*=.75+.35*smoothstep(-.3,.4,vD);',
      ' gl_FragColor=vec4(col,1.0);',
      '}'].join('\n')
  });
  var blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, window.innerWidth < 700 ? 32 : 64), mat);
  scene.add(blob);

  // orbiting dust
  var N = 900, pos = new Float32Array(N * 3);
  for (var i = 0; i < N; i++) {
    var r = 2.4 + Math.random() * 2.6, th = Math.random() * Math.PI * 2, ph = (Math.random() - .5) * 1.2;
    pos[i * 3] = Math.cos(th) * r; pos[i * 3 + 1] = Math.sin(ph) * r * .45; pos[i * 3 + 2] = Math.sin(th) * r;
  }
  var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xf4efe6, size: .022, transparent: true, opacity: .7 }));
  dust.rotation.x = .35; scene.add(dust);

  function resize() {
    var w = cv.clientWidth, h = cv.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    var mobile = w < 900;
    blob.position.set(mobile ? .9 : 2.35, mobile ? 1.75 : .2, 0);
    var s = mobile ? .62 : .95; blob.scale.set(s, s, s);
    dust.position.copy(blob.position);
  }
  resize(); addEventListener('resize', resize);

  var visible = true, sm = new THREE.Vector2(), scrollK = 0, clock = new THREE.Clock();
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) frame(); }).observe(cv);
  addEventListener('scroll', function () { scrollK = Math.min(1, scrollY / innerHeight); }, { passive: true });
  function frame() {
    if (!visible) return;
    var t = clock.getElapsedTime(), m = window.ANI ? window.ANI.mouse : { x: 0, y: 0 };
    sm.x += ((m.x / innerWidth - .5) * 2 - sm.x) * .05; sm.y += ((m.y / innerHeight - .5) * 2 - sm.y) * .05;
    uniforms.uTime.value = t; uniforms.uMouse.value.copy(sm);
    uniforms.uAmp.value = .42 + scrollK * .5;
    blob.rotation.y = t * .12 + sm.x * .4; blob.rotation.x = sm.y * .3;
    dust.rotation.y = -t * .05;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();
})();
