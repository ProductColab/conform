import { describe, it, expect, vi } from "vitest";
import { convertSignatureDataToSVG } from "../utils/signature-svg";

// Mock canvas2svg
vi.mock("canvas2svg", () => {
  const mockSvgCtx = {
    fillStyle: "",
    strokeStyle: "",
    lineJoin: "",
    lineCap: "",
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    getSerializedSvg: vi.fn(() => "<svg>mock svg content</svg>"),
  };

  return {
    default: vi.fn(() => mockSvgCtx),
  };
});

describe("Signature SVG Utils", () => {
  describe("convertSignatureDataToSVG", () => {
    it("should convert signature data to SVG string", () => {
      const mockData = [
        [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
        [
          { x: 50, y: 60 },
          { x: 70, y: 80 },
        ],
      ];

      const result = convertSignatureDataToSVG(
        mockData,
        400,
        200,
        "#000000",
        "#ffffff"
      );

      expect(result).toBe("<svg>mock svg content</svg>");
    });

    it("should handle empty signature data", () => {
      const result = convertSignatureDataToSVG([], 400, 200, "#000000");

      expect(result).toBe("<svg>mock svg content</svg>");
    });

    it("should handle signature data without background color", () => {
      const mockData = [
        [
          { x: 10, y: 20 },
          { x: 30, y: 40 },
        ],
      ];

      const result = convertSignatureDataToSVG(mockData, 400, 200, "#ff0000");

      expect(result).toBe("<svg>mock svg content</svg>");
    });

    it("should handle point data in array format", () => {
      const mockData = [
        [
          [10, 20],
          [30, 40],
        ],
        [
          [50, 60],
          [70, 80],
        ],
      ];

      const result = convertSignatureDataToSVG(mockData, 400, 200, "#0000ff");

      expect(result).toBe("<svg>mock svg content</svg>");
    });
  });
});
