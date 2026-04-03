import type { ContactMethod } from "@/types";

/* ── About Me ── */
export const about = {
  lead: "Autonomous Vehicle Engineering at TH Ingolstadt, driven by addressing the 1.35 million lives lost and 70 billion hours wasted in traffic annually.",
  body: 'Strong in modern C++, ROS 2, and real-time control loops. Thesis on RL-based precision drone landing, graded 1.0. Deep passion for open-source tooling and democratizing industrial robotics.',
  location: "Ingolstadt, Germany",
  education: "B.Eng. AV Engineering / M.Sc. AI Engineering",
  status: "M.Sc. started March 2026",
  belief:
    "Most of my work starts in simulation and ends on real hardware. Closing that gap is what I find most interesting about this field.",
  focusAreas: [
    "Reinforcement Learning",
    "Autonomous Drones",
    "ROS2 Development",
    "Computer Vision",
  ],
  languages: ["English (Native)", "German (B2/C1)"],
  headshot: "/media/headshot.jpg",
};

/* ── Achievement ── */
export const achievement = {
  title: "1st Place at PAVE Europe",
  subtitle:
    "Won first place at the PAVE Europe 2025 Student Competition for presenting innovative solutions in autonomous vehicle technology and public acceptance.",
  paveUrl: "https://pavecampaign.org/",
  gallery: [
    {
      src: "/media/kshitij-winning-award-PAVE.jpg",
      caption: "Receiving the 1st Place Award",
      featured: true,
    },
    {
      src: "/media/kshitij-speaking.jpg",
      caption: "Panel Discussion",
    },
    {
      src: "/media/kshitij-speaking-2.jpg",
      caption: "Keynote Presentation",
    },
  ],
};

/* ── Contact ── */
export const contactMethods: ContactMethod[] = [
  {
    icon: "mail",
    title: "Email",
    value: "kshitijp21@gmail.com",
    href: "mailto:kshitijp21@gmail.com",
  },
  {
    icon: "linkedin",
    title: "LinkedIn",
    value: "linkedin.com/in/kshitijp21",
    href: "https://www.linkedin.com/in/kshitijp21/",
  },
  {
    icon: "phone",
    title: "Phone",
    value: "+49 176 20072984",
    href: "tel:+4917620072984",
  },
  {
    icon: "calendar",
    title: "Schedule a Meeting",
    value: "Book a 30-minute video call",
    href: "https://calendly.com/kshitijp21/30min",
  },
];

/* ── Vision (Window section) ── */
export const vision = {
  title: "Where I'm Headed",
  paragraphs: [
    "In five years, I want to be leading a team that builds autonomous systems operating in the real world, not just in simulation. Drones that deliver, robots that assist, vehicles that drive.",
    "My passion is closing the sim-to-real gap. I believe the next leap in robotics comes from making RL policies that transfer reliably to hardware, and from open-source tools that let smaller teams compete with large labs.",
    "Long-term, I want to contribute to democratizing industrial robotics so that a startup in Ingolstadt has the same tools as a research lab in Mountain View.",
  ],
};

/* ── Recommendation ── */
export const recommendation = {
  title: "Recommendation Letter",
  author: "Prof. Dr.-Ing. Michael Mecking",
  role: "Dean, Faculty of Electrical & Information Engineering",
  org: "Technische Hochschule Ingolstadt",
  image: "/media/professor-mecking-recommendation.jpg",
};

/* ── Logo marquee ── */
export const logos = [
  { src: "/logos/akkodis-logo.png", alt: "Akkodis" },
  { src: "/logos/THI-logo.png", alt: "TH Ingolstadt" },
  { src: "/logos/Audi-Logo.png", alt: "Audi" },
  { src: "/logos/schanzer-racing.png", alt: "Schanzer Racing" },
  { src: "/logos/carissma-logo.jpg", alt: "CARISSMA" },
  { src: "/logos/carla-logo.jpg", alt: "CARLA" },
  { src: "/logos/gazebo-logo.png", alt: "Gazebo" },
  { src: "/logos/isaac-sim-logo.jpg", alt: "Isaac Sim" },
  { src: "/logos/ipgcarmaker-logo.png", alt: "IPG CarMaker" },
];
