import type { CameraPose, HotspotId } from "@/types";

/* Default idle camera — isometric-ish overview */
export const IDLE_POSE: CameraPose = {
  position: [9, 7, 9],
  lookAt: [0, 1.2, 0],
};

/* Per-object zoom targets */
export const HOTSPOT_POSES: Record<HotspotId, CameraPose> = {
  monitor: { position: [0.5, 3, 4], lookAt: [0, 2.5, -1] },
  bookshelf: { position: [-4, 3.5, 1], lookAt: [-5.5, 2.5, -2] },
  whiteboard: { position: [2, 4, -2], lookAt: [2, 3.5, -5] },
  cabinet: { position: [5, 2.5, 1], lookAt: [5.5, 1.5, -1] },
  photoframe: { position: [1.5, 3, 3], lookAt: [1.5, 2.6, 0] },
  phone: { position: [-1, 3, 3.5], lookAt: [-2, 2.2, 0] },
  trophy: { position: [-3.5, 4.5, 2], lookAt: [-5, 4, -1] },
  window: { position: [0, 4.5, -2], lookAt: [0, 4, -5.5] },
};

/* Room colors */
export const COLORS = {
  primary: "#84cc16",
  primaryDim: "#65a30d",
  floor: "#2a2018",
  floorLight: "#3d3028",
  wallBack: "#1a1a1e",
  wallSide: "#18181c",
  baseboard: "#111114",
  desk: "#4a3828",
  deskTop: "#5a4838",
  monitor: "#111114",
  monitorScreen: "#0f1a06",
  bookshelfWood: "#3a2818",
  whiteboard: "#e8e8e8",
  whiteboardFrame: "#555",
  cabinet: "#2a2a30",
  cabinetHandle: "#888",
  phoneBody: "#222228",
  trophyBase: "#333",
  trophyGold: "#d4a017",
  windowFrame: "#333",
  windowGlow: "#b0d8ff",
  chairSeat: "#222",
  chairLeg: "#444",
};
