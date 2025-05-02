document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileDropdown = document.querySelector('.mobile-dropdown');
    const mobileNavLinks = document.querySelectorAll('.mobile-dropdown .nav-link');
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
  
    // Function to toggle the mobile dropdown menu
    function toggleMobileMenu() {
      if (hamburgerMenu && mobileDropdown) {
        hamburgerMenu.classList.toggle('active');
        mobileDropdown.classList.toggle('active');
      }
    }
  
    // Toggle dropdown when hamburger is clicked
    if (hamburgerMenu && mobileDropdown) {
      hamburgerMenu.addEventListener('click', function (e) {
        e.preventDefault();
        toggleMobileMenu();
      });
    }
  
    // Close dropdown when clicking outside
    document.addEventListener('click', function (event) {
      if (
        hamburgerMenu &&
        mobileDropdown &&
        !hamburgerMenu.contains(event.target) &&
        !mobileDropdown.contains(event.target)
      ) {
        hamburgerMenu.classList.remove('active');
        mobileDropdown.classList.remove('active');
      }
    });
  
    // Handle navigation in mobile dropdown
    if (mobileNavLinks && mobileNavLinks.length > 0) {
      mobileNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
          const sectionId = this.getAttribute('data-section');
          if (!sectionId) return;
  
          // Toggle the active class on the nav links
          mobileNavLinks.forEach(navLink => navLink.classList.remove('active'));
          this.classList.add('active');
  
          // Get all content sections
          const contentSections = document.querySelectorAll('.content-section');
  
          contentSections.forEach(section => section.classList.remove('active'));
  
          const targetSection = document.getElementById(`${sectionId}-section`);
          if (targetSection) {
            targetSection.classList.add('active');
          }
  
          // Close the mobile menu
          toggleMobileMenu();
        });
      });
    }
  
    // Sync the active state between mobile and desktop navigation
    if (sidebarLinks && sidebarLinks.length > 0) {
      sidebarLinks.forEach(link => {
        link.addEventListener('click', function () {
          const sectionId = this.getAttribute('data-section');
          if (!sectionId) return;
  
          mobileNavLinks.forEach(navLink => {
            if (navLink.getAttribute('data-section') === sectionId) {
              navLink.classList.add('active');
            } else {
              navLink.classList.remove('active');
            }
          });
        });
      });
    }
  
    // Handle window resize - reset menu if screen size changes
    window.addEventListener('resize', function () {
      const windowWidth = window.innerWidth;
      if (windowWidth > 992) {
        if (hamburgerMenu && mobileDropdown) {
          hamburgerMenu.classList.remove('active');
          mobileDropdown.classList.remove('active');
        }
      }
    });
  });
  