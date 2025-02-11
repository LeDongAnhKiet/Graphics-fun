const cuboid = document.querySelector('.cuboid');
const faces = document.querySelectorAll('.face');
const cellSize = 50;
let isDragging = false;
let lastX, lastY;
let rotX = -20, rotY = -30;

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let dx = e.clientX - lastX;
    let dy = e.clientY - lastY;
    rotY += dx * 0.5;
    rotX -= dy * 0.5;
    cuboid.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    lastX = e.clientX;
    lastY = e.clientY;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

faces.forEach(face => {
    let width = face.offsetWidth;
    let height = face.offsetHeight;
    let cols = Math.floor(width / cellSize);
    let rows = Math.floor(height / cellSize);
    face.style.display = 'grid';
    face.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    face.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

    for (let i = 0; i < cols * rows; i++) {
        let cell = document.createElement('div');
        face.appendChild(cell);
    }
});
