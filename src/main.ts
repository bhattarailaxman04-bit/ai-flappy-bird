import { Bird } from "./bird";
import { Pipe } from "./pipe";
import { Counter } from "./counter";
import { PIPE_WIDTH, PIPE_SPAWN_RATE, PIPE_GAP } from "./constants";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// ================== UI HELPERS (MOBILE OPTIMIZED) ==================
const isMobile = window.innerWidth < 768;
const UI_SCALE = isMobile ? 1.2 : 1;
const SAFE_TOP = isMobile ? 50 : 20; 

// ================== GAME OBJECTS ==================
let bird = new Bird();
let pipes: Pipe[] = [];
let counter = new Counter();
let frameCount = 0;
let gameState: "start" | "playing" | "paused" | "gameover" = "start";
let isMuted = false;

// NEW: Timer for the flash message (60 frames = ~1 second)
let highScoreFlash = 0; 

// ================== HIGH SCORE ==================
let highScore = Number(localStorage.getItem("highScore")) || 0;

// ================== BACKGROUND ==================
const background = new Image();
background.src = "/background.jpg";

// ================== CANVAS RESIZE ==================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  bird.x = canvas.width / 4;
  if (gameState === "start") bird.y = canvas.height / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ================== RESET GAME ==================
function resetGame() {
  bird = new Bird();
  bird.x = canvas.width / 4;
  pipes = [new Pipe(canvas.width, canvas.height)];
  counter = new Counter();
  frameCount = 0;
  highScoreFlash = 0; // Reset flash on new game
  gameState = "playing";
}

// ================== TOGGLES ==================
function togglePause() {
  if (gameState === "playing") gameState = "paused";
  else if (gameState === "paused") gameState = "playing";
}

function toggleMute() {
  isMuted = !isMuted;
}

// ================== INPUT ==================
const handleInput = () => {
  if (gameState === "start" || gameState === "gameover") resetGame();
  else if (gameState === "playing") bird.jump();
};

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") handleInput();
  if (e.code === "KeyP" || e.code === "Escape") togglePause();
  if (e.code === "KeyM") toggleMute();
});

canvas.addEventListener("touchstart", (e) => {
  if (e.cancelable) e.preventDefault();
  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;

  if (x > canvas.width - 80 && y < SAFE_TOP + 60) toggleMute();
  else handleInput();
}, { passive: false });

canvas.addEventListener("mousedown", (e) => {
  if (e.clientX > canvas.width - 80 && e.clientY < SAFE_TOP + 60) toggleMute();
  else handleInput();
});

// ================== DRAW HELPERS ==================
function drawCenterText(text: string, y: number, size = 48, color = "white") {
  const responsiveSize = Math.min(size * UI_SCALE, canvas.width / 8);
  ctx.fillStyle = color;
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.max(4, responsiveSize / 10);
  ctx.font = `bold ${responsiveSize}px Arial`;
  ctx.textAlign = "center";
  ctx.strokeText(text, canvas.width / 2, y);
  ctx.fillText(text, canvas.width / 2, y);
}

function drawMuteButton() {
  const size = isMobile ? 50 : 40;
  const padding = 15;

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.roundRect(canvas.width - size - padding, SAFE_TOP, size, size, 10);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.font = `${isMobile ? 26 : 20}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(isMuted ? "🔇" : "🔊", canvas.width - size / 2 - padding, SAFE_TOP + size * 0.7);
}

// ================== GAME LOOP ==================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (background.complete) {
    const scale = Math.max(canvas.width / background.width, canvas.height / background.height);
    ctx.drawImage(background, 0, 0, background.width * scale, background.height * scale);
  }

  if (gameState === "start") {
    bird.draw(ctx);
    drawCenterText("FLAPPY BIRD", canvas.height / 2 - 60, 60);
    drawCenterText("TAP TO START", canvas.height / 2 + 40, 26, "#FFD700");
  }

  if (gameState === "playing" || gameState === "paused") {
    if (gameState === "playing") {
      bird.update();
      frameCount++;

      if (frameCount % PIPE_SPAWN_RATE === 0) {
        pipes.push(new Pipe(canvas.width, canvas.height));
      }

      pipes.forEach((pipe) => {
        pipe.update();
        const b = bird.hitbox;
        if (b.x < pipe.x + PIPE_WIDTH && b.x + b.width > pipe.x &&
           (b.y < pipe.topHeight || b.y + b.height > pipe.topHeight + PIPE_GAP)) {
          gameState = "gameover";
        }

        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
          pipe.passed = true;
          counter.increase();
          
          // --- HIGH SCORE FLASH LOGIC ---
          // If current score just beat the high score, trigger the flash
          if (counter.score > highScore) {
            // Only trigger flash if it's not already flashing and there was a previous record
            if (highScoreFlash === 0 && highScore > 0) {
                highScoreFlash = 90; // Show for 1.5 seconds
            }
            highScore = counter.score;
            localStorage.setItem("highScore", highScore.toString());
          }
        }
      });

      pipes = pipes.filter((p) => p.x + PIPE_WIDTH > -50);
      if (bird.y + bird.height > canvas.height || bird.y < 0) gameState = "gameover";
      
      // Countdown the flash timer
      if (highScoreFlash > 0) highScoreFlash--;
    }

    pipes.forEach((p) => p.draw(ctx, canvas.height));
    bird.draw(ctx);

    // SCORE
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;
    ctx.font = `bold ${Math.max(40, canvas.width / 10)}px Arial`;
    ctx.textAlign = "center";
    ctx.strokeText(`${counter.score}`, canvas.width / 2, SAFE_TOP + 80);
    ctx.fillText(`${counter.score}`, canvas.width / 2, SAFE_TOP + 80);

    // --- DRAW THE FLASH MESSAGE ---
    if (highScoreFlash > 0) {
        drawCenterText("NEW RECORD!", SAFE_TOP + 140, 28, "#FFD700");
    }

    if (gameState === "paused") {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCenterText("PAUSED", canvas.height / 2, 60);
    }
  }

  if (gameState === "gameover") {
    pipes.forEach((p) => p.draw(ctx, canvas.height));
    bird.draw(ctx);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (counter.score >= highScore && counter.score > 0) {
        drawCenterText("NEW HIGH SCORE!", canvas.height / 2 - 140, 30, "#FFD700");
    }

    drawCenterText("GAME OVER", canvas.height / 2 - 60, 50);
    drawCenterText(`SCORE: ${counter.score}`, canvas.height / 2 + 10, 32);
    drawCenterText(`BEST: ${highScore}`, canvas.height / 2 + 60, 24, "#BBB");
    drawCenterText("TAP TO RESTART", canvas.height / 2 + 140, 22, "#FFD700");
  }

  drawMuteButton();
  requestAnimationFrame(gameLoop);
}

gameLoop();