import { Bird } from "./bird";
import { Pipe } from "./pipe";
import { Counter } from "./counter";
import { PIPE_WIDTH, PIPE_SPAWN_RATE, PIPE_GAP } from "./constants";

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Initialize objects immediately
let bird = new Bird();
let pipes: Pipe[] = [];
let counter = new Counter();
let frameCount = 0;
let gameState: "start" | "playing" | "paused" | "gameover" = "start";

const background = new Image();
background.src = "/background.jpg";

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Position bird in center vertically on start
  bird.y = canvas.height / 2;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function resetGame() {
  bird = new Bird();
  pipes = [new Pipe(canvas.width, canvas.height)];
  counter = new Counter();
  gameState = "playing";
  frameCount = 0;
}

function togglePause() {
  if (gameState === "playing") gameState = "paused";
  else if (gameState === "paused") gameState = "playing";
}

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

function drawCenterText(text: string, y: number, size = 48) {
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 6;
  ctx.font = `bold ${size}px Arial`;
  ctx.textAlign = "center";
  ctx.strokeText(text, canvas.width / 2, y);
  ctx.fillText(text, canvas.width / 2, y);
}

function gameLoop() {
  // Clear and Draw Background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (background.complete) {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  }

  if (gameState === "start") {
    bird.draw(ctx); // Show bird on start screen
    drawCenterText("FLAPPY BIRD", canvas.height / 2 - 50, 70);
    drawCenterText("CLICK or SPACE to Start", canvas.height / 2 + 20, 25);
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
        if (
          bird.x < pipe.x + PIPE_WIDTH &&
          bird.x + bird.width > pipe.x &&
          (bird.y < pipe.topHeight || bird.y + bird.height > pipe.topHeight + PIPE_GAP)
        ) {
          gameState = "gameover";
        }
        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
          pipe.passed = true;
          counter.score++;
        }
      });
      pipes = pipes.filter(p => p.x + PIPE_WIDTH > -50);

      if (bird.y + bird.height > canvas.height || bird.y < 0) gameState = "gameover";
    }

    // Always draw during playing/paused
    pipes.forEach(p => p.draw(ctx, canvas.height));
    bird.draw(ctx);
    counter.draw(ctx);

    if (gameState === "paused") {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawCenterText("PAUSED", canvas.height / 2, 60);
    }
  }

  if (gameState === "gameover") {
    pipes.forEach(p => p.draw(ctx, canvas.height));
    bird.draw(ctx);
    drawCenterText("GAME OVER", canvas.height / 2 - 20, 60);
    drawCenterText(`SCORE: ${counter.score}`, canvas.height / 2 + 40, 30);
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();