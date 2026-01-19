import { GRAVITY, JUMP_STRENGTH } from "./constants";

export class Bird {
  x = 100;
  y = 300;


  width = 80;
  height = 70;

  // 🎯 Smaller collision box (VERY IMPORTANT)
  hitboxPadding = 18;

  velocity = 0;
  rotation = 0;

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

    // Smooth tilt
    this.rotation = Math.max(-0.5, Math.min(0.8, this.velocity / 12));
  }

  // ✅ REAL collision box used in main.ts
  get hitbox() {
    return {
      x: this.x + this.hitboxPadding,
      y: this.y + this.hitboxPadding,
      width: this.width - this.hitboxPadding * 2,
      height: this.height - this.hitboxPadding * 2,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);

    // 🌟 Soft shadow
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // 🎭 Mask image to oval
    ctx.beginPath();
    ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
    ctx.clip();

    if (this.image.complete && this.image.naturalWidth !== 0) {
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = "#FFD93D";
      ctx.fill();
    }

    ctx.restore();
  }
}
