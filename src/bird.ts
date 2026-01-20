import { GRAVITY, JUMP_STRENGTH } from "./constants";

export class Bird {
  // We'll calculate position and size based on screen dimensions
  x = window.innerWidth / 4;
  y = window.innerHeight / 2;

  // Base size that scales with screen width
  width = Math.min(window.innerWidth * 0.15, 70); 
  height = this.width * 0.85;

  velocity = 0;
  rotation = 0;

  image: HTMLImageElement;

  constructor() {
    this.image = new Image();
    this.image.src = "/bird.png";
    
    // Auto-update size if screen changes
    window.addEventListener("resize", () => {
        this.width = Math.min(window.innerWidth * 0.15, 70);
        this.height = this.width * 0.85;
    });
  }

  jump() {
    // Snappy jump for touch inputs
    this.velocity = JUMP_STRENGTH;
  }

  update() {
    this.velocity += GRAVITY;
    this.y += this.velocity;

    // Mobile-smooth rotation: Tilts up when jumping, dives when falling
    // Range is approximately -25 degrees to 70 degrees
    let targetRotation = this.velocity * 0.05;
    this.rotation = Math.max(-0.4, Math.min(1.2, targetRotation));
  }

  // ✅ MOBILE-OPTIMIZED HITBOX
  // We make the hitbox slightly "forgiving" (smaller than the bird) 
  // so the player doesn't feel cheated by clipping a pipe edge.
  get hitbox() {
    const paddingX = this.width * 0.3; 
    const paddingY = this.height * 0.3;

    return {
      x: this.x + paddingX / 2,
      y: this.y + paddingY / 2,
      width: this.width - paddingX,
      height: this.height - paddingY,
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    // Move to bird center for rotation
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate(this.rotation);

    // Nice soft shadow for depth against background
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Draw the bird image
    ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );

    ctx.restore();
  }
}