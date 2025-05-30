declare module "canvas2svg" {
  class C2S {
    constructor(width: number, height: number);

    // Canvas drawing methods
    drawImage(
      image: HTMLCanvasElement | HTMLImageElement,
      dx: number,
      dy: number
    ): void;
    drawImage(
      image: HTMLCanvasElement | HTMLImageElement,
      dx: number,
      dy: number,
      dw: number,
      dh: number
    ): void;
    drawImage(
      image: HTMLCanvasElement | HTMLImageElement,
      sx: number,
      sy: number,
      sw: number,
      sh: number,
      dx: number,
      dy: number,
      dw: number,
      dh: number
    ): void;

    // Path methods
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    stroke(): void;

    // Fill methods
    fillRect(x: number, y: number, width: number, height: number): void;

    // SVG generation
    getSerializedSvg(fixNamedEntities?: boolean): string;

    // Style properties
    strokeStyle: string;
    fillStyle: string;
    lineJoin: string;
    lineCap: string;
  }

  export = C2S;
}
