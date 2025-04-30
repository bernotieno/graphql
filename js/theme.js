/**
 * Theme Manager Module
 */
const ThemeManager = (function() {
  const { USER_THEME } = APP_CONFIG.STORAGE;
  const { DEFAULT_THEME } = APP_CONFIG;
  
  /**
   * Get the current theme
   * @return {string} Current theme ('light' or 'dark')
   */
  function getCurrentTheme() {
    return localStorage.getItem(USER_THEME) || DEFAULT_THEME;
  }
  
  /**
   * Apply theme to document
   * @param {string} theme - Theme to apply ('light' or 'dark')
   */
  function applyTheme(theme) {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem(USER_THEME, theme);
  }
  
  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  }
  
  /**
   * Initialize theme based on user preference or system preference
   */
  function initTheme() {
    const savedTheme = localStorage.getItem(USER_THEME);
    
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDarkMode ? 'dark' : 'light';
      applyTheme(initialTheme);
    }
  }
  
  // Public API
  return {
    initTheme,
    toggleTheme,
    getCurrentTheme,
    applyTheme
  };
})();