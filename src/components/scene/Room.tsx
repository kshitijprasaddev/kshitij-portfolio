import { ContactShadows } from "@react-three/drei";
import RoomShell from "./RoomShell";
import Desk from "./Desk";
import Monitor from "./Monitor";
import Bookshelf from "./Bookshelf";
import Whiteboard from "./Whiteboard";
import Cabinet from "./Cabinet";
import PhotoFrame from "./PhotoFrame";
import DeskPhone from "./DeskPhone";
import Trophy from "./Trophy";
import Window from "./Window";
import Chair from "./Chair";
import DeskLamp from "./DeskLamp";
import Particles from "./Particles";
import LightRays from "./LightRays";

export default function Room() {
  return (
    <group>
      <RoomShell />
      <Desk />
      <Monitor />
      <Bookshelf />
      <Whiteboard />
      <Cabinet />
      <PhotoFrame />
      <DeskPhone />
      <Trophy />
      <Window />
      <Chair />
      <DeskLamp />
      <Particles />
      <LightRays />

      {/* Soft contact shadows grounding all objects */}
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={14}
        blur={2.5}
        far={4}
      />
    </group>
  );
}
