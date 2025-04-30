/**
 * Main Application Module
 */
(function() {
  // Main application state
  let isInitialized = false;
  
  /**
   * Initialize the application
   */
  function init() {
    if (isInitialized) return;
    
    // Initialize theme
    ThemeManager.initTheme();
    
    // Check authentication state
    if (Auth.isAuthenticated()) {
      showMainApp();
      loadUserData();
    } else {
      showLoginPage();
    }
    
    // Setup login form
    setupLoginForm();
    
    isInitialized = true;
  }
  
  /**
   * Setup login form event handlers
   */
  function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        
        if (!username || !password) {
          if (errorEl) {
            errorEl.textContent = 'Please enter both username and password';
          }
          return;
        }
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
          loadingOverlay.classList.remove('hidden');
        }
        
        try {
          const result = await Auth.login(username, password);
          
          if (result.success) {
            showMainApp();
            loadUserData();
          } else {
            if (errorEl) {
              errorEl.textContent = result.error || 'Login failed. Please check your credentials.';
            }
          }
        } catch (error) {
          console.error('Login error:', error);
          if (errorEl) {
            errorEl.textContent = 'An unexpected error occurred. Please try again.';
          }
        } finally {
          // Hide loading overlay
          if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
          }
        }
      });
    }
  }
  
  /**
   * Show the main application UI
   */
  function showMainApp() {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    
    if (loginPage) {
      loginPage.classList.add('hidden');
    }
    
    if (mainApp) {
      mainApp.classList.remove('hidden');
    }
    
    // Initialize components
    Navigation.init();
    Sidebar.init();
    Profile.init();
  }
  
  /**
   * Show the login page
   */
  function showLoginPage() {
    const loginPage = document.getElementById('login-page');
    const mainApp = document.getElementById('main-app');
    
    if (loginPage) {
      loginPage.classList.remove('hidden');
    }
    
    if (mainApp) {
      mainApp.classList.add('hidden');
    }
  }
  
  /**
   * Load user data from GraphQL API
   */
  async function loadUserData() {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
    
    try {
      const token = Auth.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // First get basic user info to update UI quickly
      const basicInfoResult = await GraphQL.fetchUserProfile(token);
      
      if (basicInfoResult.success && basicInfoResult.data && basicInfoResult.data.user) {
        // Update user avatar with basic info
        Navigation.setupUserAvatar(basicInfoResult.data.user);
      }
      
      // Then get full profile data
      const result = await GraphQL.fetchUserProfile(token);
      
      if (result.success && result.data) {
        // Update profile display
        if (result.data.user) {
          Profile.updateProfileDisplay(result.data.user);
        }
        
        // Update visualizations with all data
        Profile.updateVisualizations(result.data);
      } else {
        throw new Error(result.error || 'Failed to load user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Show error message
      alert(`Error loading user data: ${error.message}`);
      
      // If API error is authentication related, redirect to login
      if (error.message && (
        error.message.includes('authentication') || 
        error.message.includes('authorized') || 
        error.message.includes('token')
      )) {
        Auth.logout();
      }
    } finally {
      // Hide loading overlay
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
      }
    }
  }
  
  // Initialize application when DOM is ready
  document.addEventListener('DOMContentLoaded', init);
})();