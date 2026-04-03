"use client";

import { useEffect, useState } from "react";

interface PreloaderProps {
  visible: boolean;
}

export default function Preloader({ visible }: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 95) {
            clearInterval(interval);
            return 95;
          }
          return p + Math.random() * 15;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [visible]);

  return (
    <div className={`preloader ${!visible ? "hidden" : ""}`}>
      <div className="preloader-logo">KP</div>
      <div className="preloader-bar">
        <div
          className="preloader-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="preloader-text">{Math.round(Math.min(progress, 100))}%</div>
    </div>
  );
}
