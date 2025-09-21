document.addEventListener('DOMContentLoaded', () => {
    // --- Cellular Automaton & Sparks Logic ---
    const canvas = document.getElementById('automaton-canvas');
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('heroSection');
    
    let resolution = 25;
    let grid, cols, rows, cellAge;
    let userSparks = [];

    function setupGrid() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        cols = Math.floor(canvas.width / resolution);
        rows = Math.floor(canvas.height / resolution);
        grid = create2DArray(cols, rows);
        cellAge = create2DArray(cols, rows);
    }

    function create2DArray(cols, rows) {
        let arr = new Array(cols);
        for (let i = 0; i < arr.length; i++) { arr[i] = new Array(rows).fill(0); }
        return arr;
    }
    
    function randomizeGrid() {
         for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = Math.random() > 0.8 ? 1 : 0;
                cellAge[i][j] = grid[i][j];
            }
        }
    }

    function computeNextGeneration() {
        let nextGrid = create2DArray(cols, rows);
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let state = grid[i][j];
                let neighbors = countNeighbors(grid, i, j);
                if (state === 0 && neighbors === 3) {
                    nextGrid[i][j] = 1;
                    cellAge[i][j] = 1;
                } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                    nextGrid[i][j] = 0;
                    cellAge[i][j] = 0;
                } else {
                    nextGrid[i][j] = state;
                    if (state === 1) cellAge[i][j]++;
                }
            }
        }
        return nextGrid;
    }

    function countNeighbors(grid, x, y) {
        let sum = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                let col = (x + i + cols) % cols;
                let row = (y + j + rows) % rows;
                sum += grid[col][row];
            }
        }
        return sum;
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the main automaton grid
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] === 1) {
                    const hue = 260 + (cellAge[i][j] * 2);
                    const saturation = 90;
                    const lightness = 50 + Math.min(cellAge[i][j] * 2, 30);
                    ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
                    ctx.fillRect(i * resolution, j * resolution, resolution, resolution);
                }
            }
        }

        // Draw and update user-created sparks
        for (let i = userSparks.length - 1; i >= 0; i--) {
            const spark = userSparks[i];
            spark.life--;

            if (spark.life <= 0) {
                userSparks.splice(i, 1);
            } else {
                const opacity = spark.life / spark.maxLife;
                ctx.fillStyle = `hsla(320, 100%, 80%, ${opacity})`;
                ctx.fillRect(spark.x * resolution, spark.y * resolution, resolution, resolution);
            }
        }
    }

    function gameLoop() {
        grid = computeNextGeneration();
        drawGrid();
        setTimeout(() => requestAnimationFrame(gameLoop), 250);
    }

    setupGrid();
    randomizeGrid();
    gameLoop();
    
    window.addEventListener('resize', () => {
        setupGrid();
        randomizeGrid();
    });

    heroSection.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / resolution);
        const row = Math.floor(y / resolution);
        userSparks.push({ x: col, y: row, life: 50, maxLife: 50 });
    });

    // --- GSAP Intro & Parallax Animations ---
    const heroContent = document.getElementById('hero-content');
    gsap.from(heroContent, { duration: 1.5, autoAlpha: 0, y: 50, ease: "power3.out", delay: 0.5 });
    window.addEventListener('mousemove', e => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 40;
        const y = (clientY / window.innerHeight - 0.5) * 40;
        gsap.to(heroContent, { duration: 1, x: -x, y: -y, ease: "power3.out" });
    });
});


