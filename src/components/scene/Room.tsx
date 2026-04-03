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
    </group>
  );
}
