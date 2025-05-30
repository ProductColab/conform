"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";

interface SwitchFieldProps {
  name: string;
  required: boolean;
  label: string;
  description?: string;
}

export function SwitchField({
  name,
  required,
  label,
  description,
}: SwitchFieldProps) {
  const formContext = useFormContext();

  if (!formContext) {
    return null;
  }

  return (
    <FormField
      name={name}
      control={formContext.control}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md">
          <div>
            <FormLabel>
              {label}
              {required && " *"}
            </FormLabel>
            {description && (
              <p className="text-xs text-blue-600">{description}</p>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value === undefined ? false : field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
