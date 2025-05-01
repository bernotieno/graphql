/**
 * Profile Component
 */
const Profile = (function() {
  let userData = null;
  
  /**
   * Initialize profile component
   */
  function init() {
    setupEventListeners();
  }
  
  /**
   * Setup event listeners for profile elements
   */
  function setupEventListeners() {
    const editToggle = document.getElementById('edit-profile-toggle');
    const cancelEdit = document.getElementById('cancel-edit');
    const editForm = document.getElementById('profile-edit-form');
    
    if (editToggle) {
      editToggle.addEventListener('click', toggleEditMode);
    }
    
    if (cancelEdit) {
      cancelEdit.addEventListener('click', cancelEditMode);
    }
    
    if (editForm) {
      editForm.addEventListener('submit', handleProfileUpdate);
    }
  }
  
  /**
   * Toggle profile edit mode
   */
  function toggleEditMode() {
    const displayEl = document.getElementById('profile-display');
    const formEl = document.getElementById('profile-edit-form');
    
    if (displayEl && formEl) {
      displayEl.classList.add('hidden');
      formEl.classList.remove('hidden');
      
      // Pre-populate form with current values
      if (userData && userData.attrs) {
        const displayNameInput = document.getElementById('display-name');
        const emailInput = document.getElementById('email');
        const bioInput = document.getElementById('bio');
        
        if (displayNameInput && userData.attrs.displayName) {
          displayNameInput.value = userData.attrs.displayName;
        }
        
        if (emailInput && userData.attrs.email) {
          emailInput.value = userData.attrs.email;
        }
        
        if (bioInput && userData.attrs.bio) {
          bioInput.value = userData.attrs.bio;
        }
      }
    }
  }
  
  /**
   * Cancel profile edit mode
   */
  function cancelEditMode() {
    const displayEl = document.getElementById('profile-display');
    const formEl = document.getElementById('profile-edit-form');
    
    if (displayEl && formEl) {
      displayEl.classList.remove('hidden');
      formEl.classList.add('hidden');
    }
  }
  
  /**
   * Handle profile update form submission
   * @param {Event} e - Form submit event
   */
  async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const displayName = document.getElementById('display-name').value;
    const email = document.getElementById('email').value;
    const bio = document.getElementById('bio').value;
    
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
    }
    
    // Create updated attrs object
    const updatedAttrs = {
      ...userData.attrs,
      displayName,
      email,
      bio,
      updatedAt: new Date().toISOString()
    };
    
    // Update using GraphQL
    const token = Auth.getToken();
    const result = await GraphQL.updateUserAttributes(token, updatedAttrs);
    
    // Hide loading overlay
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
    
    if (result.success) {
      // Update local userData
      userData.attrs = updatedAttrs;
      
      // Update displayed profile
      updateProfileDisplay(userData);
      
      // Switch back to display mode
      cancelEditMode();
    } else {
      // Show error message
      alert(`Failed to update profile: ${result.error}`);
    }
  }
  
  /**
   * Update profile with user data
   * @param {Object} data - User data from GraphQL
   */
  function updateProfileDisplay(data) {
    userData = data;
    console.log(data)
    
    const profileDisplay = document.getElementById('profile-display');
    if (!profileDisplay) return;
    
    // Clear loading text
    profileDisplay.innerHTML = '';
    
    // Create profile display grid
    const displayGrid = document.createElement('div');
    displayGrid.className = 'profile-display-grid';
    
    // Login/Username
    const loginItem = createProfileItem('Username', data[0].login);
    displayGrid.appendChild(loginItem);
    
    // User ID
    const userIdItem = createProfileItem('User ID', data[0].id);
    displayGrid.appendChild(userIdItem);
    
    // Display Name
    const displayName = data[0].attrs && data[0].attrs.firstName ? data[0].attrs.lastName : '-';
    const displayNameItem = createProfileItem('Display Name', displayName);
    displayGrid.appendChild(displayNameItem);
    
    // Email
    const email = data[0].attrs && data[0].attrs.email ? data[0].attrs.email : '-';
    const emailItem = createProfileItem('Email', email);
    displayGrid.appendChild(emailItem);
    
    // Audit Ratio
    const auditRatio = data[0].auditRatio !== undefined ? data[0].auditRatio.toFixed(1) : '-';
    const auditRatioItem = createProfileItem('Audit Ratio', auditRatio);
    displayGrid.appendChild(auditRatioItem);
    
    // Bio
    const bio = document.createElement('div');
    bio.className = 'profile-item';
    bio.style.gridColumn = '1 / -1'; // Span all columns
    
    const bioTitle = document.createElement('h4');
    bioTitle.textContent = 'Bio';
    bio.appendChild(bioTitle);
    
    const bioContent = document.createElement('p');
    bioContent.textContent = data[0].attrs && data[0].attrs.bio ? data[0].attrs.bio : 'No bio available.';
    bio.appendChild(bioContent);
    
    displayGrid.appendChild(bio);
    
    profileDisplay.appendChild(displayGrid);
    
    // Update user avatar in navigation
    Navigation.setupUserAvatar(data);
  }
  
  /**
   * Create a profile display item
   * @param {string} label - Item label
   * @param {string} value - Item value
   * @return {HTMLElement} Profile item element
   */
  function createProfileItem(label, value) {
    const item = document.createElement('div');
    item.className = 'profile-item';
    
    const title = document.createElement('h4');
    title.textContent = label;
    item.appendChild(title);
    
    const content = document.createElement('p');
    content.textContent = value;
    item.appendChild(content);
    
    return item;
  }
  
  /**
   * Update skills display
   * @param {Array} skills - User skills data
   */
  function updateSkillsDisplay(skills) {
    const skillsChart = document.getElementById('skills-chart');
    if (!skillsChart) return;
    
    // Transform data for chart
    const chartData = skills.slice(0, 5).map(skill => {
      return {
        name: formatSkillName(skill.type),
        value: skill.amount
      };
    });
    
    // Create chart
    Charts.createBarChart('skills-chart', chartData, {
      barColor: (d, i) => APP_CONFIG.CHART_COLORS[i % APP_CONFIG.CHART_COLORS.length]
    });
  }
  
  /**
   * Update recent activity display
   * @param {Object} data - User data with transactions
   */
  function updateRecentActivity(data) {
    const activityEl = document.getElementById('recent-activity');
    if (!activityEl) return;
    
    // Clear loading text
    activityEl.innerHTML = '';
    
    // Get transactions
    const transactions = data.transaction || [];
    
    if (transactions.length === 0) {
      const noActivity = document.createElement('p');
      noActivity.textContent = 'No recent activity available.';
      activityEl.appendChild(noActivity);
      return;
    }
    
    // Create activity list
    const activityList = document.createElement('ul');
    activityList.className = 'activity-list';
    
    // Add activity items
    transactions.slice(0, 5).forEach(transaction => {
      const item = document.createElement('li');
      item.className = 'activity-item';
      
      const title = document.createElement('div');
      title.textContent = formatTransactionType(transaction.type);
      title.className = 'activity-title';
      
      const date = document.createElement('div');
      date.textContent = formatDate(transaction.createdAt);
      date.className = 'activity-date';
      
      item.appendChild(title);
      item.appendChild(date);
      activityList.appendChild(item);
    });
    
    activityEl.appendChild(activityList);
  }
  
  /**
   * Update user overview display
   * @param {Object} data - User data
   */
  function updateUserOverview(data) {
    console.log("this data:",data)
    const overviewEl = document.getElementById('user-overview');
    if (!overviewEl) return;
    
    // Clear loading text
    overviewEl.innerHTML = '';
    
    // Create overview content
    const content = document.createElement('div');
    
    // Login info
    const loginInfo = document.createElement('p');
    loginInfo.innerHTML = `<strong>Login:</strong> ${data.user[0].login}`;
    content.appendChild(loginInfo);
    
    // Audit ratio
    const auditRatio = document.createElement('p');
    auditRatio.innerHTML = `<strong>Audit Ratio:</strong> ${data.user[0].auditRatio ? data.user[0].auditRatio.toFixed(1) : 'N/A'}`;
    content.appendChild(auditRatio);
    
    // Events
    const events = data.events || [];
    const eventsInfo = document.createElement('p');
    eventsInfo.innerHTML = `<strong>Current Level:</strong> ${data.user[0].events[0].level}`;
    content.appendChild(eventsInfo);
    
    // Skills count
    const skills = data.user[0].skills || [];
    const uniqueSkillTypes = new Set(skills.map(skill => skill.type));
    const skillsInfo = document.createElement('p');
    skillsInfo.innerHTML = `<strong>Skills:</strong> ${uniqueSkillTypes.size}`;
    content.appendChild(skillsInfo);

    
    overviewEl.appendChild(content);
  }
  
  /**
   * Update the progress timeline chart
   * @param {Object} data - User data with progress information
   */
  function updateProgressTimeline(data) {
    const timelineEl = document.getElementById('progress-timeline');
    if (!timelineEl) return;
    
    const progress = data.progress || [];
    
    if (progress.length === 0) {
      timelineEl.innerHTML = '<p>No progress data available.</p>';
      return;
    }
    
    // Transform data for chart
    const chartData = progress.slice(0, 10).map(p => {
      return {
        x: formatDate(p.createdAt, true),
        y: p.grade || 0
      };
    });
    
    // Sort by date
    chartData.sort((a, b) => new Date(a.x) - new Date(b.x));
    
    // Create chart
    Charts.createLineChart('progress-timeline', chartData, {
      showArea: true,
      lineColor: APP_CONFIG.CHART_COLORS[0],
      pointColor: APP_CONFIG.CHART_COLORS[0]
    });
  }
  
  /**
   * Update audit ratio chart
   * @param {Object} data - User data with audit ratio
   */
  function updateAuditRatioChart(data) {
    const chartEl = document.getElementById('audit-ratio-chart');
    if (!chartEl) return;
    
    const auditRatio = data.auditRatio || 0;
    
    // Create chart data
    const chartData = [
      { name: 'Done', value: auditRatio },
      { name: 'Needed', value: Math.max(1 - auditRatio, 0) }
    ];
    
    // Create chart
    Charts.createPieChart('audit-ratio-chart', chartData, {
      donut: true,
      colors: [APP_CONFIG.CHART_COLORS[3], APP_CONFIG.CHART_COLORS[2]]
    });
  }
  
  /**
   * Update skill progress chart
   * @param {Array} skills - User skills data
   */
  function updateSkillProgressChart(skills) {
    const chartEl = document.getElementById('skill-progress-chart');
    if (!chartEl) return;
    
    if (!skills || skills.length === 0) {
      chartEl.innerHTML = '<p>No skills data available.</p>';
      return;
    }
    
    // Transform data for chart
    const chartData = skills.slice(0, 8).map(skill => {
      return {
        name: formatSkillName(skill.type),
        value: skill.amount
      };
    });
    
    // Create chart
    Charts.createBarChart('skill-progress-chart', chartData, {
      barColor: (d, i) => APP_CONFIG.CHART_COLORS[i % APP_CONFIG.CHART_COLORS.length]
    });
  }
  
  /**
   * Update events chart
   * @param {Object} data - User data with events
   */
  function updateEventsChart(data) {
    const chartEl = document.getElementById('events-chart');
    if (!chartEl) return;
    
    const transactions = data.transaction || [];
    const eventTypes = {};
    
    // Count transaction types
    transactions.forEach(t => {
      const type = t.type || 'unknown';
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });
    
    // Convert to chart data
    const chartData = Object.keys(eventTypes).map(type => {
      return {
        name: formatTransactionType(type),
        value: eventTypes[type]
      };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
    
    if (chartData.length === 0) {
      chartEl.innerHTML = '<p>No events data available.</p>';
      return;
    }
    
    // Create chart
    Charts.createPieChart('events-chart', chartData);
  }
  
  /**
   * Update performance chart
   * @param {Object} data - User data with progress information
   */
  function updatePerformanceChart(data) {
    const chartEl = document.getElementById('performance-chart');
    if (!chartEl) return;
    
    const progress = data.progress || [];
    
    if (progress.length === 0) {
      chartEl.innerHTML = '<p>No performance data available.</p>';
      return;
    }
    
    // Get average grade
    const grades = progress.filter(p => p.grade !== null && p.grade !== undefined).map(p => p.grade);
    const avgGrade = grades.reduce((sum, grade) => sum + grade, 0) / (grades.length || 1);
    
    // Create chart data
    const chartData = [
      { name: 'Average Grade', value: avgGrade.toFixed(1) },
      { name: 'Maximum', value: (Math.max(...grades) || 0).toFixed(1) }
    ];
    
    // Create chart
    Charts.createBarChart('performance-chart', chartData, {
      barColor: APP_CONFIG.CHART_COLORS[1]
    });
  }
  
  /**
   * Update all visualization charts
   * @param {Object} data - User data from GraphQL
   */
  function updateVisualizations(data) {
    if (!data) return;
    
    // Update skills chart
    if (data.skills) {
      updateSkillsDisplay(data.skills);
      updateSkillProgressChart(data.skills);
    }
    
    // Update recent activityskills
    updateRecentActivity(data);
    
    // Update user overview
    updateUserOverview(data);
    
    // Update progress timeline
    updateProgressTimeline(data);
    
    // Update audit ratio chart
    updateAuditRatioChart(data);
    
    // Update events chart
    updateEventsChart(data);
    
    // Update performance chart
    updatePerformanceChart(data);
  }
  
  /**
   * Format skill name from type string
   * @param {string} type - Skill type string
   * @return {string} Formatted skill name
   */
  function formatSkillName(type) {
    if (!type) return 'Unknown';
    
    // Remove skill_ prefix
    let name = type.replace('skill_', '');
    
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    
    // Capitalize words
    name = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return name;
  }
  
  /**
   * Format transaction type
   * @param {string} type - Transaction type
   * @return {string} Formatted transaction type
   */
  function formatTransactionType(type) {
    if (!type) return 'Unknown';
    
    // Replace underscores with spaces
    let name = type.replace(/_/g, ' ');
    
    // Capitalize words
    name = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return name;
  }
  
  /**
   * Format date string
   * @param {string} dateString - Date string
   * @param {boolean} shortFormat - Whether to use short format
   * @return {string} Formatted date string
   */
  function formatDate(dateString, shortFormat = false) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    if (shortFormat) {
      // Short format: MM/DD/YY
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(2)}`;
    } else {
      // Full format: Month DD, YYYY
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      return date.toLocaleDateString('en-US', options);
    }
  }
  
  // Public API
  return {
    init,
    updateProfileDisplay,
    updateVisualizations
  };
})();