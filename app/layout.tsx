import "@/app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { _DEFAULT_APP_NAME } from "@/constants";

export const metadata: Metadata = {
  title: {
    template: `%s | ${_DEFAULT_APP_NAME}`,
    default: _DEFAULT_APP_NAME
  },
  description: _DEFAULT_APP_NAME
};

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children;
}
