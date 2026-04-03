import type { SkillGroup, TechIcon } from "@/types";

export const skillGroups: SkillGroup[] = [
  {
    icon: "cog",
    title: "Robotics",
    skills: [
      "ROS 2",
      "Nav2",
      "Reinforcement Learning",
      "Control Theory",
      "CARLA",
      "Isaac Sim",
    ],
  },
  {
    icon: "code",
    title: "Programming",
    skills: ["Modern C++ (Hard Real-Time)", "Python", "Bash", "MATLAB"],
  },
  {
    icon: "radio",
    title: "Protocols & Sensors",
    skills: ["PX4", "MAVLink", "Intel RealSense", "LiDAR", "IMU"],
  },
  {
    icon: "box",
    title: "Tooling & OS",
    skills: ["Docker", "Git", "CI/CD", "JIRA", "colcon", "Ubuntu Linux"],
  },
  {
    icon: "cpu",
    title: "Hardware",
    skills: ["NVIDIA JETSON", "Raspberry Pi", "Pixhawk / PX4"],
  },
];

export const techIcons: TechIcon[] = [
  {
    name: "Python",
    url: "https://python.org",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  {
    name: "C++",
    url: "https://isocpp.org/",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  },
  {
    name: "ROS 2",
    url: "https://ros.org/",
    img: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Ros_logo.svg",
  },
  {
    name: "PyTorch",
    url: "https://pytorch.org/",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
  },
  {
    name: "Linux",
    url: "https://linux.org/",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  },
  {
    name: "Docker",
    url: "https://docker.com/",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  {
    name: "Git",
    url: "https://git-scm.com/",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  {
    name: "CMake",
    url: "https://cmake.org/",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cmake/cmake-original.svg",
  },
];

export const hardwareIcons: TechIcon[] = [
  {
    name: "NVIDIA Jetson",
    url: "https://developer.nvidia.com/embedded/jetson",
    img: "/logos/nvidia_jetson_logo.png",
  },
  {
    name: "Raspberry Pi",
    url: "https://www.raspberrypi.com/",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/raspberrypi/raspberrypi-original.svg",
  },
  {
    name: "PX4 Autopilot",
    url: "https://px4.io/",
    img: "https://avatars.githubusercontent.com/u/4684191?s=200&v=4",
  },
  {
    name: "Intel RealSense",
    url: "https://www.intelrealsense.com/",
    img: "/logos/intel-realsense.png",
  },
  {
    name: "CARLA",
    url: "https://carla.org/",
    img: "/logos/carla-logo.jpg",
  },
  {
    name: "Gazebo",
    url: "https://gazebosim.org/",
    img: "/logos/gazebo-logo.png",
  },
  {
    name: "Isaac Sim",
    url: "https://developer.nvidia.com/isaac-sim",
    img: "/logos/isaac-sim-logo.jpg",
  },
  {
    name: "MATLAB",
    url: "https://www.mathworks.com/products/matlab.html",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/matlab/matlab-original.svg",
  },
];
