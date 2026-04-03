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

  const isHovered = hoveredObject === id;
  const isActive = activePanel === id;

  useFrame((_, delta) => {
    const target = isHovered && !isActive ? 1.03 : 1;
    setHoverScale((prev) => prev + (target - prev) * Math.min(delta * 8, 1));
    if (ref.current) {
      ref.current.scale.setScalar(hoverScale);
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

      {/* Hover glow outline */}
      {isHovered && !isActive && (
        <mesh position={[0, yOffset, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial
            color="#84cc16"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}
