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
    this.topHeight = Math.random() * (canvasHeight - PIPE_GAP - 150) + 50;
  }

  update() {
    this.x -= PIPE_SPEED;
  }

  draw(ctx: CanvasRenderingContext2D, canvasHeight: number) {
    if (this.image.complete && this.image.naturalWidth !== 0) {
        // Top Pipe
        ctx.save();
        ctx.translate(this.x + PIPE_WIDTH / 2, this.topHeight / 2);
        ctx.scale(1, -1);
        ctx.drawImage(this.image, -PIPE_WIDTH / 2, -this.topHeight / 2, PIPE_WIDTH, this.topHeight);
        ctx.restore();

        // Bottom Pipe
        ctx.drawImage(this.image, this.x, this.topHeight + PIPE_GAP, PIPE_WIDTH, canvasHeight - this.topHeight - PIPE_GAP);
    } else {
        // Fallback: Green boxes
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, 0, PIPE_WIDTH, this.topHeight);
        ctx.fillRect(this.x, this.topHeight + PIPE_GAP, PIPE_WIDTH, canvasHeight);
    }
  }
}