class BuffonNeedleSimulation {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.needles = [];
        this.isAutoDropping = false;
        this.autoInterval = null;
        this.isFastMode = false;
        
        this.needleLength = 60;
        this.lineSpacing = 60;
        this.fastSimCount = 1000;
        
        this.setupEventListeners();
        this.drawLines();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('dropBtn').addEventListener('click', () => this.dropNeedle());
        document.getElementById('autoBtn').addEventListener('click', () => this.toggleAutoDrop());
        document.getElementById('fastBtn').addEventListener('click', () => this.fastSimulation());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        document.getElementById('lengthSlider').addEventListener('input', (e) => {
            this.needleLength = parseInt(e.target.value);
            document.getElementById('lengthValue').textContent = this.needleLength;
            this.updateStats();
            this.redraw();
        });
        
        document.getElementById('spacingSlider').addEventListener('input', (e) => {
            this.lineSpacing = parseInt(e.target.value);
            document.getElementById('spacingValue').textContent = this.lineSpacing;
            this.updateStats();
            this.redraw();
        });

        document.getElementById('fastCountSlider').addEventListener('input', (e) => {
            this.fastSimCount = parseInt(e.target.value);
            document.getElementById('fastCountValue').textContent = this.fastSimCount;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.dropNeedleAt(x, y);
        });
    }

    drawLines() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw parallel lines
        this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([]);
        
        for (let x = this.lineSpacing; x < this.canvas.width; x += this.lineSpacing) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
            
            // Add subtle glow effect
            this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.2)';
            this.ctx.lineWidth = 6;
            this.ctx.stroke();
            this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.6)';
            this.ctx.lineWidth = 2;
        }
    }

    dropNeedle() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.dropNeedleAt(x, y);
    }

    dropNeedleAt(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const needle = {
            x: x,
            y: y,
            angle: angle,
            length: this.needleLength,
            crosses: this.checkCrossing(x, y, angle)
        };
        
        this.needles.push(needle);
        this.drawNeedle(needle, true);
        this.updateStats();
    }

    checkCrossing(x, y, angle) {
        const halfLength = this.needleLength / 2;
        const x1 = x - halfLength * Math.cos(angle);
        const x2 = x + halfLength * Math.cos(angle);
        
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        
        // Find all line positions within the canvas
        const lines = [];
        for (let lineX = this.lineSpacing; lineX < this.canvas.width; lineX += this.lineSpacing) {
            lines.push(lineX);
        }
        
        // Check if the needle crosses any line
        for (let lineX of lines) {
            if (minX <= lineX && maxX >= lineX) {
                return true;
            }
        }
        
        return false;
    }

    drawNeedle(needle, animate = false) {
        const halfLength = needle.length / 2;
        const x1 = needle.x - halfLength * Math.cos(needle.angle);
        const y1 = needle.y - halfLength * Math.sin(needle.angle);
        const x2 = needle.x + halfLength * Math.cos(needle.angle);
        const y2 = needle.y + halfLength * Math.sin(needle.angle);
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        
        if (needle.crosses) {
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = '#ff6b6b';
            this.ctx.shadowBlur = 10;
        } else {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = 5;
        }
        
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // Draw endpoints
        this.ctx.fillStyle = needle.crosses ? '#ff6b6b' : '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x2, y2, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    redraw() {
        this.drawLines();
        this.needles.forEach(needle => {
            needle.crosses = this.checkCrossing(needle.x, needle.y, needle.angle);
            this.drawNeedle(needle);
        });
    }

    toggleAutoDrop() {
        const btn = document.getElementById('autoBtn');
        if (!this.isAutoDropping) {
            this.isAutoDropping = true;
            btn.textContent = 'Stop Auto Drop';
            btn.style.background = '#ff4757';
            this.autoInterval = setInterval(() => this.dropNeedle(), 500);
        } else {
            this.isAutoDropping = false;
            btn.textContent = 'Auto Drop (Slow)';
            btn.style.background = '';
            clearInterval(this.autoInterval);
        }
    }

    fastSimulation() {
        const btn = document.getElementById('fastBtn');
        btn.textContent = 'Simulating...';
        btn.disabled = true;
        
        const totalNeedles = this.fastSimCount;
        const batchSize = Math.min(100, Math.floor(totalNeedles / 20)); // Adaptive batch size
        const totalBatches = Math.ceil(totalNeedles / batchSize);
        let currentBatch = 0;
        let needlesAdded = 0;
        
        const addBatch = () => {
            const needlesInThisBatch = Math.min(batchSize, totalNeedles - needlesAdded);
            
            for (let i = 0; i < needlesInThisBatch; i++) {
                this.dropNeedle();
            }
            
            needlesAdded += needlesInThisBatch;
            currentBatch++;
            
            // Update button text with progress
            const progress = Math.round((needlesAdded / totalNeedles) * 100);
            btn.textContent = `Simulating... ${progress}%`;
            
            if (currentBatch < totalBatches) {
                setTimeout(addBatch, 50);
            } else {
                btn.textContent = `Fast Simulation (${this.fastSimCount})`;
                btn.disabled = false;
            }
        };
        
        addBatch();
    }

    clearAll() {
        this.needles = [];
        this.drawLines();
        this.updateStats();
        
        if (this.isAutoDropping) {
            this.toggleAutoDrop();
        }
    }

    updateStats() {
        const total = this.needles.length;
        const crossing = this.needles.filter(n => n.crosses).length;
        const ratio = total > 0 ? crossing / total : 0;
        const theoretical = (2 * this.needleLength) / (Math.PI * this.lineSpacing);
        const piEstimate = total > 0 && crossing > 0 ? (2 * this.needleLength) / (ratio * this.lineSpacing) : 0;
        
        document.getElementById('totalNeedles').textContent = total;
        document.getElementById('crossingNeedles').textContent = crossing;
        document.getElementById('ratio').textContent = ratio.toFixed(3);
        document.getElementById('theoretical').textContent = theoretical.toFixed(3);
        document.getElementById('piEstimate').textContent = piEstimate.toFixed(3);
        
        // Color code the π estimate based on accuracy
        const piDisplay = document.getElementById('piEstimate');
        const error = Math.abs(piEstimate - Math.PI);
        if (error < 0.1) {
            piDisplay.style.color = '#4ecdc4';
        } else if (error < 0.5) {
            piDisplay.style.color = '#feca57';
        } else {
            piDisplay.style.color = '#ff6b6b';
        }
    }
}

// Initialize the simulation when the page loads
window.addEventListener('load', () => {
    new BuffonNeedleSimulation();
}); 