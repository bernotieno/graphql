/**
 * Sidebar Component
 */
const Sidebar = (function() {
  let isCollapsed = false;
  
  /**
   * Initialize sidebar
   */
  function init() {
    setupEventListeners();
  }
  
  /**
   * Setup event listeners for sidebar elements
   */
  function setupEventListeners() {
    const toggleButton = document.getElementById('sidebar-toggle');
    
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleSidebar);
      
      // Create toggle icon
      toggleButton.innerHTML = createToggleIcon();
    }
    
    // Add responsiveness for small screens
    window.addEventListener('resize', handleResize);
    handleResize();
  }
  
  /**
   * Create toggle icon SVG
   * @return {string} SVG markup for toggle icon
   */
  function createToggleIcon() {
    return `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    `;
  }
  
  /**
   * Toggle sidebar collapsed state
   */
  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    
    isCollapsed = !isCollapsed;
    
    if (sidebar) {
      if (isCollapsed) {
        sidebar.classList.add('collapsed');
        
        // Hide text in nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.style.justifyContent = 'center';
          link.textContent = '';
          
          // Add icon based on section
          const section = link.getAttribute('data-section');
          link.innerHTML = getSectionIcon(section);
        });
        
        // Rotate toggle icon
        if (toggleButton) {
          toggleButton.style.transform = 'rotate(180deg)';
        }
      } else {
        sidebar.classList.remove('collapsed');
        
        // Restore text in nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.style.justifyContent = 'flex-start';
          
          const section = link.getAttribute('data-section');
          link.innerHTML = `${getSectionIcon(section)} ${capitalizeFirstLetter(section)}`;
        });
        
        // Reset toggle icon rotation
        if (toggleButton) {
          toggleButton.style.transform = 'rotate(0)';
        }
      }
    }
  }
  
  /**
   * Get icon for navigation section
   * @param {string} section - Section ID
   * @return {string} SVG icon markup
   */
  function getSectionIcon(section) {
    const icons = {
      dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
      profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      statistics: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
    };
    
    return icons[section] || '';
  }
  
  /**
   * Capitalize first letter of a string
   * @param {string} string - String to capitalize
   * @return {string} Capitalized string
   */
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  
  /**
   * Handle window resize event for responsive design
   */
  function handleResize() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('sidebar-toggle');
    
    if (window.innerWidth < 768) {
      // On small screens, hide toggle button and make sidebar horizontal
      if (toggleButton) {
        toggleButton.style.display = 'none';
      }
      
      if (sidebar) {
        sidebar.classList.remove('collapsed');
        
        // Restore text in nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.style.justifyContent = 'center';
          
          const section = link.getAttribute('data-section');
          link.innerHTML = getSectionIcon(section);
          
          // Add tooltip for small screens
          link.title = capitalizeFirstLetter(section);
        });
      }
    } else {
      // On larger screens, show toggle button
      if (toggleButton) {
        toggleButton.style.display = 'flex';
      }
      
      // Apply current collapsed state
      if (sidebar && isCollapsed) {
        toggleSidebar();
      }
    }
  }
  
  // Public API
  return {
    init,
    toggleSidebar
  };
})();