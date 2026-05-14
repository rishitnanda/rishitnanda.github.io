export class BackgroundEffect {
    constructor(canvasId) {
        this.canvasWindow = document.getElementById(canvasId);
        if (!this.canvasWindow) return;
        this.drawContext = this.canvasWindow.getContext('2d');
        
        this.screenWidth = 0;
        this.screenHeight = 0;
        this.activeParticles = [];
        
        this.PARTICLE_RENDER_LIMIT = 80;
        this.CONNECTION_LINK_THRESHOLD = 150;
        this.GRAVITY_WELL_RADIUS = 250;
        this.BASE_VELOCITY_SPEED = 0.5;
        
        this.pointerState = { x: -1000, y: -1000 };
        
        this.init();
    }

    init() {
        this.resizeCanvasDimensions();
        window.addEventListener('resize', () => this.resizeCanvasDimensions());
        
        window.addEventListener('mousemove', (mouseEvent) => {
            this.pointerState.x = mouseEvent.clientX;
            this.pointerState.y = mouseEvent.clientY;
        });

        window.addEventListener('touchmove', (touchEvent) => {
            this.pointerState.x = touchEvent.touches[0].clientX;
            this.pointerState.y = touchEvent.touches[0].clientY;
        });

        for (let iterator = 0; iterator < this.PARTICLE_RENDER_LIMIT; iterator++) {
            this.activeParticles.push(new FloatingTechParticle(this));
        }

        this.pushAnimationPipeline();
    }

    resizeCanvasDimensions() {
        this.screenWidth = this.canvasWindow.width = window.innerWidth;
        this.screenHeight = this.canvasWindow.height = window.innerHeight;
    }

    pushAnimationPipeline() {
        if (window.innerWidth <= 768) {
            this.drawContext.clearRect(0, 0, this.screenWidth, this.screenHeight);
            requestAnimationFrame(() => this.pushAnimationPipeline());
            return;
        }
        
        this.drawContext.clearRect(0, 0, this.screenWidth, this.screenHeight);

        this.activeParticles.forEach(particleEntity => particleEntity.updatePhysics());

        for (let indexA = 0; indexA < this.activeParticles.length; indexA++) {
            for (let indexB = indexA + 1; indexB < this.activeParticles.length; indexB++) {
                const nodeA = this.activeParticles[indexA];
                const nodeB = this.activeParticles[indexB];

                const lengthX = nodeA.x - nodeB.x;
                const lengthY = nodeA.y - nodeB.y;
                const spanDistance = Math.sqrt(lengthX * lengthX + lengthY * lengthY);

                if (spanDistance < this.CONNECTION_LINK_THRESHOLD) {
                    const intersectX = (nodeA.x + nodeB.x) / 2;
                    const intersectY = (nodeA.y + nodeB.y) / 2;
                    
                    const deltaMouseX = this.pointerState.x - intersectX;
                    const deltaMouseY = this.pointerState.y - intersectY;
                    const boundaryToMouse = Math.sqrt(deltaMouseX * deltaMouseX + deltaMouseY * deltaMouseY);

                    if (boundaryToMouse < this.GRAVITY_WELL_RADIUS) {
                        const linkBleed = 1 - (spanDistance / this.CONNECTION_LINK_THRESHOLD);
                        const coreBleed = 1 - (boundaryToMouse / this.GRAVITY_WELL_RADIUS);
                        const absoluteDecay = linkBleed * coreBleed * 0.5;

                        this.drawContext.beginPath();
                        this.drawContext.strokeStyle = `rgba(106, 27, 154, ${absoluteDecay})`;
                        this.drawContext.lineWidth = 0.5;
                        this.drawContext.moveTo(nodeA.x, nodeA.y);
                        this.drawContext.lineTo(nodeB.x, nodeB.y);
                        this.drawContext.stroke();
                    }
                }
            }
        }

        this.activeParticles.forEach(particleEntity => particleEntity.renderVisuals());
        requestAnimationFrame(() => this.pushAnimationPipeline());
    }
}

class FloatingTechParticle {
    constructor(effect) {
        this.effect = effect;
        this.x = Math.random() * effect.screenWidth;
        this.y = Math.random() * effect.screenHeight;
        this.vx = (Math.random() - 0.5) * effect.BASE_VELOCITY_SPEED;
        this.vy = (Math.random() - 0.5) * effect.BASE_VELOCITY_SPEED;
        this.size = Math.random() * 2 + 1;
    }

    updatePhysics() {
        this.x += this.vx;
        this.y += this.vy;

        const deltaX = this.effect.pointerState.x - this.x;
        const deltaY = this.effect.pointerState.y - this.y;
        const radialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (radialDistance < this.effect.GRAVITY_WELL_RADIUS) {
            if (radialDistance > 50) {
                const attractiveForce = (this.effect.GRAVITY_WELL_RADIUS - radialDistance) / 12000;
                this.vx += deltaX * attractiveForce;
                this.vy += deltaY * attractiveForce;
            } else {
                const repellingForce = (50 - radialDistance) / 1000;
                this.vx -= deltaX * repellingForce;
                this.vy -= deltaY * repellingForce;
            }
        }

        this.vx *= 0.98;
        this.vy *= 0.98;

        if (Math.abs(this.vx) < 0.1) this.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(this.vy) < 0.1) this.vy += (Math.random() - 0.5) * 0.05;

        if (this.x < 0) this.x = this.effect.screenWidth;
        if (this.x > this.effect.screenWidth) this.x = 0;
        if (this.y < 0) this.y = this.effect.screenHeight;
        if (this.y > this.effect.screenHeight) this.y = 0;
    }

    renderVisuals() {
        const deltaX = this.effect.pointerState.x - this.x;
        const deltaY = this.effect.pointerState.y - this.y;
        const radialDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (radialDistance < this.effect.GRAVITY_WELL_RADIUS) {
            const fadeMultiplier = 1 - (radialDistance / this.effect.GRAVITY_WELL_RADIUS);
            this.effect.drawContext.strokeStyle = `rgba(106, 27, 154, ${fadeMultiplier * 0.8})`;
            this.effect.drawContext.lineWidth = 1;
            
            this.effect.drawContext.beginPath();
            this.effect.drawContext.moveTo(this.x - this.size, this.y);
            this.effect.drawContext.lineTo(this.x + this.size, this.y);
            this.effect.drawContext.moveTo(this.x, this.y - this.size);
            this.effect.drawContext.lineTo(this.x, this.y + this.size);
            this.effect.drawContext.stroke();
        }
    }
}

