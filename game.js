const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ----- Terrain -----
class Terrain {
    constructor() {
        this.points = [];
        let x = 0;
        while (x < canvas.width*3) {
            const y = canvas.height - 100 - Math.random()*150;
            this.points.push({x, y});
            x += 200 + Math.random()*100;
        }
    }

    getGroundY(x) {
        for (let i = 0; i < this.points.length-1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i+1];
            if (x >= p1.x && x <= p2.x) {
                const t = (x - p1.x)/(p2.x - p1.x);
                return p1.y*(1-t) + p2.y*t;
            }
        }
        return canvas.height - 100;
    }

    getSlope(x) {
        for (let i = 0; i < this.points.length-1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i+1];
            if (x >= p1.x && x <= p2.x) {
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }
        }
        return 0;
    }

    draw(offsetX) {
        // Terrain gradient
        const grad = ctx.createLinearGradient(0,0,0,canvas.height);
        grad.addColorStop(0, "#8B4513");
        grad.addColorStop(1, "#654321");
        ctx.fillStyle = grad;
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let i = 0; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x - offsetX, this.points[i].y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Optional: terrain outline
        ctx.strokeStyle = "#4d2e1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < this.points.length; i++) {
            if (i === 0) ctx.moveTo(this.points[i].x - offsetX, this.points[i].y);
            else ctx.lineTo(this.points[i].x - offsetX, this.points[i].y);
        }
        ctx.stroke();
    }
}

// ----- Particles -----
class Particle {
    constructor(x, y, color, size=3) {
        this.x = x; this.y = y;
        this.vx = (Math.random()-0.5)*3;
        this.vy = -Math.random()*2;
        this.alpha = 1;
        this.color = color;
        this.size = size;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.alpha -= 0.02;
    }

    draw(offsetX) {
        ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x - offsetX, this.y, this.size, 0, Math.PI*2);
        ctx.fill();
    }
}

const particles = [];

// ----- Bike -----
class Bike {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.angularVelocity = 0;
        this.width = 100;
        this.height = 30;
        this.gravity = 1;
        this.acceleration = 0.6;
        this.maxSpeed = 20;
        this.friction = 0.98;
        this.rotationSpeed = 0.05;
        this.crashed = false;
    }

    update(keys, terrain) {
        if (!this.crashed) {
            if (keys['ArrowRight']) this.vx += this.acceleration;
            if (keys['ArrowLeft']) this.vx -= this.acceleration;
            if (keys['ArrowUp']) this.angularVelocity -= this.rotationSpeed;
            if (keys['ArrowDown']) this.angularVelocity += this.rotationSpeed;

            this.vy += this.gravity;
            this.vx *= this.friction;
            this.vy *= this.friction;
            if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
            if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;

            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.angularVelocity;

            const groundY = terrain.getGroundY(this.x) - this.height/2;
            const slope = terrain.getSlope(this.x);

            if (this.y > groundY) {
                if (Math.abs(this.angularVelocity) > 0.5 || Math.abs(this.vy) > 20) {
                    this.crashed = true;
                    this.vx = 0; this.vy = 0; this.angularVelocity = 0;
                    for (let i=0;i<20;i++) particles.push(new Particle(this.x,this.y,"200,200,200",4));
                } else {
                    this.y = groundY;
                    this.vy = 0;
                    this.angularVelocity *= 0.5;
                    this.rotation *= 0.7;
                    for (let i=0;i<5;i++) particles.push(new Particle(this.x,this.y+this.height/2,"150,75,0",3));
                }
            }
        }
    }

    draw(offsetX) {
        ctx.save();
        ctx.translate(this.x - offsetX, this.y);
        ctx.rotate(this.rotation);

        // Detailed bike body
        ctx.fillStyle = this.crashed ? 'gray' : 'red';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

        // Add bike front shield / seat
        ctx.fillStyle = "#222";
        ctx.fillRect(10, -this.height/2, 20, 10);

        // Wheels with rotation
        const wheelOffsetY = 10 * Math.sin(Date.now()/200 + this.x*0.01);
        ctx.fillStyle = "#333";
        const wheelRadius = 15;
        // back wheel
        ctx.beginPath();
        ctx.arc(-this.width/2 + 20, this.height/2 + wheelOffsetY, wheelRadius, 0, Math.PI*2);
        ctx.fill();
        // front wheel
        ctx.beginPath();
        ctx.arc(this.width/2 - 20, this.height/2 + wheelOffsetY, wheelRadius, 0, Math.PI*2);
        ctx.fill();

        // Wheel spokes for effect
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 2;
        const spokes = 6;
        for (let i=0;i<spokes;i++){
            const angle = (i/spokes)*Math.PI*2 + Date.now()/200;
            ctx.beginPath();
            ctx.moveTo(-this.width/2 + 20, this.height/2 + wheelOffsetY);
            ctx.lineTo(-this.width/2 + 20 + wheelRadius*Math.cos(angle),
                       this.height/2 + wheelOffsetY + wheelRadius*Math.sin(angle));
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(this.width/2 - 20, this.height/2 + wheelOffsetY);
            ctx.lineTo(this.width/2 - 20 + wheelRadius*Math.cos(angle),
                       this.height/2 + wheelOffsetY + wheelRadius*Math.sin(angle));
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ----- Input -----
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// ----- Game setup -----
const terrain = new Terrain();
const bike = new Bike(200, canvas.height-200);

// ----- Background -----
function drawBackground(offsetX) {
    // simple mountains
    ctx.fillStyle = "#6B8E23";
    for (let i=0;i<5;i++){
        const mx = (i*400 - offsetX*0.5);
        ctx.beginPath();
        ctx.moveTo(mx-100, canvas.height-100);
        ctx.lineTo(mx, canvas.height-300 - i*20);
        ctx.lineTo(mx+100, canvas.height-100);
        ctx.fill();
    }
}

// ----- Main Loop -----
function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const offsetX = bike.x - 200;

    drawBackground(offsetX);
    terrain.draw(offsetX);
    bike.update(keys, terrain);
    bike.draw(offsetX);

    for (let i=particles.length-1; i>=0; i--){
        const p = particles[i];
        p.update();
        p.draw(offsetX);
        if (p.alpha <= 0) particles.splice(i,1);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
