/**
 * Authentication Module
 */
const Auth = (function() {
  const { AUTH_URL } = APP_CONFIG.API;
  const { AUTH_TOKEN } = APP_CONFIG.STORAGE;
  
  /**
   * Encode credentials to Base64
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @return {string} Base64 encoded credentials
   */
  function encodeCredentials(username, password) {
    return btoa(`${username}:${password}`);
  }
  
  /**
   * Login user with provided credentials
   * @param {string} username - Username or email
   * @param {string} password - User password
   * @return {Promise} - Promise resolving to authentication result
   */
  async function login(username, password) {
    try {
      const encodedCredentials = encodeCredentials(username, password);
      
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${encodedCredentials}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed. Please check your credentials.');
      }
      
      const data = await response.json();
      console.log('Login response:', data);
     
      
      // Store the JWT token
      localStorage.setItem(AUTH_TOKEN, data);
      
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during login. Please try again.' 
      };
    }
  }
  
  /**
   * Check if user is authenticated
   * @return {boolean} Authentication status
   */
  function isAuthenticated() {
    const token = localStorage.getItem(AUTH_TOKEN);
    return !!token;
  }
  
  /**
   * Get the authentication token
   * @return {string|null} JWT token or null if not authenticated
   */
  function getToken() {
    return localStorage.getItem(AUTH_TOKEN);
  }
  
  /**
   * Logout user by removing token
   */
  function logout() {
    localStorage.removeItem(AUTH_TOKEN);
    window.location.reload();
  }
  
  // Public API
  return {
    login,
    logout,
    isAuthenticated,
    getToken
  };
})();