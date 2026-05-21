"use client";

import {
  TextInput,
  type TextInputProps,
  type MantineTheme,
} from "@mantine/core";
import { forwardRef, useId } from "react";

export type TextFieldProps = TextInputProps;

type StylesInput = TextInputProps["styles"];

function resolveStyles(
  styles: StylesInput,
  theme: MantineTheme,
  props: TextInputProps,
  ctx: unknown,
) {
  if (typeof styles === "function") {
    return styles(theme, props, ctx as never);
  }
  return styles ?? {};
}

function inputHeightClass(size: TextInputProps["size"]) {
  if (size === "sm") return "min-h-[38px]";
  if (size === "lg") return "min-h-[48px]";
  return "min-h-[42px]";
}

function mergeClassNames(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function resolveClassNames(
  classNames: TextInputProps["classNames"],
  theme: MantineTheme,
  props: TextInputProps,
  ctx: unknown,
) {
  if (typeof classNames === "function") {
    return classNames(theme, props, ctx as never) ?? {};
  }
  return classNames ?? {};
}

function buildClassNames(
  options: {
    size: TextInputProps["size"];
    variant: TextInputProps["variant"];
    hasError: boolean;
    userClassNames: Partial<Record<string, string>>;
  },
) {
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
      "placeholder:text-[var(--mantine-color-placeholder)]",
      "hover:not(:disabled):not([data-error]):border-[var(--mantine-color-gray-4)]",
      variant === "filled"
        ? "bg-[var(--mantine-color-default-hover)]"
        : "bg-transparent",
      hasError
        ? "border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_22%,transparent)]"
        : "border-[var(--mantine-color-default-border)] focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_22%,transparent)]",
      userClassNames.input,
    ),
  };
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      id,
      size = "md",
      radius = "md",
      variant = "default",
      label,
      description,
      error,
      required,
      leftSection,
      rightSection,
      styles,
      classNames,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(error);

    return (
      <TextInput
        ref={ref}
        id={inputId}
        size={size}
        radius={radius}
        variant={variant}
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={required}
        leftSection={leftSection}
        rightSection={rightSection}
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

TextField.displayName = "TextField";
