export type ColorTokens = {
  background: string;
  surface: string;
  surfaceRaised: string;
  foreground: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
  danger: string;
  scrim: string;
};

export type AppTheme = {
  colors: ColorTokens;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  minTouchTarget: number;
};

const shared = {
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 12, md: 18, lg: 28, pill: 999 },
  minTouchTarget: 44,
} as const;

export const lightTheme: AppTheme = {
  ...shared,
  colors: {
    background: "#F5F2EE",
    surface: "#FFFCF8",
    surfaceRaised: "#FFFFFF",
    foreground: "#17181C",
    muted: "#74747D",
    accent: "#FF7058",
    accentSoft: "#FFE0D9",
    border: "#E6E0D9",
    danger: "#C74646",
    scrim: "rgba(11, 12, 15, 0.56)",
  },
};

export const darkTheme: AppTheme = {
  ...shared,
  colors: {
    background: "#101114",
    surface: "#18191E",
    surfaceRaised: "#222329",
    foreground: "#F6F3EF",
    muted: "#A5A3AA",
    accent: "#FF8973",
    accentSoft: "#4A2722",
    border: "#303139",
    danger: "#FF817A",
    scrim: "rgba(0, 0, 0, 0.7)",
  },
};
