/* ── Room hotspot IDs ── */
export type HotspotId =
  | "monitor"
  | "bookshelf"
  | "whiteboard"
  | "cabinet"
  | "photoframe"
  | "phone"
  | "trophy"
  | "window";

/* ── Camera pose for zoom targets ── */
export interface CameraPose {
  position: [number, number, number];
  lookAt: [number, number, number];
}

/* ── Project ── */
export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  tags: string[];
  image?: string;
  video?: string;
  badge?: string;
  links?: { label: string; url: string }[];
  gallery?: { src: string; caption?: string }[];
  features?: { icon?: string; title: string; description: string }[];
  impacts?: { value: string; label: string }[];
  bullets?: string[];
}

/* ── Experience entry ── */
export interface ExperienceEntry {
  id: string;
  index: string;
  type: string;
  date: string;
  title: string;
  org: string;
  orgLogo: string;
  location: string;
  bullets: string[];
  chips: string[];
  accent: string;
}

/* ── Skill group ── */
export interface SkillGroup {
  icon: string;
  title: string;
  skills: string[];
}

/* ── Tech icon ── */
export interface TechIcon {
  name: string;
  url: string;
  img: string;
}

/* ── Contact method ── */
export interface ContactMethod {
  icon: string;
  title: string;
  value: string;
  href: string;
}
