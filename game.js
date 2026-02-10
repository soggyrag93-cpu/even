const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Bike {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 100;
        this.height = 30;
        this.rotation = 0; // in radians
        this.angularVelocity = 0;

        // physics
        this.gravity = 1;
        this.acceleration = 0.5;
        this.maxSpeed = 15;
        this.friction = 0.98;
        this.rotationSpeed = 0.05;
    }

    update(keys) {
        // forward/backward
        if (keys['ArrowRight']) this.vx += this.acceleration;
        if (keys['ArrowLeft']) this.vx -= this.acceleration;

        // rotate in air
        if (keys['ArrowUp']) this.angularVelocity -= this.rotationSpeed;
        if (keys['ArrowDown']) this.angularVelocity += this.rotationSpeed;

        // physics
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;

        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.angularVelocity;

        // ground collision
        const groundY = canvas.height - 100;
        if (this.y + this.height/2 > groundY) {
            this.y = groundY - this.height/2;
            this.vy = 0;
            this.angularVelocity *= 0.5; // dampen rotation on landing
            this.rotation *= 0.7;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        // bike body
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        // wheels
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-this.width/2 + 20, this.height/2, 15, 0, Math.PI*2);
        ctx.arc(this.width/2 - 20, this.height/2, 15, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

// terrain
function drawGround() {
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height-100, canvas.width, 100);
}

// input
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

const bike = new Bike(200, canvas.height-200);

function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawGround();
    bike.update(keys);
    bike.draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
