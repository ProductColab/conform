import { z } from "zod/v4";
import type { FieldMetadata } from "./schemas/field.schema";

export const FieldRegistry = z.registry<FieldMetadata>();
