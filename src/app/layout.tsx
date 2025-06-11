// app/layout.tsx
import "@tomo-inc/tomo-evm-kit/styles.css";
import "./globals.css";
import { ReactNode } from "react";
import ClientProviders from "./ClientProviders";
import Topbar from "./components/Topbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          paddingTop: "100px", // Added padding for fixed nav
          minHeight: "100vh",
          margin: 0,
          position: "relative",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "-10%",
              width: "40%",
              height: "40%",
              background:
                "radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-20%",
              right: "-10%",
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
        </div>

        {/* ← providers must wrap everything that uses ConnectButton */}
        <ClientProviders>
          <Topbar />
          <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
        </ClientProviders>
      </body>
    </html>
  );
}
