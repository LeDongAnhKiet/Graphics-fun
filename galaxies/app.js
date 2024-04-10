let scene, camera, controls, renderer, particles,
  width, height, w2, h2, mouse = { x: 0, y: 0 }, tick = 0;

function createScene() {
  width = window.innerWidth;
  height = window.innerHeight;
  w2 = width / 2;
  h2 = height / 2;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 20000);
  camera.position.z = 100;
  camera.position.y = -300;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;

  document.getElementById('scene').appendChild(renderer.domElement);
  addListeners();
  controls = new THREE.OrbitControls(camera, renderer.domElement);
}

function addListeners() {
  document.addEventListener('mousemove', handleMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function handleMouseMove(event) {
  mouse = { x: event.clientX, y: event.clientY };
}

function onWindowResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  w2 = width / 2;
  h2 = height / 2;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function vortex() {
  if (tick % 2 === 0 && params && params.vortex !== 0) {
    const axis = new THREE.Vector3(0, 0, 1);
    const vertices = particles.geometry.vertices;

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const angle = -Math.PI / 180;

      if (params.vortex > 0)
        angle *= (1 - vertex.length() / params.radius) * params.vortex;
      else angle *= (vertex.length() / params.radius) * Math.abs(params.vortex);

      vertex.applyAxisAngle(axis, angle);
    }
    particles.geometry.verticesNeedUpdate = true;
  }
  tick++;
}

function loop() {
  vortex();
  particles.rotation.z -= 0.0025;
  render();
  requestAnimationFrame(loop);
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}

function sprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0,    'rgba (255, 255,  255, 1)');
  gradient.addColorStop(0.2,  'rgba (240, 255,  240, 1)');
  gradient.addColorStop(0.22, 'rgba (0,   150,  255, .2)');
  gradient.addColorStop(1,    'rgba (0,   50,   255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function createObjects() {
  const texture = new THREE.CanvasTexture(sprite());
  const geometry = new THREE.Geometry();
  const material = new THREE.PointsMaterial({
    size: 8,
    map: texture,
    vertexColors: THREE.VertexColors,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function onChange(params) {
  let dx = 10 - 10 * params.dispersion * (1 - params.bulge);
  let dy = 10 - 10 * params.dispersion * (1 - params.bulge);
  let dz = 40 - 40 * params.dispersion * (1 - params.bulge);

  let geometry = new THREE.Geometry();
  let points = spiral(params).toArray();

  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    let distance = Math.pow(Math.pow(point.x, 2) + Math.pow(point.y, 2), 0.5);
    let pow = Math.max(0, ((params.radius * 0.8) - distance) / (params.radius * 0.8));
    pow = (1 - Math.cos(pow * Math.PI)) * params.bulge;

    let vertex = new THREE.Vector3(point.x, point.y, (-dz + (dz * 2) * Math.random()) * pow);
    geometry.vertices.push(vertex);
    geometry.colors.push(new THREE.Color(pow, pow, 1));

    let t = Math.round(pow * 5), n = 0;
    while (n < t) {
      let vertex = new THREE.Vector3(
        point.x - dx + Math.random() * (dx * 2),
        point.y - dy + Math.random() * (dy * 2),
        (-dz + (dz * 2) * Math.random()) * pow
      );
      geometry.vertices.push(vertex);
      geometry.colors.push(new THREE.Color(pow, pow, 1));
      n++;
    }
  }
  geometry.mergeVertices();
  geometry.verticesNeedUpdate = true;
  particles.geometry = geometry;
}

function init() {
  createScene();
  createObjects();
  loop();
}

init();
onChange(params);

let gui = (function datgui() {
  let gui = new dat.GUI();
  gui.closed = true;
  gui.add(params, 'arms',         1,    10)     .onChange (onChange);
  gui.add(params, 'stops',        1000, 10000)  .onChange (onChange);
  gui.add(params, 'revolutions',  1.1,  3.1)    .onChange (onChange);
  gui.add(params, 'radius',       300,  1000)   .onChange (onChange);
  gui.add(params, 'sparse',       0.1,  1)      .onChange (onChange);
  gui.add(params, 'dispersion',   0.01, 1)      .onChange (onChange);
  gui.add(params, 'bulge',        0.01, 1)      .onChange (onChange);
  gui.add(params, 'vortex',       -1,   1, 0.01).onChange (onChange);
  gui.add(params, 'randomize');
  gui.add(params, 'exportXYZ')                .name ('EXPORT *.XYZ');
  return gui;
}) ();
