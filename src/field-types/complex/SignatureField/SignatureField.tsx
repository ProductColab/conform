"use client";

import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";
import { useRef, useCallback, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Trash2, Undo2, Download } from "lucide-react";
import {
  convertCanvasToSVG,
  convertSignatureDataToSVG,
} from "@/utils/signature-svg";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SignatureFieldProps = {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
};

export function SignatureField({
  name,
  required,
  label,
  description,
  metadata,
}: SignatureFieldProps) {
  const formContext = useFormContext();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState<any[][]>([]);

  if (!formContext) {
    return null;
  }

  // Extract signature-specific metadata with defaults
  const {
    width = 400,
    height = 200,
    penColor = "#000000",
    penWidth = 2,
    backgroundColor = "rgba(255,255,255,0)",
    outputFormat = "png",
    showClearButton = true,
    showUndoButton = false,
    saveAsDataUrl = true,
    compressionLevel = 0.8,
  } = metadata;

  const clearSignature = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setSignatureData([]);
      formContext.setValue(name, undefined);
    }
  }, [name, formContext]);

  const undoLastStroke = useCallback(() => {
    if (signatureRef.current && signatureData.length > 0) {
      const newData = signatureData.slice(0, -1);
      signatureRef.current.fromData(newData);
      setSignatureData(newData);

      // Update form value
      if (newData.length === 0) {
        formContext.setValue(name, undefined);
      } else {
        const dataUrl = signatureRef.current.toDataURL(
          outputFormat === "jpeg" ? "image/jpeg" : "image/png",
          outputFormat === "jpeg" ? compressionLevel : undefined
        );
        formContext.setValue(
          name,
          saveAsDataUrl ? dataUrl : signatureRef.current.toData()
        );
      }
    }
  }, [
    signatureData,
    name,
    formContext,
    outputFormat,
    compressionLevel,
    saveAsDataUrl,
  ]);

  const downloadSignature = useCallback(() => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const link = document.createElement("a");
      link.download = `signature.${outputFormat}`;

      if (outputFormat === "svg") {
        // Convert canvas to SVG using our utility
        const canvas = signatureRef.current.getTrimmedCanvas();
        const svgString = convertCanvasToSVG(canvas);
        const blob = new Blob([svgString], { type: "image/svg+xml" });
        link.href = URL.createObjectURL(blob);
      } else {
        const canvas = signatureRef.current.getTrimmedCanvas();
        link.href = canvas.toDataURL(
          outputFormat === "jpeg" ? "image/jpeg" : "image/png",
          outputFormat === "jpeg" ? compressionLevel : undefined
        );
      }

      link.click();

      // Clean up blob URL if created
      if (outputFormat === "svg") {
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      }
    }
  }, [outputFormat, compressionLevel]);

  const handleSignatureEnd = useCallback(() => {
    if (signatureRef.current) {
      const currentData = signatureRef.current.toData();
      setSignatureData(currentData);

      if (signatureRef.current.isEmpty()) {
        formContext.setValue(name, undefined);
      } else {
        if (saveAsDataUrl) {
          let dataUrl: string;
          if (outputFormat === "svg") {
            // Convert to SVG using signature data for better quality
            const svgString = convertSignatureDataToSVG(
              currentData,
              width,
              height,
              penColor,
              backgroundColor
            );
            // Create data URL for SVG
            const encodedSvg = btoa(unescape(encodeURIComponent(svgString)));
            dataUrl = `data:image/svg+xml;base64,${encodedSvg}`;
          } else {
            dataUrl = signatureRef.current.toDataURL(
              outputFormat === "jpeg" ? "image/jpeg" : "image/png",
              outputFormat === "jpeg" ? compressionLevel : undefined
            );
          }
          formContext.setValue(name, dataUrl);
        } else {
          // Save as point data array
          formContext.setValue(name, currentData);
        }
      }
    }
  }, [
    name,
    formContext,
    outputFormat,
    compressionLevel,
    saveAsDataUrl,
    width,
    height,
    penColor,
    backgroundColor,
  ]);

  // Load existing signature data if available
  useEffect(() => {
    const existingValue = formContext.getValues(name);
    if (existingValue && signatureRef.current) {
      if (
        typeof existingValue === "string" &&
        existingValue.startsWith("data:")
      ) {
        // Load from data URL
        signatureRef.current.fromDataURL(existingValue);
      } else if (Array.isArray(existingValue)) {
        // Load from point data
        signatureRef.current.fromData(existingValue);
        setSignatureData(existingValue);
      }
    }
  }, [name, formContext]);

  const isEmpty = signatureRef.current?.isEmpty() ?? true;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="space-y-2">
        <Card className="overflow-hidden" style={{ width, height }}>
          <CardContent className="p-0">
            <SignatureCanvas
              ref={signatureRef}
              penColor={penColor}
              canvasProps={{
                width: width,
                height: height,
                className: "signature-canvas w-full h-full",
              }}
              backgroundColor={backgroundColor}
              minWidth={Math.max(0.5, penWidth - 1)}
              maxWidth={Math.max(1, penWidth + 1)}
              onEnd={handleSignatureEnd}
            />
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {showClearButton && (
            <Button
              type="button"
              variant="outline"
              onClick={clearSignature}
              disabled={isEmpty}
              className="flex items-center gap-1"
              size="sm"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          )}

          {showUndoButton && (
            <Button
              type="button"
              variant="outline"
              onClick={undoLastStroke}
              disabled={signatureData.length === 0}
              className="flex items-center gap-1"
              size="sm"
            >
              <Undo2 className="h-3 w-3" />
              Undo
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={downloadSignature}
            disabled={isEmpty}
            className="flex items-center gap-1"
            size="sm"
          >
            <Download className="h-3 w-3" />
            Download
          </Button>
        </div>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
