import type { Project } from "@/types";

export const thesisProject: Project = {
  id: "thesis",
  title: "Autonomous Precision Landing via Deep Reinforcement Learning",
  subtitle:
    "AKKODIS | Abschlussarbeit, Autonomous Aerial Systems | Ingolstadt, Bavaria | Oct 2025 - Mar 2026",
  badge: "Thesis / Graded 1.0",
  description:
    "Trained PPO, SAC, and TD3 agents to land a multirotor drone on a moving platform. Built the full pipeline: custom Gym environments in Isaac Sim and Gazebo, PX4 SITL integration, reward shaping, domain randomization. Then tested on a real Pixhawk drone. The sim-to-real transfer working was the best part of the thesis.",
  tags: [
    "PPO/SAC/TD3",
    "PX4 SITL",
    "Isaac Sim",
    "Gazebo",
    "MAVLink",
    "MAVSDK",
    "Python",
    "C++",
    "Docker",
  ],
  bullets: [
    "PPO and SAC models converged",
    "PPO shows higher landing reliability",
    "Control Barrier Functions implemented",
    "Real drone testing",
  ],
};

export const projects: Project[] = [
  {
    id: "av-orchestrator",
    title: "Autonomous Mobility Orchestrator",
    description:
      "Won 1st place at PAVE Europe 2025. RL-based fleet optimizer for city-wide autonomous mobility.",
    tags: ["PPO", "Next.js", "TomTom API"],
    badge: "Live Demo",
    image: "/media/av_orchestrator_map.jpg",
    links: [{ label: "Launch Demo", url: "https://pave-av.vercel.app/" }],
    features: [
      {
        title: "Traffic Analysis",
        description: "Real corridor congestion data from TomTom APIs",
      },
      {
        title: "RL Policy Studio",
        description: "PPO-based optimizer for fleet management",
      },
      {
        title: "Real-Time Metrics",
        description: "Live updates on fleet performance",
      },
      {
        title: "INVG Comparison",
        description: "Analysis with current transit fleet",
      },
    ],
    impacts: [
      { value: "56%", label: "Fewer Vehicles" },
      { value: "+20%", label: "More Riders" },
      { value: "30%", label: "Less Distance" },
      { value: "€840M", label: "10yr Savings" },
    ],
    gallery: [
      { src: "/media/pave_speaking.jpg", caption: "Presenting at PAVE Europe" },
      { src: "/media/pave_speakers.jpg", caption: "PAVE Europe Conference 2025" },
    ],
  },
  {
    id: "project1",
    title: "Schanzer Racing Electric",
    description:
      "Driverless department: LiDAR perception, embedded control on NVIDIA Jetson",
    tags: ["LiDAR", "ROS2", "Autonomy"],
    image: "/media/schanzer_logo.png",
    video: "/media/schanzer_racing.mp4",
    links: [
      { label: "Visit Team Website", url: "https://schanzer-racing.de/" },
    ],
    bullets: [
      "Integrated LiDAR sensors for real-time obstacle detection",
      "Developed differential drive control algorithms",
      "Managed technical budgeting for components",
      "Collaborated on system integration",
    ],
    gallery: [
      { src: "/media/schanzer_racing.jpeg" },
      { src: "/media/schanzer_racing2.jpeg" },
      { src: "/media/schanzer_racing3.jpeg" },
      { src: "/media/schanzer_racing4.jpeg" },
    ],
  },
  {
    id: "akkodis",
    title: "Akkodis Service Robot",
    description:
      "TurtleBot3 + RealSense + YOLO. It finds things and picks them up.",
    tags: ["ROS2", "YOLO", "RealSense"],
    image: "/media/rviz_turtlebot.png",
    video: "/media/tb3_demo.mp4",
    bullets: [
      "Distributed ROS2: Pi 5 (Jazzy) + Workstation (Humble)",
      "Custom ZeroMQ Bridge: Camera data + YOLO inference",
      "Eclipse Cyclone DDS: Low-latency operation",
      "3D Perception: RealSense D405 depth camera",
    ],
  },
  {
    id: "pixhawk",
    title: "Pixhawk Drone Platform",
    description:
      "Custom-built for my thesis. PX4 flight controller, real-world RL testing.",
    tags: ["PX4", "Pixhawk", "UAV"],
    image: "/media/pixhawk_drone.jpg",
    video: "/media/pixhawk_drone.mp4",
    bullets: [
      "Flight Controller: Pixhawk 4 running PX4",
      "Application: Precision landing research",
      "Status: Hardware assembly complete",
      "Next: Real-world RL policy testing",
    ],
  },
  {
    id: "campus-help",
    title: "Campus Help",
    description:
      "THI had no good way for students to find tutors. So I built one.",
    tags: ["Next.js", "Supabase", "TypeScript"],
    image: "/logos/THI-logo.png",
    links: [
      { label: "Visit Website", url: "https://campus-help-lime.vercel.app/" },
    ],
    bullets: [
      "Tutor Directory: Browse verified campus tutors with courses, rates, and availability",
      "Request System: Post what you need help with, set your budget, receive bids",
      "Live Calendar: See tutor availability in real-time, book slots instantly",
      "Role Switching: Students can also become tutors with one click",
      "Emergency Sessions: Priority slots for last-minute exam help",
    ],
  },
  {
    id: "project2",
    title: "Pixel Park",
    description:
      "24-hour hackathon. LiDAR-based parking detection, built overnight.",
    tags: ["LiDAR", "Python", "Hackathon"],
    video: "/media/pixel_park.mp4",
    bullets: [
      "Real-time LiDAR-based parking spot detection",
      "Occupancy tracking and availability prediction",
      "Integration-ready API for navigation apps",
    ],
  },
  {
    id: "vr-dekra",
    title: "VR Accident Reconstruction",
    description:
      "3D laser scans + dashcam footage to forensic VR reconstruction for DEKRA",
    tags: ["IPG CarMaker", "CARLA", "VR"],
    image: "/dekra/vr-dekra-1.jpg",
    bullets: [
      "3D Scene Capture: Acquired point cloud data with FARO Focus Core laser scanner",
      "Simulation Pipeline: Imported scanned 3D environments into IPG CarMaker",
      "Vehicle Integration: Added Skoda Octavia model with dashcam perspective",
      "Geo-Alignment: Aligned virtual scenario with real-world coordinates via OpenStreetMap",
      "CARLA Digital Twin: Explored open-source CARLA simulator as alternative",
    ],
    gallery: [
      { src: "/dekra/dekra-2.jpg", caption: "3D Laser-Scanned Scene" },
      { src: "/dekra/dekra-3.jpg", caption: "Simulation Environment" },
    ],
  },
  {
    id: "airbus-fyi",
    title: "Airbus Fly Your Ideas",
    description:
      "Global aerospace challenge by Airbus & UNESCO. Team entry, currently in progress.",
    tags: ["Aerospace", "Innovation", "Airbus"],
    image: "/logos/airbus-fly-your-ideas.jpg",
    links: [
      { label: "View Our MVP", url: "https://aero-xrl.vercel.app/" },
      {
        label: "About the Challenge",
        url: "https://www.airbus.com/en/airbus-fly-your-ideas",
      },
    ],
  },
];
