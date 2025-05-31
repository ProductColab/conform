import React, { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useFormContext, useController } from "react-hook-form";
import type { FieldMetadata } from "@/schemas/field.schema";
import { z } from "zod/v4";

interface FileUploadFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
}

interface FilePreview {
  file: File;
  preview?: string;
  error?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  name,
  required,
  label,
  description,
  metadata,
}) => {
  const formContext = useFormContext();
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);

  // Extract file upload specific metadata with defaults
  const {
    accept,
    multiple = false,
    maxFiles = multiple ? 10 : 1,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    dragDrop = true,
    showPreview = true,
    previewType = "thumbnail",
    allowedTypes = [],
    compressionOptions,
  } = metadata;

  const {
    field: { value = [], onChange, onBlur },
    fieldState: { error },
  } = useController({
    name,
    control: formContext?.control,
    defaultValue: [],
  });

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (maxFileSize && file.size > maxFileSize) {
        return `File size must be less than ${formatFileSize(maxFileSize)}`;
      }

      // Check allowed types if specified
      if (allowedTypes && allowedTypes.length > 0) {
        const fileType = getFileType(file);
        if (!allowedTypes.includes(fileType)) {
          return `File type ${fileType} is not allowed`;
        }
      }

      return null;
    },
    [maxFileSize, allowedTypes]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setUploading(true);

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        console.warn("Some files were rejected:", rejectedFiles);
      }

      // Validate accepted files
      const validatedFiles: FilePreview[] = [];
      const validFiles: File[] = [];

      for (const file of acceptedFiles) {
        const validationError = validateFile(file);

        if (validationError) {
          validatedFiles.push({ file, error: validationError });
        } else {
          validFiles.push(file);

          // Create preview if needed
          if (showPreview && file.type.startsWith("image/")) {
            const preview = URL.createObjectURL(file);
            validatedFiles.push({ file, preview });
          } else {
            validatedFiles.push({ file });
          }
        }
      }

      // Apply compression if enabled
      const processedFiles = compressionOptions?.enabled
        ? await compressImages(validFiles, compressionOptions)
        : validFiles;

      // Update state
      const newFiles = multiple
        ? [...value, ...processedFiles]
        : processedFiles.slice(0, 1);

      // Respect maxFiles limit
      const finalFiles = newFiles.slice(0, maxFiles);

      setPreviews(validatedFiles);
      onChange(finalFiles);
      setUploading(false);
    },
    [
      value,
      multiple,
      maxFiles,
      onChange,
      validateFile,
      showPreview,
      compressionOptions,
    ]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = value.filter((_: File, i: number) => i !== index);
      const newPreviews = previews.filter(
        (_: FilePreview, i: number) => i !== index
      );

      // Revoke object URL to prevent memory leaks
      const preview = previews[index];
      if (preview?.preview) {
        URL.revokeObjectURL(preview.preview);
      }

      setPreviews(newPreviews);
      onChange(newFiles);
    },
    [value, previews, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxFiles,
    maxSize: maxFileSize,
    disabled: uploading,
    noClick: !dragDrop, // If dragDrop is false, disable click to open file dialog
  });

  // Early return after all hooks have been called
  if (!formContext) {
    return null;
  }

  const dropzoneProps = dragDrop ? getRootProps() : {};

  return (
    <div>
      {/* Field label and description */}
      <div>
        {label && (
          <label className="block text-sm font-medium mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-xs text-blue-600 mb-2">{description}</p>
        )}
      </div>

      {/* Upload Field */}
      <div className={`file-upload-field ${error ? "error" : ""}`}>
        {/* Upload Area */}
        <div
          {...dropzoneProps}
          className={`
            file-upload-dropzone
            ${isDragActive ? "drag-active" : ""}
            ${uploading ? "uploading" : ""}
          `}
          style={{
            border: `2px dashed ${isDragActive ? "#007bff" : "#ccc"}`,
            borderRadius: "8px",
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: isDragActive ? "#f8f9fa" : "#fafafa",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <input {...getInputProps()} name={name} onBlur={onBlur} />

          {uploading ? (
            <div>
              <div className="spinner" />
              <p>Processing files...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
              {isDragActive ? (
                <p>Drop the files here...</p>
              ) : (
                <div>
                  <p>
                    {dragDrop
                      ? `Drag & drop ${
                          multiple ? "files" : "a file"
                        } here, or click to select`
                      : `Click to select ${multiple ? "files" : "a file"}`}
                  </p>
                  {accept && (
                    <p style={{ fontSize: "0.875rem", color: "#666" }}>
                      Accepted formats: {accept}
                    </p>
                  )}
                  {maxFileSize && (
                    <p style={{ fontSize: "0.875rem", color: "#666" }}>
                      Max file size: {formatFileSize(maxFileSize)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "8px" }}
          >
            {error.message || "Invalid file selection"}
          </div>
        )}

        {/* File Previews */}
        {showPreview && previews.length > 0 && (
          <div className="file-previews" style={{ marginTop: "16px" }}>
            {previewType === "grid" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "16px",
                }}
              >
                {previews.map((preview, index) => (
                  <FilePreviewItem
                    key={index}
                    preview={preview}
                    onRemove={() => removeFile(index)}
                    type="grid"
                  />
                ))}
              </div>
            ) : previewType === "list" ? (
              <div>
                {previews.map((preview, index) => (
                  <FilePreviewItem
                    key={index}
                    preview={preview}
                    onRemove={() => removeFile(index)}
                    type="list"
                  />
                ))}
              </div>
            ) : (
              // thumbnail view
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {previews.map((preview, index) => (
                  <FilePreviewItem
                    key={index}
                    preview={preview}
                    onRemove={() => removeFile(index)}
                    type="thumbnail"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Progress (if needed) */}
        {value.length > 0 && !showPreview && (
          <div style={{ marginTop: "16px" }}>
            <p>
              {value.length} file{value.length > 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// File Preview Component
interface FilePreviewItemProps {
  preview: FilePreview;
  onRemove: () => void;
  type: "thumbnail" | "list" | "grid";
}

const FilePreviewItem: React.FC<FilePreviewItemProps> = ({
  preview,
  onRemove,
  type,
}) => {
  const { file, preview: previewUrl, error } = preview;

  if (type === "thumbnail") {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={file.name}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "4px",
              border: error ? "2px solid #dc3545" : "1px solid #ddd",
            }}
          />
        ) : (
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            📄
          </div>
        )}
        <button
          onClick={onRemove}
          style={{
            position: "absolute",
            top: "-8px",
            right: "-8px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#dc3545",
            color: "white",
            cursor: "pointer",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
        {error && (
          <div
            style={{
              position: "absolute",
              bottom: "-20px",
              left: "0",
              fontSize: "10px",
              color: "#dc3545",
              whiteSpace: "nowrap",
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  // List and grid views
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px",
        border: `1px solid ${error ? "#dc3545" : "#ddd"}`,
        borderRadius: "4px",
        backgroundColor: error ? "#fff5f5" : "white",
      }}
    >
      {previewUrl && (
        <img
          src={previewUrl}
          alt={file.name}
          style={{
            width: type === "grid" ? "60px" : "40px",
            height: type === "grid" ? "60px" : "40px",
            objectFit: "cover",
            borderRadius: "4px",
            marginRight: "12px",
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: "medium", fontSize: "0.875rem" }}>
          {file.name}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#666" }}>
          {formatFileSize(file.size)}
        </div>
        {error && (
          <div
            style={{ fontSize: "0.75rem", color: "#dc3545", marginTop: "4px" }}
          >
            {error}
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        style={{
          marginLeft: "8px",
          padding: "4px 8px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: "white",
          cursor: "pointer",
          fontSize: "0.75rem",
        }}
      >
        Remove
      </button>
    </div>
  );
};

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileType = (file: File): string => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.includes("pdf")) return "document";
  if (file.type.includes("word") || file.type.includes("document"))
    return "document";
  if (file.type.includes("sheet") || file.type.includes("excel"))
    return "spreadsheet";
  return "other";
};

const compressImages = async (
  files: File[],
  options: { quality: number; maxWidth?: number; maxHeight?: number }
): Promise<File[]> => {
  // Simple image compression implementation
  // In a real app, you might use a library like browser-image-compression
  return Promise.all(
    files.map(async (file) => {
      if (!file.type.startsWith("image/")) {
        return file;
      }

      return new Promise<File>((resolve) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          const { maxWidth = img.width, maxHeight = img.height } = options;

          // Calculate new dimensions
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            file.type,
            options.quality
          );
        };

        img.src = URL.createObjectURL(file);
      });
    })
  );
};
