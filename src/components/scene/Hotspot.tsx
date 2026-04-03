import { useRef, useState, ReactNode } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { useRoomStore } from "@/hooks/useRoomStore";
import type { HotspotId } from "@/types";

interface HotspotProps {
  id: HotspotId;
  children: ReactNode;
  yOffset?: number;
}

export default function Hotspot({ id, children, yOffset = 0 }: HotspotProps) {
  const ref = useRef<Group>(null);
  const setPanel = useRoomStore((s) => s.setPanel);
  const setHovered = useRoomStore((s) => s.setHovered);
  const hoveredObject = useRoomStore((s) => s.hoveredObject);
  const activePanel = useRoomStore((s) => s.activePanel);
  const [hoverScale, setHoverScale] = useState(1);
  const [hoverY, setHoverY] = useState(0);

  const isHovered = hoveredObject === id;
  const isActive = activePanel === id;

  useFrame((_, delta) => {
    const targetScale = isHovered && !isActive ? 1.03 : 1;
    const targetY = isHovered && !isActive ? 0.05 : 0;
    setHoverScale((prev) => prev + (targetScale - prev) * Math.min(delta * 8, 1));
    setHoverY((prev) => prev + (targetY - prev) * Math.min(delta * 6, 1));
    if (ref.current) {
      ref.current.scale.setScalar(hoverScale);
      ref.current.position.y = hoverY;
    }
  });

  return (
    <group
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        if (!activePanel) setPanel(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(null);
        document.body.style.cursor = "default";
      }}
    >
      {children}
    </group>
  );
}
