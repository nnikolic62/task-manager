"use client";

import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps,
  type ButtonVariant,
  type MantineColor,
  type MantineTheme,
} from "@mantine/core";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

export const BUTTON_INTENTS = [
  "primary",
  "secondary",
  "destructive",
  "success",
  "warning",
  "neutral",
] as const;

export const BUTTON_APPEARANCES = [
  "filled",
  "outline",
  "subtle",
  "light",
] as const;

export type ButtonIntent = (typeof BUTTON_INTENTS)[number];
export type ButtonAppearance = (typeof BUTTON_APPEARANCES)[number];

type ButtonStyleConfig = {
  color: MantineColor;
  variant: ButtonVariant;
  root?: string;
};

const BUTTON_STYLES: Record<
  ButtonIntent,
  Record<ButtonAppearance, ButtonStyleConfig>
> = {
  primary: {
    filled: { color: "indigo", variant: "filled" },
    outline: { color: "indigo", variant: "outline" },
    subtle: { color: "indigo", variant: "subtle" },
    light: { color: "indigo", variant: "light" },
  },
  secondary: {
    filled: { color: "gray", variant: "filled" },
    outline: { color: "gray", variant: "outline" },
    subtle: { color: "gray", variant: "subtle" },
    light: { color: "gray", variant: "light" },
  },
  destructive: {
    filled: { color: "red", variant: "filled" },
    outline: { color: "red", variant: "outline" },
    subtle: { color: "red", variant: "subtle" },
    light: { color: "red", variant: "light" },
  },
  success: {
    filled: { color: "green", variant: "filled" },
    outline: { color: "green", variant: "outline" },
    subtle: { color: "green", variant: "subtle" },
    light: { color: "green", variant: "light" },
  },
  warning: {
    filled: { color: "yellow", variant: "filled" },
    outline: { color: "yellow", variant: "outline" },
    subtle: { color: "yellow", variant: "subtle" },
    light: { color: "yellow", variant: "light" },
  },
  neutral: {
    filled: { color: "dark", variant: "filled" },
    outline: { color: "dark", variant: "outline" },
    subtle: { color: "gray", variant: "subtle" },
    light: { color: "gray", variant: "light" },
  },
};

function resolveButtonStyle(
  intent: ButtonIntent,
  appearance: ButtonAppearance,
): ButtonStyleConfig {
  return BUTTON_STYLES[intent][appearance];
}

type NativeButtonProps = Pick<
  ComponentPropsWithoutRef<"button">,
  "onClick" | "type" | "form" | "formAction" | "name" | "id" | "aria-label"
>;

export type ButtonProps = Omit<MantineButtonProps, "color" | "variant"> &
  NativeButtonProps & {
    intent?: ButtonIntent;
    appearance?: ButtonAppearance;
  };

type StylesInput = MantineButtonProps["styles"];

function resolveStyles(
  styles: StylesInput,
  theme: MantineTheme,
  props: MantineButtonProps,
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
  classNames: MantineButtonProps["classNames"],
  theme: MantineTheme,
  props: MantineButtonProps,
  ctx: unknown,
) {
  if (typeof classNames === "function") {
    return classNames(theme, props, ctx as never) ?? {};
  }
  return classNames ?? {};
}

function buildClassNames(options: {
  size: MantineButtonProps["size"];
  userClassNames: Partial<Record<string, string>>;
  root?: string;
}) {
  const { size, userClassNames, root } = options;

  const heightClass =
    size === "xs" || size === "compact-xs"
      ? "min-h-[32px]"
      : size === "sm" || size === "compact-sm"
        ? "min-h-[36px]"
        : size === "lg" || size === "compact-lg"
          ? "min-h-[48px]"
          : "min-h-[42px]";

  return {
    root: mergeClassNames(
      heightClass,
      "font-medium transition-[opacity,transform,box-shadow] duration-150",
      "active:translate-y-px",
      root,
      userClassNames.root,
    ),
    label: mergeClassNames(userClassNames.label),
    section: mergeClassNames(userClassNames.section),
  };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      intent = "primary",
      appearance = "filled",
      size = "md",
      radius = "md",
      styles,
      classNames,
      ...rest
    },
    ref,
  ) {
    const { color, variant, root } = resolveButtonStyle(intent, appearance);

    return (
      <MantineButton
        ref={ref}
        color={color}
        variant={variant}
        size={size}
        radius={radius}
        classNames={(theme, props, ctx) =>
          buildClassNames({
            size,
            root,
            userClassNames: resolveClassNames(classNames, theme, props, ctx),
          })
        }
        styles={(theme, props, ctx) => {
          const userStyles = resolveStyles(styles, theme, props, ctx);

          return {
            ...userStyles,
            label: {
              fontSize:
                size === "sm" || size === "compact-sm"
                  ? theme.fontSizes.sm
                  : theme.fontSizes.md,
              ...userStyles?.label,
            },
          };
        }}
        {...rest}
      />
    );
  },
);

Button.displayName = "Button";
