const cube = document.querySelector('.cuboid');
let isDragging = false;
let lastX, lastY;
let rotX = 0, rotY = 0;

document.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let dx = e.clientX - lastX;
    let dy = e.clientY - lastY;
    rotY  += dx * 0.5;
    rotX -= dy * 0.5;
    cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    lastX = e.clientX;
    lastY = e.clientY;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});
