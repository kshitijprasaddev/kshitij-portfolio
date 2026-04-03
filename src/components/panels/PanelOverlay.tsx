"use client";

import { AnimatePresence } from "framer-motion";
import { useRoomStore } from "@/hooks/useRoomStore";
import ProjectsPanel from "./ProjectsPanel";
import ExperiencePanel from "./ExperiencePanel";
import SkillsPanel from "./SkillsPanel";
import ResumePanel from "./ResumePanel";
import AboutPanel from "./AboutPanel";
import ContactPanel from "./ContactPanel";
import AchievementPanel from "./AchievementPanel";
import VisionPanel from "./VisionPanel";

const panelMap: Record<string, React.ComponentType> = {
  monitor: ProjectsPanel,
  bookshelf: ExperiencePanel,
  whiteboard: SkillsPanel,
  cabinet: ResumePanel,
  photoframe: AboutPanel,
  phone: ContactPanel,
  trophy: AchievementPanel,
  window: VisionPanel,
};

export default function PanelOverlay() {
  const activePanel = useRoomStore((s) => s.activePanel);
  const Panel = activePanel ? panelMap[activePanel] : null;

  return (
    <AnimatePresence mode="wait">
      {Panel && activePanel && <Panel key={activePanel} />}
    </AnimatePresence>
  );
}
