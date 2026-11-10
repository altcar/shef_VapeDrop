import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 22, ...props }: IconProps) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconHome = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20a1 1 0 0 0 1 1h3.5v-5.5h4V21h3.5a1 1 0 0 0 1-1V9.5" />
  </svg>
);

export const IconMap = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m9 3 6 2.5 5.3-1.8a.6.6 0 0 1 .7.6v14l-6 2.2-6-2.5-5.3 2a.6.6 0 0 1-.7-.6v-14L9 3Z" />
    <path d="M9 3v15.5M15 5.5V21" />
  </svg>
);

export const IconRecycle = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m7 19-2.5-4.3a1.4 1.4 0 0 1 .5-1.9l1.6-.9" />
    <path d="m10.6 5.2 1.7-.6a1.4 1.4 0 0 1 1.8.9l.6 1.7" />
    <path d="M17.5 9.4 20 13a1.4 1.4 0 0 1-.5 1.9l-1.7 1" />
    <path d="m3.6 12.4 1.6-1M8.6 3.9l.5 1.8M17 17.5l1.4 1.9M12.6 20.5h2.6" />
  </svg>
);

export const IconGift = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 11.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5Z" />
    <path d="M3 8.5h18V11H3zM12 8.5V21" />
    <path d="M12 8.5S10.5 3 7.8 3.5 7 8.5 12 8.5Zm0 0S13.5 3 16.2 3.5 17 8.5 12 8.5Z" />
  </svg>
);

export const IconUser = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.5c.8-3.4 3.8-5.6 7.5-5.6s6.7 2.2 7.5 5.6" />
  </svg>
);

export const IconArrowLeft = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export const IconChevronRight = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const IconNavigation = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m3.5 11 17-7.5-7.5 17-2.2-7.3L3.5 11Z" />
  </svg>
);

export const IconClock = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconMapPin = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const IconLeaf = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 20c0-8 5.5-14 16-14 0 9-5 14-11.5 14H4Z" />
    <path d="M4.5 20c2-4.5 5-7.5 9.5-9.5" />
  </svg>
);

export const IconShield = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </svg>
);

export const IconQr = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="6" height="6" rx="1.2" />
    <rect x="14.5" y="3.5" width="6" height="6" rx="1.2" />
    <rect x="3.5" y="14.5" width="6" height="6" rx="1.2" />
    <path d="M14.5 14.5h2.5v2.5h-2.5zM20.5 14.5v6h-6" />
  </svg>
);

export const IconInfo = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8v.4" />
  </svg>
);

export const IconCheck = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export const IconAlert = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 4 2.8 20h18.4L12 4Z" />
    <path d="M12 9.5v5M12 17.2v.3" />
  </svg>
);

export const IconSearch = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </svg>
);

export const IconLocate = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="6.5" />
    <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSparkles = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="M18.5 16.5 19.4 19l2.5.9-2.5.9-.9 2.5" transform="translate(0,-2.5)" />
  </svg>
);

export const IconCamera = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 8.5h2.6L8 6h8l1.4 2.5H20a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.4" />
  </svg>
);

export const IconExternal = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 14.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4.5" />
  </svg>
);

export const IconBattery = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="2.5" y="8" width="16" height="8" rx="2.2" />
    <path d="M21 11v2" />
    <path d="M6 11v2M9.5 11v2M13 11v2" />
  </svg>
);

export const IconRoute = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="6" cy="18" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <path d="M8.5 18H14a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h5.5" />
  </svg>
);

export const IconPlus = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconLogout = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h3" />
    <path d="M15 8l4 4-4 4M19 12H9" />
  </svg>
);

export const IconTrophy = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
    <path d="M8 5.5H4.5V7A3.5 3.5 0 0 0 8 10.5M16 5.5h3.5V7A3.5 3.5 0 0 1 16 10.5" />
    <path d="M12 13v3.5M9 20h6M10 20l.5-3.5h3l.5 3.5" />
  </svg>
);

export const IconTrash = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </svg>
);

export const IconX = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const iconByName = {
  home: IconHome,
  map: IconMap,
  recycle: IconRecycle,
  gift: IconGift,
  user: IconUser,
} as const;
