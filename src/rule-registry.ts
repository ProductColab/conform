import { z } from "zod/v4";
import type { RuleMetadata } from "./schemas/rule.schema";

export const RuleRegistry = z.registry<RuleMetadata>();
