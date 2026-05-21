"use client";

import { Notifications } from "@mantine/notifications";
import {
  notifications,
  type NotificationData,
} from "@mantine/notifications";

export type ToastVariant = "success" | "error" | "warning" | "info";

type ToastInput = {
  title?: string;
  message: string;
  variant?: ToastVariant;
} & Partial<Omit<NotificationData, "message">>;

const variantColor: Record<ToastVariant, string> = {
  success: "green",
  error: "red",
  warning: "yellow",
  info: "indigo",
};

function show({
  title,
  message,
  variant = "info",
  autoClose = 4000,
  withBorder = true,
  radius = "md",
  ...rest
}: ToastInput) {
  return notifications.show({
    title,
    message,
    color: variantColor[variant],
    autoClose,
    withBorder,
    radius,
    ...rest,
  });
}

export const toast = {
  show,
  success: (message: string, title?: string) =>
    show({ message, title, variant: "success" }),
  error: (message: string, title?: string) =>
    show({ message, title, variant: "error" }),
  warning: (message: string, title?: string) =>
    show({ message, title, variant: "warning" }),
  info: (message: string, title?: string) =>
    show({ message, title, variant: "info" }),
};

export function Toaster() {
  return (
    <Notifications
      position="top-right"
      zIndex={1000}
      autoClose={4000}
      containerWidth={360}
      limit={4}
    />
  );
}
