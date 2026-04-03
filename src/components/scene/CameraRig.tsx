import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useRoomStore } from "@/hooks/useRoomStore";
import { IDLE_POSE, HOTSPOT_POSES } from "@/lib/constants";

const _pos = new Vector3();
const _look = new Vector3();
const _current = new Vector3();

export default function CameraRig() {
  const { camera } = useThree();
  const activePanel = useRoomStore((s) => s.activePanel);
  const targetRef = useRef({ pos: IDLE_POSE.position, look: IDLE_POSE.lookAt });

  // Update target when panel changes
  const pose = activePanel ? HOTSPOT_POSES[activePanel] : IDLE_POSE;
  targetRef.current = { pos: pose.position, look: pose.lookAt };

  useFrame((_, delta) => {
    const { pos, look } = targetRef.current;
    const speed = 3;
    const t = 1 - Math.pow(0.001, delta * speed);

    _pos.set(...pos);
    camera.position.lerp(_pos, t);

    _look.set(...look);
    _current.set(0, 0, -1).applyQuaternion(camera.quaternion).add(camera.position);
    _current.lerp(_look, t);
    camera.lookAt(_current);
  });

  return null;
}
