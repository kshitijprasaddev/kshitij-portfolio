import { useRef } from "react";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Html } from "@react-three/drei";
import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

function IDEScreen() {
  return (
    <Html
      transform
      occlude
      position={[0, 1, 0.046]}
      scale={0.048}
      style={{
        width: "680px",
        height: "392px",
        overflow: "hidden",
        borderRadius: "2px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d1117",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          fontSize: "11px",
          color: "#abb2bf",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
        }}
      >
        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            background: "#161b22",
            borderBottom: "1px solid #21262d",
            padding: "0",
            height: "28px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              padding: "4px 12px",
              background: "#0d1117",
              color: "#e6edf3",
              borderBottom: "2px solid #84cc16",
              fontSize: "10px",
            }}
          >
            portfolio.tsx
          </div>
          <div
            style={{
              padding: "4px 12px",
              color: "#7d8590",
              fontSize: "10px",
            }}
          >
            constants.ts
          </div>
          <div
            style={{
              padding: "4px 12px",
              color: "#7d8590",
              fontSize: "10px",
            }}
          >
            hooks.ts
          </div>
        </div>
        {/* Code area */}
        <div
          style={{
            flex: 1,
            padding: "8px 0",
            lineHeight: "1.65",
            display: "flex",
          }}
        >
          {/* Line numbers */}
          <div
            style={{
              color: "#484f58",
              textAlign: "right",
              paddingRight: "12px",
              paddingLeft: "12px",
              borderRight: "1px solid #21262d",
              fontSize: "10px",
              lineHeight: "1.65",
            }}
          >
            {Array.from({ length: 22 }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* Code content */}
          <div style={{ paddingLeft: "12px", whiteSpace: "pre" }}>
            <div>
              <span style={{ color: "#c678dd" }}>import</span>
              <span> {"{ "}</span>
              <span style={{ color: "#e5c07b" }}>motion</span>
              <span>{" } "}</span>
              <span style={{ color: "#c678dd" }}>from</span>
              <span style={{ color: "#98c379" }}> &quot;framer-motion&quot;</span>
            </div>
            <div>
              <span style={{ color: "#c678dd" }}>import</span>
              <span> {"{ "}</span>
              <span style={{ color: "#e5c07b" }}>Canvas</span>
              <span>{" } "}</span>
              <span style={{ color: "#c678dd" }}>from</span>
              <span style={{ color: "#98c379" }}>
                {" "}
                &quot;@react-three/fiber&quot;
              </span>
            </div>
            <div style={{ height: "1.65em" }} />
            <div>
              <span style={{ color: "#7d8590" }}>
                {"// "}Kshitij Prasad — Developer Portfolio
              </span>
            </div>
            <div>
              <span style={{ color: "#c678dd" }}>export default function</span>
              <span style={{ color: "#61afef" }}> Portfolio</span>
              <span>() {"{"}</span>
            </div>
            <div>
              <span>{"  "}</span>
              <span style={{ color: "#c678dd" }}>const</span>
              <span> skills</span>
              <span style={{ color: "#56b6c2" }}> =</span>
              <span> [</span>
            </div>
            <div>
              <span>{"    "}</span>
              <span style={{ color: "#98c379" }}>&quot;React&quot;</span>
              <span>,</span>
              <span style={{ color: "#98c379" }}> &quot;TypeScript&quot;</span>
              <span>,</span>
              <span style={{ color: "#98c379" }}> &quot;Three.js&quot;</span>
              <span>,</span>
            </div>
            <div>
              <span>{"    "}</span>
              <span style={{ color: "#98c379" }}>&quot;Next.js&quot;</span>
              <span>,</span>
              <span style={{ color: "#98c379" }}> &quot;Python&quot;</span>
              <span>,</span>
              <span style={{ color: "#98c379" }}> &quot;Node.js&quot;</span>
            </div>
            <div>
              <span>{"  "}{"]\u003B"}</span>
            </div>
            <div style={{ height: "1.65em" }} />
            <div>
              <span>{"  "}</span>
              <span style={{ color: "#c678dd" }}>return</span>
              <span> (</span>
            </div>
            <div>
              <span>{"    "}</span>
              <span style={{ color: "#e06c75" }}>&lt;Canvas</span>
              <span style={{ color: "#d19a66" }}> shadows</span>
              <span style={{ color: "#e06c75" }}>&gt;</span>
            </div>
            <div>
              <span>{"      "}</span>
              <span style={{ color: "#e06c75" }}>&lt;Room</span>
              <span style={{ color: "#e06c75" }}> /&gt;</span>
            </div>
            <div>
              <span>{"      "}</span>
              <span style={{ color: "#e06c75" }}>&lt;Lighting</span>
              <span style={{ color: "#e06c75" }}> /&gt;</span>
            </div>
            <div>
              <span>{"      "}</span>
              <span style={{ color: "#e06c75" }}>&lt;Camera</span>
              <span style={{ color: "#d19a66" }}> fov</span>
              <span>={"{"}40{"}"}</span>
              <span style={{ color: "#e06c75" }}> /&gt;</span>
            </div>
            <div>
              <span>{"    "}</span>
              <span style={{ color: "#e06c75" }}>&lt;/Canvas&gt;</span>
            </div>
            <div>
              <span>{"  "})</span>
            </div>
            <div>
              <span>{"}"}</span>
            </div>
            <div style={{ height: "1.65em" }} />
            <div>
              <span style={{ color: "#7d8590" }}>
                {"// "}Built with React Three Fiber ✦
              </span>
            </div>
            <div style={{ height: "1.65em" }} />
            <div>
              <span style={{ color: "#c678dd" }}>export const</span>
              <span style={{ color: "#e5c07b" }}> config</span>
              <span style={{ color: "#56b6c2" }}> =</span>
              <span> {"{"}</span>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}

export default function Monitor() {
  const screenRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (screenRef.current) {
      const mat = screenRef.current.material as any;
      mat.emissiveIntensity =
        0.08 + Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
    }
  });

  return (
    <group position={[0, 1.6, -2.5]}>
      {/* Screen bezel — reflective dark */}
      <mesh position={[0, 1, 0]} castShadow>
        <RoundedBox args={[1.8, 1.1, 0.08]} radius={0.02} smoothness={4}>
          <meshPhysicalMaterial
            color={COLORS.monitor}
            roughness={0.1}
            metalness={0.9}
          />
        </RoundedBox>
      </mesh>

      {/* Screen face — dark base behind HTML */}
      <mesh ref={screenRef} position={[0, 1, 0.044]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshStandardMaterial
          color="#0d1117"
          emissive="#84cc16"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* HTML IDE content rendered on monitor */}
      <IDEScreen />

      {/* RGB backlight behind monitor */}
      <mesh position={[0, 1, -0.06]}>
        <planeGeometry args={[2.2, 1.5]} />
        <meshBasicMaterial
          color={COLORS.primary}
          transparent
          opacity={0.06}
        />
      </mesh>
      <pointLight
        position={[0, 1, -0.15]}
        intensity={0.25}
        color={COLORS.primary}
        distance={3}
        decay={2}
      />

      {/* Stand neck */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
        <meshPhysicalMaterial
          color={COLORS.monitor}
          metalness={0.8}
          roughness={0.15}
        />
      </mesh>

      {/* Stand base */}
      <mesh position={[0, 0.02, 0.15]} castShadow>
        <RoundedBox args={[0.6, 0.04, 0.4]} radius={0.01} smoothness={4}>
          <meshPhysicalMaterial
            color={COLORS.monitor}
            metalness={0.8}
            roughness={0.15}
          />
        </RoundedBox>
      </mesh>

      {/* Keyboard */}
      <mesh position={[0, 0.02, 0.9]} castShadow>
        <RoundedBox args={[1.2, 0.04, 0.4]} radius={0.01} smoothness={4}>
          <meshPhysicalMaterial color="#1a1a1e" roughness={0.4} metalness={0.2} />
        </RoundedBox>
      </mesh>

      {/* Mouse */}
      <mesh position={[0.9, 0.02, 0.9]} castShadow>
        <RoundedBox args={[0.2, 0.04, 0.3]} radius={0.01} smoothness={4}>
          <meshPhysicalMaterial color="#1a1a1e" roughness={0.4} metalness={0.2} />
        </RoundedBox>
      </mesh>
    </group>
  );
}
