import { PIPE_SPEED, PIPE_WIDTH, PIPE_GAP } from "./constants";

export class Pipe {
  x: number;
  topHeight: number;
  image: HTMLImageElement;
  passed: boolean = false;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth;
    this.image = new Image();
    this.image.src = "/pipe1.png";

    // MOBILE OPTIMIZATION: Ensure pipes are never too short or too long
    // This keeps the "gap" in a playable area for thumb controls
    const minPipeHeight = 80;
    const maxPipeHeight = canvasHeight - PIPE_GAP - minPipeHeight;
    this.topHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
  }

  update() {
    this.x -= PIPE_SPEED;
  }

  draw(ctx: CanvasRenderingContext2D, canvasHeight: number) {
    if (this.image.complete && this.image.naturalWidth !== 0) {
      // --- Top Pipe (Flipped) ---
      ctx.save();
      // Move to center of top pipe area
      ctx.translate(this.x + PIPE_WIDTH / 2, this.topHeight / 2);
      ctx.scale(1, -1); // Flip vertically
      ctx.drawImage(
        this.image,
        -PIPE_WIDTH / 2,
        -this.topHeight / 2,
        PIPE_WIDTH,
        this.topHeight
      );
      ctx.restore();

      // --- Bottom Pipe ---
      ctx.drawImage(
        this.image,
        this.x,
        this.topHeight + PIPE_GAP,
        PIPE_WIDTH,
        canvasHeight - this.topHeight - PIPE_GAP
      );
    } else {
      // --- Mobile Friendly Fallback (Green Pipes) ---
      // Adding a stroke/border makes it look like a design choice rather than a bug
      ctx.fillStyle = "#2ecc71";
      ctx.strokeStyle = "#27ae60";
      ctx.lineWidth = 4;

      // Top Rect
      ctx.fillRect(this.x, 0, PIPE_WIDTH, this.topHeight);
      ctx.strokeRect(this.x, 0, PIPE_WIDTH, this.topHeight);

      // Bottom Rect
      ctx.fillRect(this.x, this.topHeight + PIPE_GAP, PIPE_WIDTH, canvasHeight - this.topHeight - PIPE_GAP);
      ctx.strokeRect(this.x, this.topHeight + PIPE_GAP, PIPE_WIDTH, canvasHeight - this.topHeight - PIPE_GAP);
    }
  }
}