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
      else
        angle *= (vertex.length() / params.radius) * Math.abs(params.vortex);

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

  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(240,255,240,1)');
  gradient.addColorStop(0.22, 'rgba(0,150,255,.2)');
  gradient.addColorStop(1, 'rgba(0,50,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
}

function bufferGeometry() {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0
  ]);

  geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
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

    let vertex = new THREE.Vector3(point.x, point.y, 0);
    geometry.vertices.push(vertex);
    geometry.colors.push(new THREE.Color(pow, pow, 1));

    let t = Math.round(pow * 5), n = 0;
    while (n < t) {
      let vertex = new THREE.Vector3(point.x - dx + Math.random() * (dx * 2),
        point.y - dy + Math.random() * (dy * 2),
        0);
      geometry.vertices.push(vertex);
      geometry.colors.push(new THREE.Color(pow, pow, 1));
      n++;
    }
  }

  geometry.mergeVertices();
  geometry.verticesNeedUpdate = true;
  particles.geometry = geometry;
}

function spiral(params) {
  function lcg(value, modulus = Math.pow(2, 31), multiplier = 1103515245, increment = 12345) {
    return (value * multiplier + increment) % modulus;
  }

  return {
    toArray: function (now = 0) {
      const time = now / -60000;
      const modulus = params.modulus();
      const theta = params.armTheta();
      let points = [];
      let value = 0;

      for (let arm = 0; arm < params.arms; arm++)
        for (let stop = 0; stop < params.stops; stop++) {
          value = lcg(value, modulus);
          const pow = (stop / params.stops);
          const c = 1 - pow + 1 - params.dispersion;
          const r = value / modulus;
          const cr = (r - 0.5) * 2;
          const angle = (pow * Math.PI * 2 * params.revolutions) + (theta * arm);
          const radians = time + angle + (Math.PI * c * cr * params.sparse);
          const distance = Math.sqrt(pow) * params.radius;
          const x = Math.cos(radians) * distance;
          const y = Math.sin(radians) * distance;
          const z = 0;
          const size = (r - 0.5) * 2 + Math.pow(1.125, (1 - pow) * 8);
          const alpha = (Math.sin((r + time + pow) * Math.PI * 2) + 1) * 0.5;

          points.push({
            x: x, y: y, z: z,
            size: size, alpha: alpha,
          });
        }

      return points;
    },
  };
}

function downloadFile(data, fileName, json) {
  data = json ? JSON.stringify(data) : data;
  const blob = new Blob([data], { type: 'octet/stream' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();

  window.URL.revokeObjectURL(url);
}

function string2ArrayBuffer(string, callback) {
  const blob = new Blob([string]);
  const fr = new FileReader();

  fr.onload = function (e) {
    callback(e.target.result);
  };

  fr.readAsArrayBuffer(blob);
}

function PCDExporter(vertices) {
  let data = '# .PCD v.7 - Point Cloud Data file format\r\n';
  data += 'VERSION .7\r\n';
  data += 'FIELDS x y z rgb\r\n';
  data += 'SIZE 4 4 4 4\r\n';
  data += 'TYPE F F F F\r\n';
  data += 'COUNT 1 1 1 1\r\n';
  data += 'WIDTH ' + vertices.length + '\r\n';
  data += 'HEIGHT 1\r\n';
  data += 'VIEWPOINT 0 0 0 1 0 0 0\r\n';
  data += 'POINTS ' + vertices.length + '\r\n';
  data += 'DATA ascii\r\n';

  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];
    let x = v.x.toFixed(5);
    let y = v.y.toFixed(5);
    let z = v.z.toFixed(5);
    data += x + ' ' + y + ' ' + z + ' 4.2108e+06';
    if (i < vertices.length - 1)
      data += '\r\n';
  }

  return data;
}

function PLYExporter(vertices) {
  let model = {
    vertex: {
      x: [],
      y: [],
      z: [],
    },
    face: {
      vertex_index: [],
    },
  };

  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];
    model.vertex.x.push(v.x);
    model.vertex.y.push(v.y);
    model.vertex.z.push(v.z);
  }

  let data = writePLY(model);
  return data;
}

function XYZExporter(vertices) {
  let data = '';

  for (let i = 0; i < vertices.length; i++) {
    let v = vertices[i];
    let x = v.x.toFixed(6);
    let y = v.y.toFixed(6);
    let z = v.z.toFixed(6);
    data += x + ' ' + y + ' ' + z + '\r\n';
  }

  return data;
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
  gui.add(params, 'arms', 1, 10).onChange(onChange);
  gui.add(params, 'stops', 1000, 10000).onChange(onChange);
  gui.add(params, 'revolutions', 1.1, 3.1).onChange(onChange);
  gui.add(params, 'radius', 300, 1000).onChange(onChange);
  gui.add(params, 'sparse', 0.1, 1).onChange(onChange);
  gui.add(params, 'dispersion', 0.01, 1).onChange(onChange);
  gui.add(params, 'bulge', 0.01, 1).onChange(onChange);
  gui.add(params, 'vortex', -1, 1, 0.01).onChange(onChange);
  gui.add(params, 'randomize');
  gui.add(params, 'exportXYZ').name('EXPORT *.XYZ');
  return gui;
})();
