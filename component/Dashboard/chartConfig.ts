/**
 * System Color Tokens
 * Centralizing these allows for easier theme management (Dark/Light mode)
 */
export const COLORS = {
    PRIMARY: '#1b273d',
    PRIMARY_HOVER: '#162031',
    SECONDARY: '#EA533c',
    SECONDARY_HOVER: '#d84a34',
    PRIMARY_LIGHT: '#3a4a6d',
    PRIMARY_LIGHTER: '#6173a1',
    PRIMARY_DARK: '#121c29',
    PRIMARY_DARKER: '#0b1420',
    PRIMARY_ACCENT: '#4a7d2a',
    SECONDARY_DARK: '#b23f2c',
    SUCCESS: '#28a745',
    WARNING: '#ffc107',
    ERROR: '#dc3545',
    ERROR_HOVER: '#c82333',
    WHITE: '#ffffff',
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#666666',
    BORDER: '#CCCCCC',
};

/**
 * Palette for bar colors
 * Using a diverse range of system colors for data visualization
 */
export const BAR_COLOR_PALETTE = [
    COLORS.PRIMARY,
    COLORS.SECONDARY,
    COLORS.SUCCESS,
    COLORS.WARNING,
    COLORS.ERROR,
    COLORS.PRIMARY_LIGHTER,
    COLORS.PRIMARY_ACCENT,
    COLORS.SECONDARY_DARK,
    COLORS.PRIMARY_LIGHT,
    COLORS.PRIMARY_DARK,
];

/**
 * Palette for hover states
 * Matches the order of BAR_COLOR_PALETTE
 */
export const BAR_HOVER_COLOR_PALETTE = [
    COLORS.PRIMARY_HOVER,
    COLORS.SECONDARY_HOVER,
    `${COLORS.SUCCESS}D0`, // Adding transparency (D0 = ~80% opacity)
    `${COLORS.WARNING}D0`,
    COLORS.ERROR_HOVER,
    `${COLORS.PRIMARY_LIGHTER}D0`,
    `${COLORS.PRIMARY_ACCENT}D0`,
    `${COLORS.SECONDARY_DARK}D0`,
    `${COLORS.PRIMARY_LIGHT}D0`,
    COLORS.PRIMARY_DARKER,
];

/**
 * Shared Font Settings
 */
export const CHART_FONTS = {
    family: "'Inter', 'Helvetica Neue', 'Arial', sans-serif",
    mainTitleSize: 18,
    axisTitleSize: 14,
    tickSize: 12,
};