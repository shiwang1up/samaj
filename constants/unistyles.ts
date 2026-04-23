import { StyleSheet } from "react-native-unistyles";

// ─────────────────────────────────────────────────────────────
// "The Architectural Sentinel" – Design System v1
// Creative North Star: Structured Fluidity
//   Deep midnight indigos × Atmospheric slate blues × Botanical accents
//   No 1px solid borders · Tonal layering · Glassmorphism · Editorial type
// ─────────────────────────────────────────────────────────────

// ─── Palette ─────────────────────────────────────────────────
const palette = {
  // Primary – deep midnight indigo
  primary: "#1d324e",
  on_primary: "#ffffff",
  primary_container: "#344966",
  on_primary_container: "#d4e4ff",

  // Secondary – atmospheric slate blue
  secondary: "#526070",
  on_secondary: "#ffffff",
  secondary_container: "#d5e4f4",
  on_secondary_container: "#0e1d2a",

  // Tertiary – grounded botanical accent
  tertiary: "#5a6332",
  on_tertiary: "#ffffff",
  tertiary_container: "#414c21",
  on_tertiary_container: "#dfe9ab",
  tertiary_fixed: "#dfe9ab",

  // Error
  error: "#ba1a1a",
  on_error: "#ffffff",
  error_container: "#ffdad6",
  on_error_container: "#410002",

  // Neutral surfaces – the "stacked vellum" hierarchy
  background: "#f6faf5",      // alias: surface
  on_background: "#181d1a",

  surface: "#f6faf5",
  on_surface: "#181d1a",

  surface_variant: "#dce5db",
  on_surface_variant: "#404942",
  outline: "#707973",
  outline_variant: "#c0c9c1",  // use at 15% opacity for ghost borders

  // Surface container tiers (low → high = deeper nesting)
  surface_container_lowest: "#ffffff",
  surface_container_low: "#f0f4ef",
  surface_container: "#eaeeed",
  surface_container_high: "#e4e9e6",
  surface_container_highest: "#dfe3e0",

  // Inverse
  inverse_surface: "#2c312e",
  inverse_on_surface: "#eef1ed",
  inverse_primary: "#aac7ff",

  // Scrim / shadow tint
  scrim: "#000000",
  shadow: "#181d1a",   // tint shadows with on_surface, NOT pure black
} as const;

// ─── Dark Palette ─────────────────────────────────────────────
const darkPalette = {
  primary: "#aac7ff",
  on_primary: "#0d2744",
  primary_container: "#263f5c",
  on_primary_container: "#d4e4ff",

  secondary: "#b9cde0",
  on_secondary: "#233340",
  secondary_container: "#394958",
  on_secondary_container: "#d5e4f4",

  tertiary: "#c4cd93",
  on_tertiary: "#2e3509",
  tertiary_container: "#444b1e",
  on_tertiary_container: "#dfe9ab",
  tertiary_fixed: "#dfe9ab",

  error: "#ffb4ab",
  on_error: "#690005",
  error_container: "#93000a",
  on_error_container: "#ffdad6",

  background: "#101510",
  on_background: "#dfe3de",

  surface: "#101510",
  on_surface: "#dfe3de",

  surface_variant: "#404942",
  on_surface_variant: "#c0c9c1",
  outline: "#8a9389",
  outline_variant: "#404942",

  surface_container_lowest: "#0b100b",
  surface_container_low: "#181d18",
  surface_container: "#1c211c",
  surface_container_high: "#262b26",
  surface_container_highest: "#313630",

  inverse_surface: "#dfe3de",
  inverse_on_surface: "#2c312c",
  inverse_primary: "#1d324e",

  scrim: "#000000",
  shadow: "#000000",
} as const;

// ─── Typography Scale ─────────────────────────────────────────
// Display / Headlines → Manrope (Corporate / Editorial)
// Body / Labels       → Public Sans (Community / Trust)
const typography = {
  fonts: {
    display: "Manrope",     // Display, Headline, Title
    body:    "PublicSans",  // Body, Label
  },

  // Sizes (sp)
  sizes: {
    display_lg:   57,
    display_md:   45,
    display_sm:   36,
    headline_lg:  32,
    headline_md:  28,
    headline_sm:  24,
    title_lg:     22,
    title_md:     16,
    title_sm:     14,
    label_lg:     14,
    label_md:     12,
    label_sm:     11,
    body_lg:      16,
    body_md:      14,
    body_sm:      12,
  },

  // Weights
  weights: {
    regular:    "400" as const,
    medium:     "500" as const,
    semibold:   "600" as const,
    bold:       "700" as const,
    extrabold:  "800" as const,
  },

  // Letter spacing – tight for display, normal for body
  tracking: {
    display: -0.02,   // em; editorial tightness
    headline: -0.01,
    title:     0,
    label:    0.006,
    body:     0.016,
  },

  // Line heights (multiplier of size)
  leading: {
    display:  1.12,
    headline: 1.20,
    title:    1.28,
    label:    1.33,
    body:     1.50,
  },
} as const;

// ─── Spacing / Gap ────────────────────────────────────────────
// Base unit = 4dp (fine-grained scale)
const gap = (v: number) => v * 4;

// Semantic spacing tokens
const spacing = {
  xs:   gap(1),   //  4
  sm:   gap(2),   //  8
  md:   gap(3),   // 12
  base: gap(4),   // 16
  lg:   gap(5),   // 20
  xl:   gap(6),   // 24
  "2xl": gap(8),  // 32
  "3xl": gap(10), // 40
  "4xl": gap(12), // 48
  "5xl": gap(16), // 64
} as const;

// ─── Border Radius ────────────────────────────────────────────
// "No hard corners" rule – minimum md; avoid xs/none on visible surfaces
const radius = {
  none:   0,
  xs:     2,    // internal chip clips only
  sm:     4,    // 0.25rem
  md:     6,    // 0.375rem – preferred minimum for cards/surfaces
  lg:     8,    // 0.5rem
  xl:     12,   // 0.75rem – buttons
  "2xl":  16,
  full:   9999, // Pills / trust badges
} as const;

// ─── Elevation / Shadow Tokens ────────────────────────────────
// Ambient-only shadows, tinted with on_surface; NO harsh box-shadows
const elevation = {
  // level 0 – flat (no shadow)
  0: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // level 1 – subtle lift (cards on surface-container-low)
  1: {
    shadowColor: "#181d1a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },
  // level 2 – standard card
  2: {
    shadowColor: "#181d1a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  // level 3 – floating (sheets, menus, FABs) – blur ≥ 32px, opacity 6%
  3: {
    shadowColor: "#181d1a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 4,
  },
  // level 4 – modal overlays
  4: {
    shadowColor: "#181d1a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 48,
    elevation: 8,
  },
} as const;

// ─── Glassmorphism Tokens ─────────────────────────────────────
// Navigation bars, modals → surface @ 80% + 24px blur
// Secondary cards         → surface_variant @ 60% + 16px blur
const glass = {
  nav: {
    // Apply as: backgroundColor: glass.nav.background, + BlurView blurAmount
    background: "rgba(246, 250, 245, 0.80)", // surface @ 80%
    blurAmount: 24,
    borderColor: "rgba(192, 201, 193, 0.15)", // outline_variant @ 15% (ghost border)
    borderWidth: 1,
  },
  card: {
    background: "rgba(220, 229, 219, 0.60)", // surface_variant @ 60%
    blurAmount: 16,
    borderColor: "rgba(192, 201, 193, 0.15)",
    borderWidth: 1,
  },
  // Dark variants
  navDark: {
    background: "rgba(16, 21, 16, 0.80)",
    blurAmount: 24,
    borderColor: "rgba(64, 73, 66, 0.15)",
    borderWidth: 1,
  },
  cardDark: {
    background: "rgba(64, 73, 66, 0.60)",
    blurAmount: 16,
    borderColor: "rgba(64, 73, 66, 0.15)",
    borderWidth: 1,
  },
} as const;

// ─── Gradient Tokens ──────────────────────────────────────────
// Flat color is the enemy of premium design.
// Hero / primary CTA → 135° from primary to primary_container
const gradients = {
  primary: {
    colors: ["#1d324e", "#344966"] as const,
    start: { x: 0, y: 0 },
    end:   { x: 1, y: 1 },   // 135°
  },
  primaryDark: {
    colors: ["#263f5c", "#aac7ff"] as const,
    start: { x: 0, y: 0 },
    end:   { x: 1, y: 1 },
  },
  surface: {
    colors: ["#f6faf5", "#f0f4ef"] as const,
    start: { x: 0, y: 0 },
    end:   { x: 0, y: 1 },
  },
} as const;

// ─── Ghost Border ─────────────────────────────────────────────
// Accessibility fallback – felt, not seen.
// outline_variant (#c0c9c1) at 15% opacity
const ghostBorder = {
  borderWidth: 1,
  borderColor: "rgba(192, 201, 193, 0.15)",
} as const;

// ─── Component Tokens ─────────────────────────────────────────
const components = {
  button: {
    // Primary – gradient fill, xl roundedness, title-sm
    primary: {
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      // gradient applied externally via gradients.primary
    },
    // Secondary – surface_container_high fill, primary text, no border
    secondary: {
      borderRadius: radius.xl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      // backgroundColor applied per-theme
    },
    // Tertiary – purely typographic, label-md, 50ms tint on hover
    tertiary: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
  },

  input: {
    // surface_container bg, no border, 2px bottom-accent on focus
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    focusedAccentWidth: 2,
  },

  card: {
    borderRadius: radius.lg,
    // Use elevation[1] or elevation[2] + surface-container-lowest bg
    // Asymmetric padding: more on left than right (trust doc §5 cards)
    paddingLeft:  spacing.xl,
    paddingRight: spacing.base,
    paddingVertical: spacing["2xl"],
  },

  // "Trust Badge" – tertiary_container bg, tertiary_fixed text, md radius
  trustBadge: {
    borderRadius: radius.md,
    paddingVertical:   spacing.xs,
    paddingHorizontal: spacing.sm,
    // backgroundColor: tertiary_container (#414c21 / dark variant)
    // color: tertiary_fixed (#dfe9ab)
  },

  // Dividers replaced by vertical white space (§5 Lists)
  listItemSpacing: spacing["2xl"], // 32dp between list items
} as const;

// ─── Animation / Motion Tokens ────────────────────────────────
const motion = {
  // Micro-interactions
  hoverTintDuration: 50,   // ms – tertiary button bg tint
  standardDuration:  200,  // ms – most state transitions
  expandDuration:    300,  // ms – sheets, modals
  easing: {
    standard:      "cubic-bezier(0.2, 0, 0, 1)",
    decelerate:    "cubic-bezier(0, 0, 0, 1)",
    accelerate:    "cubic-bezier(0.3, 0, 1, 1)",
    emphasized:    "cubic-bezier(0.2, 0, 0, 1)",
  },
} as const;

// ─── Light Theme ──────────────────────────────────────────────
const lightTheme = {
  colors: {
    // ── Primary role ──────────────────────────────
    primary:              palette.primary,
    on_primary:           palette.on_primary,
    primary_container:    palette.primary_container,
    on_primary_container: palette.on_primary_container,

    // ── Secondary role ────────────────────────────
    secondary:              palette.secondary,
    on_secondary:           palette.on_secondary,
    secondary_container:    palette.secondary_container,
    on_secondary_container: palette.on_secondary_container,

    // ── Tertiary / Botanical role ─────────────────
    tertiary:              palette.tertiary,
    on_tertiary:           palette.on_tertiary,
    tertiary_container:    palette.tertiary_container,
    on_tertiary_container: palette.on_tertiary_container,
    tertiary_fixed:        palette.tertiary_fixed,

    // ── Error ─────────────────────────────────────
    error:              palette.error,
    on_error:           palette.on_error,
    error_container:    palette.error_container,
    on_error_container: palette.on_error_container,

    // ── Surfaces (the "stacked vellum" layers) ────
    background:           palette.background,
    on_background:        palette.on_background,
    surface:              palette.surface,
    on_surface:           palette.on_surface,
    surface_variant:      palette.surface_variant,
    on_surface_variant:   palette.on_surface_variant,

    // Container tiers
    surface_container_lowest:  palette.surface_container_lowest,
    surface_container_low:     palette.surface_container_low,
    surface_container:         palette.surface_container,
    surface_container_high:    palette.surface_container_high,
    surface_container_highest: palette.surface_container_highest,

    // ── Outline ───────────────────────────────────
    outline:         palette.outline,
    outline_variant: palette.outline_variant, // use at 15% for ghost border

    // ── Inverse & Scrim ───────────────────────────
    inverse_surface:    palette.inverse_surface,
    inverse_on_surface: palette.inverse_on_surface,
    inverse_primary:    palette.inverse_primary,
    scrim:              palette.scrim,
    shadow:             palette.shadow,

    // ── Legacy / convenience aliases ─────────────
    // Kept so existing code doesn't break; map to nearest token
    typography:  palette.on_surface,
    dimmed:      palette.on_surface_variant,
    placeholder: palette.outline,
    tint:        palette.primary,
    activeTint:  palette.on_surface,
    link:        palette.primary,
    foreground:  palette.surface_container_low,
  },

  // ── Semantic sub-objects ──────────────────────────────────
  glass,
  gradients,
  ghostBorder,
  typography,
  spacing,
  radius,
  elevation,
  components,
  motion,

  // ── Gap helper (kept for BC) ──────────────────────────────
  gap,
} as const;

// ─── Dark Theme ───────────────────────────────────────────────
const darkTheme = {
  colors: {
    primary:              darkPalette.primary,
    on_primary:           darkPalette.on_primary,
    primary_container:    darkPalette.primary_container,
    on_primary_container: darkPalette.on_primary_container,

    secondary:              darkPalette.secondary,
    on_secondary:           darkPalette.on_secondary,
    secondary_container:    darkPalette.secondary_container,
    on_secondary_container: darkPalette.on_secondary_container,

    tertiary:              darkPalette.tertiary,
    on_tertiary:           darkPalette.on_tertiary,
    tertiary_container:    darkPalette.tertiary_container,
    on_tertiary_container: darkPalette.on_tertiary_container,
    tertiary_fixed:        darkPalette.tertiary_fixed,

    error:              darkPalette.error,
    on_error:           darkPalette.on_error,
    error_container:    darkPalette.error_container,
    on_error_container: darkPalette.on_error_container,

    background:         darkPalette.background,
    on_background:      darkPalette.on_background,
    surface:            darkPalette.surface,
    on_surface:         darkPalette.on_surface,
    surface_variant:    darkPalette.surface_variant,
    on_surface_variant: darkPalette.on_surface_variant,

    surface_container_lowest:  darkPalette.surface_container_lowest,
    surface_container_low:     darkPalette.surface_container_low,
    surface_container:         darkPalette.surface_container,
    surface_container_high:    darkPalette.surface_container_high,
    surface_container_highest: darkPalette.surface_container_highest,

    outline:         darkPalette.outline,
    outline_variant: darkPalette.outline_variant,

    inverse_surface:    darkPalette.inverse_surface,
    inverse_on_surface: darkPalette.inverse_on_surface,
    inverse_primary:    darkPalette.inverse_primary,
    scrim:              darkPalette.scrim,
    shadow:             darkPalette.shadow,

    // Legacy aliases
    typography:  darkPalette.on_surface,
    dimmed:      darkPalette.on_surface_variant,
    placeholder: darkPalette.outline,
    tint:        darkPalette.primary,
    activeTint:  darkPalette.on_surface,
    link:        darkPalette.primary,
    foreground:  darkPalette.surface_container_low,
  },

  glass: {
    ...glass,
    nav:  glass.navDark,
    card: glass.cardDark,
  },
  gradients: {
    ...gradients,
    primary: gradients.primaryDark,
  },
  ghostBorder: {
    borderWidth: 1,
    borderColor: "rgba(64, 73, 66, 0.15)", // outline_variant dark @ 15%
  },
  typography,
  spacing,
  radius,
  elevation: {
    ...elevation,
    // Dark mode shadows are darker
    1: { ...elevation[1], shadowColor: "#000000", shadowOpacity: 0.18 },
    2: { ...elevation[2], shadowColor: "#000000", shadowOpacity: 0.18 },
    3: { ...elevation[3], shadowColor: "#000000", shadowOpacity: 0.22 },
    4: { ...elevation[4], shadowColor: "#000000", shadowOpacity: 0.26 },
  },
  components,
  motion,
  gap,
} as const;

// ─── Theme Map & Breakpoints ──────────────────────────────────
const appThemes = {
  light: lightTheme,
  dark:  darkTheme,
};

const breakpoints = {
  xs:  0,
  sm:  300,
  md:  500,
  lg:  800,
  xl:  1200,
};

// ─── Module Augmentation ──────────────────────────────────────
type AppBreakpoints = typeof breakpoints;
type AppThemes      = typeof appThemes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes     extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// ─── Configure ───────────────────────────────────────────────
StyleSheet.configure({
  settings: {
    adaptiveThemes: true,
  },
  themes: {
    light: lightTheme,
    dark:  darkTheme,
  },
  breakpoints,
});
