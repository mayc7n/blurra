import { darkTheme, lightTheme } from "./theme";

describe("Blurra theme", () => {
  it("exposes semantic colors, spacing, and touch targets", () => {
    for (const theme of [lightTheme, darkTheme]) {
      expect(theme.colors.background).toMatch(/^#/);
      expect(theme.colors.foreground).toMatch(/^#/);
      expect(theme.colors.accent).toMatch(/^#/);
      expect(theme.colors.danger).toMatch(/^#/);
      expect(theme.colors.border).toMatch(/^#/);
      expect(theme.spacing.md).toBeGreaterThan(0);
      expect(theme.minTouchTarget).toBeGreaterThanOrEqual(44);
    }
  });
});
