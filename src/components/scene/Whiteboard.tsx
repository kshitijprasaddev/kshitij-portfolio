"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { CanvasTexture, Vector2 } from "three";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";
import { useRoomStore } from "@/hooks/useRoomStore";

const CANVAS_W = 1024;
const CANVAS_H = 680;

const MARKER_COLORS = ["#111111", "#e53e3e", "#38a169", "#3182ce", "#84cc16"];

export default function Whiteboard() {
  const activePanel = useRoomStore((s) => s.activePanel);
  const isActive = activePanel === "whiteboard";
  const [drawing, setDrawing] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [isEraser, setIsEraser] = useState(false);
  const lastUV = useRef(new Vector2());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);

  // Create offscreen canvas for drawing
  const canvas2d = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = CANVAS_W;
    c.height = CANVAS_H;
    const ctx = c.getContext("2d")!;
    // White background
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // Initial doodle hint
    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#bbb";
    ctx.textAlign = "center";
    ctx.fillText("Click here and draw ✏️", CANVAS_W / 2, CANVAS_H / 2);
    return c;
  }, []);

  useEffect(() => {
    canvasRef.current = canvas2d;
  }, [canvas2d]);

  const getCanvasPos = useCallback(
    (uv: Vector2) => ({
      x: uv.x * CANVAS_W,
      y: (1 - uv.y) * CANVAS_H,
    }),
    []
  );

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!isActive) return;
      e.stopPropagation();
      setDrawing(true);
      if (e.uv) lastUV.current.copy(e.uv);
    },
    [isActive]
  );

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!drawing || !canvasRef.current || !e.uv) return;
      e.stopPropagation();
      const ctx = canvasRef.current.getContext("2d")!;
      const from = getCanvasPos(lastUV.current);
      const to = getCanvasPos(e.uv);

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (isEraser) {
        ctx.strokeStyle = "#f8f8f8";
        ctx.lineWidth = 28;
      } else {
        ctx.strokeStyle = MARKER_COLORS[colorIdx];
        ctx.lineWidth = 3;
      }
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      lastUV.current.copy(e.uv);
      if (textureRef.current) textureRef.current.needsUpdate = true;
    },
    [drawing, colorIdx, isEraser, getCanvasPos]
  );

  const handlePointerUp = useCallback(() => {
    setDrawing(false);
  }, []);

  return (
    <group position={[1.5, 3.8, -5.85]}>
      <Hotspot id="whiteboard" yOffset={1.5}>
        {/* Board surface with canvas texture */}
        <mesh
          castShadow
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <planeGeometry args={[2.9, 1.9]} />
          {canvas2d && (
            <canvasTexture
              ref={textureRef}
              attach="material-map"
              image={canvas2d}
              args={[canvas2d]}
            />
          )}
          <meshStandardMaterial roughness={0.3} />
        </mesh>

        {/* Frame */}
        {([
          { pos: [0, 0.97, 0] as const, args: [3.05, 0.06, 0.12] as const },
          { pos: [0, -0.97, 0] as const, args: [3.05, 0.06, 0.12] as const },
          { pos: [-1.47, 0, 0] as const, args: [0.06, 2.0, 0.12] as const },
          { pos: [1.47, 0, 0] as const, args: [0.06, 2.0, 0.12] as const },
        ] as const).map(({ pos, args }, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={args} />
            <meshPhysicalMaterial
              color={COLORS.whiteboardFrame}
              roughness={0.4}
              metalness={0.3}
            />
          </mesh>
        ))}

        {/* Tray */}
        <mesh position={[0, -1.1, 0.12]}>
          <boxGeometry args={[2.5, 0.06, 0.15]} />
          <meshPhysicalMaterial
            color={COLORS.whiteboardFrame}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>

        {/* Marker color buttons on tray */}
        {isActive &&
          MARKER_COLORS.map((color, i) => (
            <mesh
              key={`marker-${i}`}
              position={[-0.6 + i * 0.25, -1.1, 0.22]}
              onClick={(e) => {
                e.stopPropagation();
                setColorIdx(i);
                setIsEraser(false);
              }}
            >
              <cylinderGeometry args={[0.04, 0.04, 0.08, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={colorIdx === i && !isEraser ? color : "#000"}
                emissiveIntensity={colorIdx === i && !isEraser ? 0.5 : 0}
              />
            </mesh>
          ))}

        {/* Eraser on tray */}
        {isActive && (
          <mesh
            position={[0.8, -1.1, 0.22]}
            onClick={(e) => {
              e.stopPropagation();
              setIsEraser(true);
            }}
          >
            <RoundedBox args={[0.15, 0.06, 0.08]} radius={0.01} smoothness={2}>
              <meshStandardMaterial
                color="#f0f0f0"
                emissive={isEraser ? "#fff" : "#000"}
                emissiveIntensity={isEraser ? 0.3 : 0}
              />
            </RoundedBox>
          </mesh>
        )}
      </Hotspot>
    </group>
  );
}
