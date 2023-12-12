import WindowManager from './WindowManager.js'

const t = THREE;
let camera, scene, renderer, world;
let cubes = [];
let sceneOffsetTarget = { x: 0, y: 0 };
let sceneOffset = { x: 0, y: 0 };
let windowManager;
let initialized = false;

window.onload = () => { if (document.visibilityState != 'hidden') init(); };
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState != 'hidden' && !initialized) init();
});

function init() {
	initialized = true;
	// thêm thời gian chờ vì window.offsetX lấy giá trị sai trước một khoảng thời gian ngắn 
	setTimeout(() => {
		setupScene();
		setupWindowManager();
		resize();
		updateWindowShape(false);
		render();
		window.addEventListener('resize', resize);
	}, 500);
}

function setupWindowManager() {
	windowManager = new WindowManager();
	windowManager.setWinShapeChangeCallback(updateWindowShape);
	windowManager.setWinChangeCallback(windowsUpdated);
	let metaData = { foo: "bar" };
	windowManager.init(metaData);
	windowsUpdated();
}

function windowsUpdated() {
	let wins = windowManager.getWindows();
	cubes.forEach(c => world.remove(c));
	cubes = [];
	for (let i = 0; i < wins.length; i++) {
		let win = wins[i];
		let c = new t.Color();
		c.setHSL(i * .1, 1.0, 0.5);
		let s = 100 + i * 50;
		let cube = new t.Mesh(new t.BoxGeometry(s, s, s), new t.MeshBasicMaterial({ color: c, wireframe: true }));

		cube.position.x = win.shape.x + (win.shape.w * .5);
		cube.position.y = win.shape.y + (win.shape.h * .5);
		world.add(cube);
		cubes.push(cube);
	}
}

function updateWindowShape(easing = true) {
	sceneOffsetTarget = { x: -window.screenX, y: -window.screenY };
	if (!easing) sceneOffset = sceneOffsetTarget;
}

function setupScene() {
	camera = new t.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);
	camera.position.z = 2.5;
	scene = new t.Scene();
	scene.background = new t.Color(0.0);
	scene.add(camera);
	renderer = new t.WebGLRenderer({ antialias: true, depthBuffer: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	world = new t.Object3D();
	scene.add(world);
	renderer.domElement.setAttribute("id", "scene");
	document.body.appendChild(renderer.domElement);
}

function render ()
{
	let t = (new Date().getTime() - new Date().setHours(0, 0, 0, 0)) / 1000.0;
	windowManager.update();
	// Tính vị trí mới dựa trên delta giữa offset hiện tại và offset mới nhân với giá trị falloff tạo smooth effect
	let falloff = .05;
	sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
	sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);
	// Gán offset vào world
	world.position.x = sceneOffset.x;
	world.position.y = sceneOffset.y;

	let wins = windowManager.getWindows();
	// lặp qua tất cả các hình và cập nhật vị trí dựa trên vị trí cửa sổ hiện tại
	for (let i = 0; i < cubes.length; i++) {
		let cube = cubes[i];
		let win = wins[i];
		let _t = t;
		let posTarget = { x: win.shape.x + (win.shape.w * 0.5), y: win.shape.y + (win.shape.h * 0.5) };

		cube.position.x = cube.position.x + (posTarget.x - cube.position.x) * falloff;
		cube.position.y = cube.position.y + (posTarget.y - cube.position.y) * falloff;
		cube.rotation.x = _t * .5;
		cube.rotation.y = _t * .3;
	}
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

// Thay đổi kích thước render phù hợp với kích thước cửa sổ
function resize () {
	let width = window.innerWidth;
	let height = window.innerHeight;
	camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000);
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}