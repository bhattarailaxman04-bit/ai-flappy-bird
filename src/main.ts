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

// ================== HIGH SCORE ==================
let highScore = Number(localStorage.getItem("highScore")) || 0;

// ================== BACKGROUND ==================
const background = new Image();
background.src = "/background.jpg";

// ================== CANVAS RESIZE ==================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  bird.y = canvas.height / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ================== RESET GAME ==================
function resetGame() {
  bird = new Bird();
  pipes = [new Pipe(canvas.width, canvas.height)];
  counter = new Counter();
  frameCount = 0;
  gameState = "playing";
}

// ================== PAUSE ==================
function togglePause() {
  if (gameState === "playing") gameState = "paused";
  else if (gameState === "paused") gameState = "playing";
}

// ================== INPUT ==================
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (gameState === "start" || gameState === "gameover") resetGame();
    else if (gameState === "playing") bird.jump();
  }

  if (e.code === "KeyP" || e.code === "Escape") togglePause();
});

canvas.addEventListener("mousedown", () => {
  if (gameState === "start" || gameState === "gameover") resetGame();
  else if (gameState === "playing") bird.jump();
});

// ================== TEXT HELPER ==================
function drawCenterText(text: string, y: number, size = 48) {
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.font = `bold ${size}px Arial`;
  ctx.textAlign = "center";
  ctx.strokeText(text, canvas.width / 2, y);
  ctx.fillText(text, canvas.width / 2, y);
}

// ================== GAME LOOP ==================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (background.complete) {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  }

  // ---------- START SCREEN ----------
  if (gameState === "start") {
    bird.draw(ctx);
    drawCenterText("FLAPPY BIRD", canvas.height / 2 - 50, 70);
    drawCenterText("CLICK or SPACE to Start", canvas.height / 2 + 20, 25);
  }

  // ---------- PLAYING / PAUSED ----------
  if (gameState === "playing" || gameState === "paused") {
    if (gameState === "playing") {
      bird.update();
      frameCount++;

      if (frameCount % PIPE_SPAWN_RATE === 0) {
        pipes.push(new Pipe(canvas.width, canvas.height));
      }

      pipes.forEach((pipe) => {
        pipe.update();

        // Collision
        if (
          bird.x < pipe.x + PIPE_WIDTH &&
          bird.x + bird.width > pipe.x &&
          (bird.y < pipe.topHeight ||
            bird.y + bird.height > pipe.topHeight + PIPE_GAP)
        ) {
          gameState = "gameover";
        }

        // Score
        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
          pipe.passed = true;
          counter.increase();

          // ⭐ HIGH SCORE UPDATE
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

    // ---------- SCORE DISPLAY ----------
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "left";

    ctx.strokeText(`Score: ${counter.score}`, 20, 50);
    ctx.fillText(`Score: ${counter.score}`, 20, 50);

    ctx.strokeText(`High: ${highScore}`, 20, 90);
    ctx.fillText(`High: ${highScore}`, 20, 90);

    if (gameState === "paused") {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCenterText("PAUSED", canvas.height / 2, 60);
    }
  }

  // ---------- GAME OVER ----------
  if (gameState === "gameover") {
    pipes.forEach((p) => p.draw(ctx, canvas.height));
    bird.draw(ctx);
    drawCenterText("GAME OVER", canvas.height / 2 - 20, 60);
    drawCenterText(`SCORE: ${counter.score}`, canvas.height / 2 + 40, 30);
    drawCenterText(`HIGH SCORE: ${highScore}`, canvas.height / 2 + 80, 28);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();
