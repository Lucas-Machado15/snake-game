const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startScreenElement = document.getElementById('startScreen');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameRunning = false;
let gameStarted = false;
let gameSpeed = 200;
let gameInterval;

function randomFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function drawApple(x, y) {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;
    
    // Corpo da maçã (formato mais realista)
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 1, 7, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Brilho na maçã
    ctx.fillStyle = '#ff9999';
    ctx.beginPath();
    ctx.ellipse(centerX - 2, centerY - 2, 2, 3, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Folha
    ctx.fillStyle = '#22aa22';
    ctx.beginPath();
    ctx.ellipse(centerX + 2, centerY - 6, 2, 4, Math.PI / 6, 0, 2 * Math.PI);
    ctx.fill();
    
    // Cabo
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 0.5, centerY - 8, 1, 3);
}

function drawGame() {
    // Limpar canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar cobra minimalista
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize + 2;
        const y = segment.y * gridSize + 2;
        const size = gridSize - 4;
        
        if (index === 0) {
            // Cabeça - círculo verde claro
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(x + size/2, y + size/2, size/2, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Corpo - retângulos arredondados
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.roundRect(x, y, size, size, 4);
            ctx.fill();
        }
    });

    // Desenhar maçã
    drawApple(food.x, food.y);
}

function moveSnake() {
    if (!gameRunning) return;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // Verificar colisão com paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Verificar colisão com próprio corpo
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Verificar se comeu a comida
    if (head.x === food.x && head.y === food.y) {
        score += 20;
        scoreElement.textContent = score;
        
        // Confetti a cada 100 pontos
        if (score % 100 === 0) {
            createConfetti();
        }
        
        // Aumentar velocidade a cada maçã
        gameSpeed = Math.max(80, 200 - Math.floor(score / 20) * 8);
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
        
        // Vitória aos 500 pontos
        if (score >= 500) {
            victory();
            return;
        }
        
        randomFood();
    } else {
        snake.pop();
    }
}

function createConfetti() {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
                animation: confetti-fall 3s linear forwards;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 20);
    }
}

function victory() {
    gameRunning = false;
    gameStarted = false;
    createConfetti();
    
    // Mostrar tela de vitória
    const victoryScreen = document.createElement('div');
    victoryScreen.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid #e2e8f0;
        z-index: 100;
    `;
    victoryScreen.innerHTML = `
        <h2 style="color: #0f172a; margin-bottom: 16px;">🎉 Parabéns!</h2>
        <p style="color: #64748b; margin-bottom: 24px;">Você venceu com 500 pontos!</p>
        <button onclick="this.parentElement.remove(); resetGame();" style="
            background: #22c55e;
            color: white;
            border: none;
            padding: 12px 32px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
        ">Jogar Novamente</button>
    `;
    document.body.appendChild(victoryScreen);
}

function gameOver() {
    gameRunning = false;
    gameStarted = false;
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

function startGame() {
    startScreenElement.style.display = 'none';
    gameStarted = true;
    gameRunning = false;
    randomFood();
    drawGame();
}

function resetGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 200;
    scoreElement.textContent = score;
    gameRunning = false;
    gameStarted = true;
    gameOverElement.style.display = 'none';
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
    randomFood();
    drawGame();
}

function gameLoop() {
    moveSnake();
    drawGame();
}

// Controles do teclado
document.addEventListener('keydown', (e) => {
    if (!gameStarted) return;
    
    switch(e.code) {
        case 'ArrowUp':
            if (dy !== 1) { 
                dx = 0; 
                dy = -1; 
                gameRunning = true;
            }
            break;
        case 'ArrowDown':
            if (dy !== -1) { 
                dx = 0; 
                dy = 1; 
                gameRunning = true;
            }
            break;
        case 'ArrowLeft':
            if (dx !== 1) { 
                dx = -1; 
                dy = 0; 
                gameRunning = true;
            }
            break;
        case 'ArrowRight':
            if (dx !== -1) { 
                dx = 1; 
                dy = 0; 
                gameRunning = true;
            }
            break;
        case 'Space':
            e.preventDefault();
            gameRunning = !gameRunning;
            break;
    }
});

// Controles touch para mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameStarted) return;
    
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameStarted) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    // Mínimo de movimento para registrar swipe
    if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) return;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Movimento horizontal
        if (deltaX > 0 && dx !== -1) {
            dx = 1; dy = 0; gameRunning = true; // Direita
        } else if (deltaX < 0 && dx !== 1) {
            dx = -1; dy = 0; gameRunning = true; // Esquerda
        }
    } else {
        // Movimento vertical
        if (deltaY > 0 && dy !== -1) {
            dx = 0; dy = 1; gameRunning = true; // Baixo
        } else if (deltaY < 0 && dy !== 1) {
            dx = 0; dy = -1; gameRunning = true; // Cima
        }
    }
});

// CSS para animação do confetti
const style = document.createElement('style');
style.textContent = `
    @keyframes confetti-fall {
        to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar jogo
startScreenElement.style.display = 'block';
gameInterval = setInterval(gameLoop, gameSpeed);