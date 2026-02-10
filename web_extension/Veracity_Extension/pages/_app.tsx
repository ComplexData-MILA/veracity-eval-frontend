/**
 * Next.js custom App — wraps every page.
 * Used by the extension build only to supply global CSS and the root layout.
 * The actual panel runtime (auth, verify, tabs, discussion) is driven by the
 * inlined panel.js produced in scripts/postbuild.js.
 */
import type { AppProps } from "next/app";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

