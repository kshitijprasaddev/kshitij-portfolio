import { create } from "zustand";
import type { HotspotId } from "@/types";

interface RoomState {
  activePanel: HotspotId | null;
  hoveredObject: HotspotId | null;
  ready: boolean;
  setPanel: (id: HotspotId | null) => void;
  setHovered: (id: HotspotId | null) => void;
  setReady: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  activePanel: null,
  hoveredObject: null,
  ready: false,
  setPanel: (id) => set({ activePanel: id }),
  setHovered: (id) => set({ hoveredObject: id }),
  setReady: () => set({ ready: true }),
}));
