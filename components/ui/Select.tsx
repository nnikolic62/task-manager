"use client";

import {
  Select as MantineSelect,
  type MantineTheme,
  type SelectProps,
} from "@mantine/core";
import { forwardRef, useId } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectFieldProps = Omit<SelectProps, "data"> & {
  options: SelectOption[];
};

type StylesInput = SelectProps["styles"];

function resolveStyles(
  styles: StylesInput,
  theme: MantineTheme,
  props: SelectProps,
  ctx: unknown,
) {
  if (typeof styles === "function") {
    return styles(theme, props, ctx as never);
  }
  return styles ?? {};
}

function mergeClassNames(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function resolveClassNames(
  classNames: SelectProps["classNames"],
  theme: MantineTheme,
  props: SelectProps,
  ctx: unknown,
) {
  if (typeof classNames === "function") {
    return classNames(theme, props, ctx as never) ?? {};
  }
  return classNames ?? {};
}

function inputHeightClass(size: SelectProps["size"]) {
  if (size === "sm") return "min-h-[38px]";
  if (size === "lg") return "min-h-[48px]";
  return "min-h-[42px]";
}

function buildClassNames(options: {
  size: SelectProps["size"];
  variant: SelectProps["variant"];
  hasError: boolean;
  userClassNames: Partial<Record<string, string>>;
}) {
  const { size, variant, hasError, userClassNames } = options;

  return {
    root: mergeClassNames("w-full", userClassNames.root),
    label: mergeClassNames(
      "mb-1.5 text-sm font-medium tracking-tight",
      userClassNames.label,
    ),
    description: mergeClassNames(
      "mt-1 text-xs opacity-85",
      userClassNames.description,
    ),
    error: mergeClassNames("mt-1 text-xs", userClassNames.error),
    section: mergeClassNames(
      "text-[var(--mantine-color-dimmed)]",
      userClassNames.section,
    ),
    input: mergeClassNames(
      inputHeightClass(size),
      "border-[1.5px] font-[450] transition-[border-color,box-shadow,background-color] duration-150",
      variant === "filled"
        ? "bg-[var(--mantine-color-default-hover)]"
        : "bg-transparent",
      hasError
        ? "border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_22%,transparent)]"
        : "border-[var(--mantine-color-default-border)] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]",
      userClassNames.input,
    ),
    option: mergeClassNames(userClassNames.option),
    dropdown: mergeClassNames(userClassNames.dropdown),
  };
}

export const SelectField = forwardRef<HTMLInputElement, SelectFieldProps>(
  function SelectField(
    {
      id,
      options,
      size = "md",
      radius = "md",
      variant = "default",
      label,
      description,
      error,
      required,
      styles,
      classNames,
      comboboxProps,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <MantineSelect
        ref={ref}
        id={inputId}
        data={options}
        size={size}
        radius={radius}
        variant={variant}
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={required}
        comboboxProps={comboboxProps}
        classNames={(theme, props, ctx) =>
          buildClassNames({
            size,
            variant,
            hasError,
            userClassNames: resolveClassNames(classNames, theme, props, ctx),
          })
        }
        styles={(theme, props, ctx) => {
          const userStyles = resolveStyles(styles, theme, props, ctx);

          return {
            ...userStyles,
            input: {
              fontSize:
                size === "sm" ? theme.fontSizes.sm : theme.fontSizes.md,
              ...userStyles?.input,
            },
          };
        }}
        {...rest}
      />
    );
  },
);

SelectField.displayName = "SelectField";
