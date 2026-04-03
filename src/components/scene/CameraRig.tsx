import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import gsap from "gsap";
import { useRoomStore } from "@/hooks/useRoomStore";
import { IDLE_POSE, HOTSPOT_POSES } from "@/lib/constants";

const _lookTarget = new Vector3();

export default function CameraRig() {
  const { camera } = useThree();
  const activePanel = useRoomStore((s) => s.activePanel);

  // Animated values for smooth GSAP transitions
  const state = useRef({
    px: IDLE_POSE.position[0],
    py: IDLE_POSE.position[1],
    pz: IDLE_POSE.position[2],
    lx: IDLE_POSE.lookAt[0],
    ly: IDLE_POSE.lookAt[1],
    lz: IDLE_POSE.lookAt[2],
  });

  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const pose = activePanel ? HOTSPOT_POSES[activePanel] : IDLE_POSE;

    // Kill any running tween
    if (tweenRef.current) tweenRef.current.kill();

    tweenRef.current = gsap.to(state.current, {
      px: pose.position[0],
      py: pose.position[1],
      pz: pose.position[2],
      lx: pose.lookAt[0],
      ly: pose.lookAt[1],
      lz: pose.lookAt[2],
      duration: 1.4,
      ease: "power2.inOut",
    });

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [activePanel]);

  useFrame(() => {
    const { px, py, pz, lx, ly, lz } = state.current;
    camera.position.set(px, py, pz);
    _lookTarget.set(lx, ly, lz);
    camera.lookAt(_lookTarget);
  });

  return null;
}
