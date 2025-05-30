import { useMemo } from "react";
import { z } from "zod/v4";
import { extractMetadata, getFieldDescription, getFieldLabel } from "../utils";

export const useFieldMetadata = (
  name: string,
  property: z.core.JSONSchema.Schema,
  customDescription?: string,
) => {
  return useMemo(
    () => ({
      metadata: extractMetadata(property),
      label: getFieldLabel(name, property),
      description: getFieldDescription(property, customDescription),
    }),
    [name, property, customDescription],
  );
};
