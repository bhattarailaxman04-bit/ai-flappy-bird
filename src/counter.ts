export class Counter {
  score: number = 0;

  increase() {
    this.score++;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.font = "32px Arial";
    ctx.fillText(`Score: ${this.score}`, 20, 40);
  }
}
