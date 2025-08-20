// Test setup file for Vitest
import { vi } from "vitest"
import "@testing-library/jest-dom"
import React from "react"

// Types for mock components
interface MockComponentProps {
  children?: React.ReactNode
  [key: string]: unknown
}

interface MockListProps extends MockComponentProps {
  items?: string[]
}

interface MockModalWrapperProps extends MockComponentProps {
  isOpen?: boolean
}

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}))

// Mock @govie-ds/react components
vi.mock("@govie-ds/react", () => ({
  Alert: ({ children, ...props }: MockComponentProps) =>
    React.createElement("div", { "data-testid": "alert", ...props }, children),
  Button: ({ children, ...props }: MockComponentProps) =>
    React.createElement(
      "button",
      { "data-testid": "button", type: "button", ...props },
      children,
    ),
  Link: ({ children, ...props }: MockComponentProps) =>
    React.createElement("a", { "data-testid": "link", ...props }, children),
  List: ({ items, ...props }: MockListProps) =>
    React.createElement(
      "ul",
      { "data-testid": "list", ...props },
      items?.map((item: string, i: number) =>
        React.createElement("li", { key: i }, item),
      ),
    ),
  ModalBody: ({ children, ...props }: MockComponentProps) =>
    React.createElement(
      "div",
      { "data-testid": "modal-body", ...props },
      children,
    ),
  ModalFooter: ({ children, ...props }: MockComponentProps) =>
    React.createElement(
      "div",
      { "data-testid": "modal-footer", ...props },
      children,
    ),
  ModalTitle: ({ children, ...props }: MockComponentProps) =>
    React.createElement(
      "h2",
      { "data-testid": "modal-title", ...props },
      children,
    ),
  ModalWrapper: ({ children, isOpen, ...props }: MockModalWrapperProps) =>
    isOpen
      ? React.createElement(
          "div",
          { "data-testid": "modal-wrapper", ...props },
          children,
        )
      : null,
  Paragraph: ({ children, ...props }: MockComponentProps) =>
    React.createElement(
      "p",
      { "data-testid": "paragraph", ...props },
      children,
    ),
  Spinner: (props: MockComponentProps) =>
    React.createElement("div", { "data-testid": "spinner", ...props }),
  Stack: ({ children, ...props }: MockComponentProps) =>
    React.createElement("div", { "data-testid": "stack", ...props }, children),
  ToastProvider: ({ children, ...props }: MockComponentProps) =>
    React.createElement(
      "div",
      { "data-testid": "toast-provider", ...props },
      children,
    ),
  toaster: {
    create: vi.fn(),
  },
}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
