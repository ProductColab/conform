import C2S from "canvas2svg";

/**
 * Converts a canvas element's content to SVG format
 * @param canvas - The HTML canvas element to convert
 * @returns SVG string representation of the canvas content
 */
export function convertCanvasToSVG(canvas: HTMLCanvasElement): string {
  // Create a new canvas2svg context with the same dimensions
  const ctx = new C2S(canvas.width, canvas.height);

  // Draw the canvas content onto the SVG context
  ctx.drawImage(canvas, 0, 0);

  // Return the serialized SVG with named entities converted to numbered ones
  return ctx.getSerializedSvg(true);
}

/**
 * Converts signature data points to SVG path
 * @param data - Array of point arrays representing signature strokes
 * @param width - Canvas width
 * @param height - Canvas height
 * @param penColor - Pen color for the signature
 * @param backgroundColor - Background color (optional)
 * @returns SVG string representation of the signature
 */
export function convertSignatureDataToSVG(
  data: any[][],
  width: number,
  height: number,
  penColor: string = "#000000",
  backgroundColor?: string
): string {
  // Create a new canvas2svg context
  const ctx = new C2S(width, height);

  // Set background if provided
  if (backgroundColor && backgroundColor !== "rgba(255,255,255,0)") {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Set pen properties
  ctx.strokeStyle = penColor;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Draw each stroke
  data.forEach((stroke) => {
    if (stroke.length === 0) return;

    ctx.beginPath();

    stroke.forEach((point: any, index: number) => {
      const x = point.x || point[0];
      const y = point.y || point[1];

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  });

  return ctx.getSerializedSvg(true);
}
