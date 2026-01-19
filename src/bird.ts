import { GRAVITY, JUMP_STRENGTH } from "./constants";

export class Bird {
  x = 100;
  y = 300;
  width = 40;
  height = 30;
  velocity = 0;
  image: HTMLImageElement;

  constructor() {
    this.image = new Image();
    this.image.src = "/bird.png";
  }

  jump() {
    this.velocity = JUMP_STRENGTH;
  }

  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    let rotation = (this.velocity / 10);
    ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, rotation)));
    
    // Fallback: If image isn't loaded, draw a yellow box
    if (this.image.complete && this.image.naturalWidth !== 0) {
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
        ctx.fillStyle = "yellow";
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
    ctx.restore();
  }
}