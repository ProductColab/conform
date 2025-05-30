"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { FieldArrayWithId } from "react-hook-form";
import { z } from "zod/v4";
import type { FieldMetadata } from "@/schemas/field.schema";
import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hasArrayConstraints, isArraySchema } from "@/utils";

interface ListFieldProps {
  name: string;
  property: z.core.JSONSchema.Schema;
  required: boolean;
  label: string;
  description?: string;
  metadata: FieldMetadata;
  children?: (
    index: number,
    field: FieldArrayWithId<Record<string, unknown>>
  ) => React.ReactNode;
}

// Individual sortable item component using shadcn/ui
function SortableItem({
  id,
  isCollapsed,
  onToggleCollapse,
  onRemove,
  allowReorder,
  showRemoveButton,
  removeButtonText,
  itemTitle,
  children,
}: {
  id: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRemove: () => void;
  allowReorder: boolean;
  showRemoveButton: boolean;
  removeButtonText: string;
  itemTitle: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`shadow-sm ${isDragging ? "ring-2 ring-blue-200" : ""}`}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {allowReorder && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 px-1"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {itemTitle}
            </Button>
          </div>
          {showRemoveButton && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              {removeButtonText}
            </Button>
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <>
          <Separator />
          <CardContent className="pt-3 pb-4">{children}</CardContent>
        </>
      )}
    </Card>
  );
}

export function ListField({
  name,
  property,
  required,
  label,
  description,
  metadata,
  children,
}: ListFieldProps) {
  const formContext = useFormContext();
  const [collapsedItems, setCollapsedItems] = useState<Set<number>>(new Set());

  if (!formContext) {
    return null;
  }

  // Extract schema information from the property using type guards
  const getArrayConstraints = useCallback(() => {
    try {
      if (hasArrayConstraints(property)) {
        return {
          // Prefer standard JSON Schema properties
          minItems: property.minItems ?? property.minLength ?? 0,
          maxItems: property.maxItems ?? property.maxLength ?? 10,
        };
      }
    } catch (error) {
      // Fallback to metadata if schema parsing fails
    }
    return { minItems: 0, maxItems: 10 };
  }, [property]);

  // Get item schema for generating default values
  const getItemSchema = useCallback((): unknown => {
    try {
      if (isArraySchema(property) && property.items) {
        // Handle array items (can be schema, array of schemas, or boolean)
        if (
          typeof property.items === "object" &&
          !Array.isArray(property.items)
        ) {
          return property.items;
        }
        // For tuple schemas (array of schemas), use the first item as template
        if (Array.isArray(property.items) && property.items.length > 0) {
          return property.items[0];
        }
      }
    } catch (error) {
      // Fallback to null
    }
    return null;
  }, [property]);

  const { fields, append, remove, move } = useFieldArray({
    control: formContext.control,
    name,
  });

  // Generate default value for new items based on schema
  const generateDefaultItem = useCallback((): any => {
    const itemSchema = getItemSchema();

    // If schema has a default, use it
    if (
      itemSchema &&
      typeof itemSchema === "object" &&
      "default" in itemSchema
    ) {
      const defaultValue = itemSchema.default;

      // For primitive types, wrap in object for React Hook Form
      if (typeof defaultValue !== "object" || defaultValue === null) {
        return { value: defaultValue };
      }
      return defaultValue;
    }

    // Determine if this is a primitive or object schema
    if (itemSchema && typeof itemSchema === "object" && "type" in itemSchema) {
      switch (itemSchema.type) {
        case "string":
          return { value: "" }; // Wrap primitive in object
        case "number":
        case "integer":
          return { value: 0 };
        case "boolean":
          return { value: false };
        case "object":
          return {}; // Objects stay as objects
        case "array":
          return [];
        default:
          return { value: null };
      }
    }

    // Fallback for unknown schemas - assume string
    return { value: "" };
  }, [getItemSchema]);

  const schemaConstraints = getArrayConstraints();

  // Extract array repeater specific metadata with defaults, preferring schema constraints
  const {
    minItems = schemaConstraints.minItems,
    maxItems = schemaConstraints.maxItems,
    allowReorder = true,
    showAddButton = true,
    showRemoveButton = true,
    addButtonText = "Add Item",
    removeButtonText = "Remove",
    itemTemplate = {
      title: "Item {index}",
      collapsible: true,
      defaultExpanded: true,
    },
    validation = {
      validateItems: true,
      stopOnFirstError: false,
    },
  } = metadata;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          move(oldIndex, newIndex);
        }
      }
    },
    [fields, move]
  );

  const addItem = useCallback(() => {
    if (fields.length < maxItems) {
      // Use schema-based default value instead of empty object
      const defaultItem = generateDefaultItem();
      append(defaultItem);

      // If new items should be expanded by default
      if (itemTemplate.defaultExpanded) {
        setCollapsedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fields.length); // Remove from collapsed set (expand)
          return newSet;
        });
      } else {
        setCollapsedItems((prev) => new Set([...prev, fields.length])); // Add to collapsed set
      }
    }
  }, [
    fields.length,
    maxItems,
    append,
    itemTemplate.defaultExpanded,
    generateDefaultItem,
  ]);

  const removeItem = useCallback(
    (index: number) => {
      if (fields.length > minItems) {
        remove(index);

        // Update collapsed items indices
        setCollapsedItems((prev) => {
          const newSet = new Set<number>();
          prev.forEach((i) => {
            if (i < index) {
              newSet.add(i);
            } else if (i > index) {
              newSet.add(i - 1);
            }
            // Don't add the removed index
          });
          return newSet;
        });
      }
    },
    [fields.length, minItems, remove]
  );

  const toggleItemCollapse = useCallback((index: number) => {
    setCollapsedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const formatItemTitle = useCallback((template: string, index: number) => {
    return template.replace("{index}", (index + 1).toString());
  }, []);

  // Initialize collapsed state for existing items
  useState(() => {
    if (!itemTemplate.defaultExpanded) {
      setCollapsedItems(new Set(fields.map((_, index) => index)));
    }
  });

  const canAddMore = fields.length < maxItems;
  const canRemove = fields.length > minItems;
  const isCollapsible = itemTemplate.collapsible ?? true;

  return (
    <div className="space-y-4">
      {/* Field label and description */}
      <div>
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-blue-600 mt-1">{description}</p>
        )}
      </div>

      {/* Items list */}
      {fields.length > 0 && (
        <DndContext
          sensors={allowReorder ? sensors : []}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {fields.map((field, index) => {
                const isCollapsed = isCollapsible && collapsedItems.has(index);
                const itemTitle = formatItemTitle(
                  itemTemplate.title || "Item {index}",
                  index
                );

                return (
                  <SortableItem
                    key={field.id}
                    id={field.id}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() =>
                      isCollapsible && toggleItemCollapse(index)
                    }
                    onRemove={() => canRemove && removeItem(index)}
                    allowReorder={allowReorder}
                    showRemoveButton={showRemoveButton && canRemove}
                    removeButtonText={removeButtonText}
                    itemTitle={itemTitle}
                  >
                    {/* Render child fields */}
                    {children ? (
                      children(index, field)
                    ) : (
                      <div className="text-sm text-gray-500">
                        No field renderer provided. Use the children prop to
                        render fields for index {index}.
                      </div>
                    )}
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Empty state */}
      {fields.length === 0 && (
        <Alert variant="default" className="text-center py-8 border-dashed">
          <AlertDescription>
            <p className="text-gray-500 text-sm">No items added yet</p>
            {minItems > 0 && (
              <p className="text-xs text-red-500 mt-1">
                Minimum {minItems} item{minItems !== 1 ? "s" : ""} required
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Add button */}
      {showAddButton && canAddMore && (
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
          {maxItems < Infinity && (
            <span className="text-xs text-gray-500">
              ({fields.length}/{maxItems})
            </span>
          )}
        </Button>
      )}

      {/* Validation messages */}
      {validation.validateItems && (
        <div className="text-xs text-gray-500">
          {fields.length < minItems && (
            <p className="text-red-500">
              Minimum {minItems} item{minItems !== 1 ? "s" : ""} required
            </p>
          )}
          {fields.length > maxItems && (
            <p className="text-red-500">
              Maximum {maxItems} item{maxItems !== 1 ? "s" : ""} allowed
            </p>
          )}
        </div>
      )}
    </div>
  );
}
