"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";
import { Star } from "lucide-react";
import { useState } from "react";

interface RatingFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
  disabled?: boolean;
}

export function RatingField({
  name,
  required,
  label,
  description,
  metadata,
  disabled = false,
}: RatingFieldProps) {
  const formContext = useFormContext();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  if (!formContext) {
    return null;
  }

  // Extract rating configuration from metadata or use defaults
  const maxRating = metadata?.max || 5;
  const allowHalf = metadata?.allowHalf || false;

  return (
    <FormField
      name={name}
      control={formContext.control}
      render={({ field }) => {
        const currentRating = field.value || 0;
        const displayRating =
          hoveredRating !== null ? hoveredRating : currentRating;

        const handleStarPartClick = (
          starIndex: number,
          event: React.MouseEvent<HTMLButtonElement>
        ) => {
          if (disabled) return;

          if (allowHalf) {
            const rect = event.currentTarget.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const isLeftHalf = clickX < rect.width / 2;
            const rating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
            field.onChange(rating);
          } else {
            field.onChange(starIndex + 1);
          }
        };

        const handleStarPartHover = (
          starIndex: number,
          event: React.MouseEvent<HTMLButtonElement>
        ) => {
          if (disabled) return;

          if (allowHalf) {
            const rect = event.currentTarget.getBoundingClientRect();
            const hoverX = event.clientX - rect.left;
            const isLeftHalf = hoverX < rect.width / 2;
            const rating = isLeftHalf ? starIndex + 0.5 : starIndex + 1;
            setHoveredRating(rating);
          } else {
            setHoveredRating(starIndex + 1);
          }
        };

        const handleMouseLeave = () => {
          setHoveredRating(null);
        };

        const getStarFillState = (starIndex: number) => {
          const starValue = starIndex + 1;
          if (displayRating >= starValue) {
            return "full";
          } else if (allowHalf && displayRating >= starValue - 0.5) {
            return "half";
          }
          return "empty";
        };

        return (
          <FormItem className="space-y-3">
            <FormLabel>
              {label}
              {required && " *"}
            </FormLabel>
            <FormControl>
              <div
                className="flex items-center space-x-1"
                onMouseLeave={handleMouseLeave}
              >
                {Array.from({ length: maxRating }, (_, index) => {
                  const fillState = getStarFillState(index);

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`relative p-1 transition-colors ${
                        fillState !== "empty"
                          ? "text-yellow-400 hover:text-yellow-500"
                          : "text-gray-300 hover:text-yellow-300"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={(event) => handleStarPartClick(index, event)}
                      onMouseEnter={(event) =>
                        handleStarPartHover(index, event)
                      }
                      disabled={disabled}
                      aria-label={`Rate ${index + 1} out of ${maxRating} stars`}
                    >
                      {/* Background star */}
                      <Star className="h-6 w-6 text-gray-300" fill="none" />

                      {/* Fill overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {fillState === "full" && (
                          <Star
                            className="h-6 w-6 text-yellow-400"
                            fill="currentColor"
                          />
                        )}
                        {fillState === "half" && allowHalf && (
                          <div className="relative overflow-hidden">
                            <Star
                              className="h-6 w-6 text-yellow-400"
                              fill="currentColor"
                            />
                            <div className="absolute right-0 top-0 w-1/2 h-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {currentRating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {currentRating} out of {maxRating}
                  </span>
                )}
              </div>
            </FormControl>
            {description && (
              <p className="text-xs text-blue-600">{description}</p>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
