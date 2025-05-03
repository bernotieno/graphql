/**
 * Application Configuration
 */
const APP_CONFIG = {
  // API endpoints
  API: {
    // Replace placeholder with your actual domain
    DOMAIN: "learn.zone01kisumu.ke", // This would be replaced with the actual domain
    AUTH_URL: "https://learn.zone01kisumu.ke/api/auth/signin", // Replace with actual domain
    GRAPHQL_URL: "https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql", // Replace with actual domain
  },
  
  // Local storage keys
  STORAGE: {
    AUTH_TOKEN: "user_jwt_token",
    USER_THEME: "user_theme",
  },
  
  // Default theme
  DEFAULT_THEME: "light",
  
  // Navigation sections
  SECTIONS: ["dashboard", "profile", "statistics"],
  
  // Debounce delay for search inputs (in milliseconds)
  DEBOUNCE_DELAY: 300,
  
  // Chart colors that match theme variables
  CHART_COLORS: [
    "var(--chart-color-1)",
    "var(--chart-color-2)",
    "var(--chart-color-3)",
    "var(--chart-color-4)",
    "var(--chart-color-5)",
  ],
  
};