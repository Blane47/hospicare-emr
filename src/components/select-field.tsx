"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SelectOption = { value: string; label: string };

/**
 * A Select bound to a hidden input so it always participates in native
 * <form> / FormData submission — independent of the underlying primitive's
 * form integration. Reused by every form in the app.
 */
export function SelectField({
  name,
  options,
  defaultValue = "",
  placeholder = "Select…",
  className,
  onChange,
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value || undefined}
        onValueChange={(v) => {
          setValue(v as string);
          onChange?.(v as string);
        }}
      >
        <SelectTrigger className={className ?? "w-full"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
