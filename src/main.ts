import { Bird } from "./bird";
import { Pipe } from "./pipe";
import { Counter } from "./counter";
import { PIPE_WIDTH, PIPE_SPAWN_RATE, PIPE_GAP } from "./constants";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// ================== GAME OBJECTS ==================
let bird = new Bird();
let pipes: Pipe[] = [];
let counter = new Counter();
let frameCount = 0;
let gameState: "start" | "playing" | "paused" | "gameover" = "start";
let isMuted = false; // Audio state

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
  bird.y = canvas.height / 2;
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
  gameState = "playing";
}

// ================== TOGGLE FUNCTIONS ==================
function togglePause() {
  if (gameState === "playing") gameState = "paused";
  else if (gameState === "paused") gameState = "playing";
}

function toggleMute() {
  isMuted = !isMuted;
  // If you add an Audio object later, you would set: myAudio.muted = isMuted;
}

// ================== INPUT HANDLER ==================
const handleInput = () => {
  if (gameState === "start" || gameState === "gameover") {
    resetGame();
  } else if (gameState === "playing") {
    bird.jump();
  }
};

// Keyboard
window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.code === "Space") handleInput();
  if (e.code === "KeyP" || e.code === "Escape") togglePause();
  if (e.code === "KeyM") toggleMute();
});

// Touch (Mobile) - Fixes the 'e' error by using it for preventDefault
canvas.addEventListener("touchstart", (e: TouchEvent) => {
  if (e.cancelable) e.preventDefault();
  
  // Check if user tapped the top right corner for Mute
  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;
  if (touchX > canvas.width - 60 && touchY < 60) {
    toggleMute();
  } else {
    handleInput();
  }
}, { passive: false });

// Click (Desktop)
canvas.addEventListener("mousedown", (e: MouseEvent) => {
  // Check if click is in the Mute button area (top right)
  if (e.clientX > canvas.width - 60 && e.clientY < 60) {
    toggleMute();
  } else if (!('ontouchstart' in window)) {
    handleInput();
  }
});

// ================== DRAW HELPERS ==================
function drawCenterText(text: string, y: number, size = 48, color = "white") {
  const responsiveSize = Math.min(size, canvas.width / 10); 
  ctx.fillStyle = color;
  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.font = `bold ${responsiveSize}px Arial`;
  ctx.textAlign = "center";
  ctx.strokeText(text, canvas.width / 2, y);
  ctx.fillText(text, canvas.width / 2, y);
}

function drawMuteButton() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillRect(canvas.width - 50, 10, 40, 40);
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  // Simple Icon Representation
  ctx.fillText(isMuted ? "🔇" : "🔊", canvas.width - 30, 38);
}

// ================== GAME LOOP ==================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (background.complete) {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  }

  if (gameState === "start") {
    bird.draw(ctx);
    drawCenterText("FLAPPY BIRD", canvas.height / 2 - 50, 60);
    drawCenterText("TAP TO START", canvas.height / 2 + 20, 25);
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
        if (
          b.x < pipe.x + PIPE_WIDTH &&
          b.x + b.width > pipe.x &&
          (b.y < pipe.topHeight ||
            b.y + b.height > pipe.topHeight + PIPE_GAP)
        ) {
          gameState = "gameover";
        }

        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
          pipe.passed = true;
          counter.increase();
          if (counter.score > highScore) {
            highScore = counter.score;
            localStorage.setItem("highScore", highScore.toString());
          }
        }
      });

      pipes = pipes.filter((p) => p.x + PIPE_WIDTH > -50);

      if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameState = "gameover";
      }
    }

    pipes.forEach((p) => p.draw(ctx, canvas.height));
    bird.draw(ctx);

    // Score
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.font = `bold ${Math.max(20, canvas.width / 20)}px Arial`;
    ctx.textAlign = "left";
    ctx.strokeText(`Score: ${counter.score}`, 10, 70);
    ctx.fillText(`Score: ${counter.score}`, 10, 70);

    if (gameState === "paused") {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCenterText("PAUSED", canvas.height / 2, 60);
    }
  }

  if (gameState === "gameover") {
    pipes.forEach((p) => p.draw(ctx, canvas.height));
    bird.draw(ctx);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCenterText("GAME OVER", canvas.height / 2 - 80, 50);
    drawCenterText(`SCORE: ${counter.score}`, canvas.height / 2 - 20, 30);
    drawCenterText(`BEST: ${highScore}`, canvas.height / 2 + 20, 28);
    drawCenterText("TAP TO RESTART", canvas.height / 2 + 90, 22, "#FFD700");
  }

  drawMuteButton(); // Always draw mute button on top
  requestAnimationFrame(gameLoop);
}

gameLoop();