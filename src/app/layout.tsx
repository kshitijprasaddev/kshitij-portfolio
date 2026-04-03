import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kshitij Prasad | Robotics & Autonomous Systems Engineer",
  description:
    "Robotics & Autonomous Systems Engineer specializing in deep reinforcement learning, drone autonomy, and real-time sensor fusion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>K</text></svg>"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
