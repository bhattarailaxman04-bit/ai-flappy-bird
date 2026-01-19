export class Counter {
  score: number = 0;
  highScore: number;

  constructor() {
    this.highScore = Number(localStorage.getItem("highScore")) || 0;
  }

  increase() {
    this.score++;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.highScore.toString());
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "left";

    ctx.strokeText(`Score: ${this.score}`, 20, 50);
    ctx.fillText(`Score: ${this.score}`, 20, 50);

    ctx.strokeText(`High: ${this.highScore}`, 20, 90);
    ctx.fillText(`High: ${this.highScore}`, 20, 90);
  }
}
