import { COLORS } from "@/lib/constants";
import Hotspot from "./Hotspot";

export default function Bookshelf() {
  const bookColors = ["#8b4513", "#2d5016", "#1a3a5c", "#5c1a2a", "#4a3b2a", "#1a4a4a"];

  return (
    <group position={[-5.5, 0, -3]}>
      <Hotspot id="bookshelf" yOffset={4.5}>
        {/* Side panels */}
        <mesh position={[-0.9, 2.5, 0]} castShadow>
          <boxGeometry args={[0.08, 5, 0.8]} />
          <meshPhysicalMaterial color={COLORS.bookshelfWood} roughness={0.5} />
        </mesh>
        <mesh position={[0.9, 2.5, 0]} castShadow>
          <boxGeometry args={[0.08, 5, 0.8]} />
          <meshPhysicalMaterial color={COLORS.bookshelfWood} roughness={0.5} />
        </mesh>

        {/* Shelves */}
        {[0, 1.25, 2.5, 3.75, 5].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[1.88, 0.08, 0.8]} />
            <meshPhysicalMaterial color={COLORS.bookshelfWood} roughness={0.5} />
          </mesh>
        ))}

        {/* Back panel */}
        <mesh position={[0, 2.5, -0.38]}>
          <boxGeometry args={[1.8, 5, 0.04]} />
          <meshStandardMaterial color="#1a1208" roughness={0.9} />
        </mesh>

        {/* Books - row 1 */}
        {bookColors.slice(0, 5).map((color, i) => (
          <mesh key={`b1-${i}`} position={[-0.6 + i * 0.3, 0.6, 0]} castShadow>
            <boxGeometry args={[0.18, 1, 0.5]} />
            <meshPhysicalMaterial color={color} roughness={0.6 + Math.random() * 0.3} />
          </mesh>
        ))}

        {/* Books - row 2 */}
        {bookColors.slice(1).map((color, i) => (
          <mesh key={`b2-${i}`} position={[-0.5 + i * 0.35, 1.85, 0]} castShadow>
            <boxGeometry args={[0.2, 1, 0.5]} />
            <meshPhysicalMaterial color={color} roughness={0.7} />
          </mesh>
        ))}

        {/* Books - row 3 */}
        {bookColors.slice(0, 4).map((color, i) => (
          <mesh key={`b3-${i}`} position={[-0.4 + i * 0.3, 3.1, 0]} castShadow>
            <boxGeometry args={[0.16, 1, 0.45]} />
            <meshPhysicalMaterial color={color} roughness={0.8} />
          </mesh>
        ))}

        {/* Books - row 4 */}
        {bookColors.slice(2).map((color, i) => (
          <mesh key={`b4-${i}`} position={[-0.3 + i * 0.35, 4.35, 0]} castShadow>
            <boxGeometry args={[0.22, 1, 0.5]} />
            <meshPhysicalMaterial color={color} roughness={0.65} />
          </mesh>
        ))}
      </Hotspot>
    </group>
  );
}
