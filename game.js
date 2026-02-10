const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ----------------- Terrain -----------------
class Terrain {
    constructor() {
        this.points = [];
        this.generate();
    }

    generate() {
        let x = 0;
        while (x < canvas.width*5) {
            const y = canvas.height - 100 - Math.random()*150;
            this.points.push({x, y});
            x += 200 + Math.random()*100;
        }
        // Add a loop section
        this.points.push({x: x, y: canvas.height-250});
        this.points.push({x: x+150, y: canvas.height-250});
        this.points.push({x: x+300, y: canvas.height-100});
    }

    getGroundY(x) {
        for (let i = 0; i < this.points.length-1; i++) {
            const p1 = this.points[i], p2 = this.points[i+1];
            if (x >= p1.x && x <= p2.x) {
                const t = (x - p1.x)/(p2.x - p1.x);
                return p1.y*(1-t) + p2.y*t;
            }
        }
        return canvas.height-100;
    }

    getSlope(x) {
        for (let i = 0; i < this.points.length-1; i++) {
            const p1 = this.points[i], p2 = this.points[i+1];
            if (x >= p1.x && x <= p2.x) {
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }
        }
        return 0;
    }

    draw(offsetX) {
        const grad = ctx.createLinearGradient(0,0,0,canvas.height);
        grad.addColorStop(0,"#8B4513");
        grad.addColorStop(1,"#654321");
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0,canvas.height);
        for(let i=0;i<this.points.length;i++){
            ctx.lineTo(this.points[i].x - offsetX, this.points[i].y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Outline
        ctx.strokeStyle = "#4d2e1a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0;i<this.points.length;i++){
            if(i===0) ctx.moveTo(this.points[i].x - offsetX, this.points[i].y);
            else ctx.lineTo(this.points[i].x - offsetX, this.points[i].y);
        }
        ctx.stroke();
    }
}

// ----------------- Particles -----------------
class Particle {
    constructor(x,y,color,size=3){
        this.x=x; this.y=y;
        this.vx=(Math.random()-0.5)*3;
        this.vy=-Math.random()*2;
        this.alpha=
