// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const profileContainer = document.getElementById('profileContainer');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('loginError');

// API URLs
const AUTH_URL = 'https://learn.zone01kisumu.ke/api/auth/signin';
const GRAPHQL_URL = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';

// Check if user is already logged in
window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Validate token and fetch user data
        fetchUserData(token)
            .then(data => {
                if (data) {
                    displayUserProfile(data);
                } else {
                    // Token is invalid, clear it
                    localStorage.removeItem('token');
                    showLoginForm();
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                showLoginForm();
            });
    } else {
        showLoginForm();
    }

    // Setup tab functionality
    setupTabs();
};

// Login Form Event Listener
loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        loginError.textContent = 'Please enter username and password';
        return;
    }

    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;

    try {
        const token = await login(username, password);
        if (token) {
            localStorage.setItem('token', token);
            const userData = await fetchUserData(token);
            if (userData) {
                displayUserProfile(userData);
            }
        }
    } catch (error) {
        loginError.textContent = 'Invalid username or password';
    } finally {
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
    }
});

// Logout Button Event Listener
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    showLoginForm();
});

// Login Function
async function login(username, password) {
    const credentials = btoa(`${username}:${password}`);
    
    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    });

    if (response.ok) {
        return await response.json();
    } else {
        throw new Error('Login failed');
    }
}

// Fetch User Data using GraphQL
async function fetchUserData(token) {
    const query = `
      query {
        user {
          id
          login
          attrs
          auditRatio
          skills: transactions(where: { type: { _like: "skill_%" } }, order_by: [{ amount: desc }]) {
            type
            amount
          }
          audits(order_by: {createdAt: desc}, where: {closedAt: {_is_null: true}, group: {captain: { canAccessPlatform: {_eq: true}}}}) {
            closedAt
            group {
              captain{
                canAccessPlatform
              }
              captainId
              captainLogin
              path
              createdAt
              updatedAt
              members {
                userId
                userLogin
              }
            }
            private {
              code
            }
          }
          events(where: {eventId: {_eq: 75}}) {
            level
          }
        }
        transaction(where: {_and: [{eventId:{_eq: 75}}]}, order_by: { createdAt: desc }) {
          amount
          createdAt
          eventId
          path
          type
          userId
        }
        progress(where: {_and: [{grade: {_is_null: false}},{eventId:{_eq: 75}}]}, order_by: {createdAt: desc}) {
          id
          createdAt
          eventId
          grade
          path
        }
      }
    `;

    const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
    });

    if (response.ok) {
        const result = await response.json();
        console.log(result)
        return result.data;
    } else {
        throw new Error('Failed to fetch user data');
    }
}

// Show Login Form
function showLoginForm() {
    loginContainer.classList.remove('hidden');
    profileContainer.classList.add('hidden');
    usernameInput.value = '';
    passwordInput.value = '';
    loginError.textContent = '';
}

// Display User Profile
function displayUserProfile(data) {
    loginContainer.classList.add('hidden');
    profileContainer.classList.remove('hidden');

    if (!data.user || data.user.length === 0) {
        return;
    }

    const user = data.user[0];
    const attrs = user.attrs;

    // Basic Info
    document.getElementById('userName').textContent = user.login;
    document.getElementById('userId').textContent = `ID: ${user.id}`;
    document.getElementById('userAvatar').textContent = user.login.charAt(0).toUpperCase();

    // Skills
    displaySkills(user.skills);

    // Audit Ratio
    displayAuditRatio(user.auditRatio);

    // Audits
    displayAudits(user.audits);

    // Personal Info
    const infoList = document.getElementById('personalInfo');
    if (infoList) {
        infoList.innerHTML = `
          <li><strong>Name:</strong> ${attrs.firstName} ${attrs.middleName} ${attrs.lastName}</li>
          <li><strong>Gender:</strong> ${attrs.gender}</li>
          <li><strong>Country:</strong> ${attrs.country}</li>
          <li><strong>Phone:</strong> ${attrs.phone}</li>
          <li><strong>Email:</strong> ${attrs.email}</li>
          <li><strong>Language:</strong> ${attrs.language}</li>
        `;
    }

    // Graphs
    generateXPOverTimeGraph(data.transaction);
    generateProgressGraph(data.progress);
}

// Toggle personal info visibility
document.getElementById('userHeaderClickable').addEventListener('click', () => {
    const card = document.getElementById('personalInfoCard');
    card.classList.toggle('hidden');
});


// Display Skills
function displaySkills(skills) {
    const skillsContainer = document.getElementById('skills');
    skillsContainer.innerHTML = '';

    if (skills && skills.length > 0) {
        const maxSkillsMap = {};

        // Find max amount per skill type
        for (const skill of skills) {
            const type = skill.type;
            if (!maxSkillsMap[type] || skill.amount > maxSkillsMap[type].amount) {
                maxSkillsMap[type] = skill;
            }
        }

        // Convert map to sorted array by amount (desc)
        const uniqueSkills = Object.values(maxSkillsMap).sort((a, b) => b.amount - a.amount);

        uniqueSkills.forEach(skill => {
            const skillName = skill.type.replace('skill_', '').replace(/_/g, ' ');
            const formattedName = skillName.charAt(0).toUpperCase() + skillName.slice(1);

            const skillElement = document.createElement('div');
            skillElement.className = 'skill-tag';
            skillElement.innerHTML = `
                ${formattedName} <span class="amount">${skill.amount}%</span>
            `;
            skillsContainer.appendChild(skillElement);
        });
    } else {
        skillsContainer.innerHTML = '<p>No skills data available</p>';
    }
}


// Display Audit Ratio
function displayAuditRatio(ratio) {
    const auditRatioElement = document.getElementById('auditRatio');

    if (ratio !== null && ratio !== undefined) {
        const formattedRatio = parseFloat(ratio).toFixed(1); // Round to 1 decimal place
        auditRatioElement.innerHTML = `
            <p>Your current audit ratio is:</p>
            <div class="ratio-display">${formattedRatio}</div>
            <p>Done / Received</p>
        `;
    } else {
        auditRatioElement.innerHTML = '<p>No audit ratio data available</p>';
    }
}


// Display Audits
function displayAudits(audits) {
    const auditsContainer = document.getElementById('audits');
    auditsContainer.innerHTML = '';

    if (audits && audits.length > 0) {
        audits.slice(0, 3).forEach(audit => {
            const auditElement = document.createElement('div');
            auditElement.className = 'audit-item';
            
            const group = audit.group;
            const path = group.path;
            const projectName = path.split('/').pop().replace(/-/g, ' ');
            
            auditElement.innerHTML = `
                <div class="audit-path">${projectName}</div>
                <div class="audit-info">Captain: ${group.captainLogin}</div>
                <div class="audit-info">Created: ${new Date(group.createdAt).toLocaleDateString()}</div>
            `;
            
            auditsContainer.appendChild(auditElement);
        });
    } else {
        auditsContainer.innerHTML = '<p>No active audits</p>';
    }
}

// Generate XP Over Time Graph
function generateXPOverTimeGraph(transactions) {
    const svg = document.getElementById('xpOverTimeGraph');
    svg.innerHTML = '';
    
    if (!transactions || transactions.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">No XP data available</text>';
        return;
    }

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = svg.clientWidth - margin.left - margin.right;
    const height = svg.clientHeight - margin.top - margin.bottom;

    const xpTransactions = transactions.filter(t => t.type === 'xp');
    
    // Sort transactions by date
    xpTransactions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Prepare cumulative data
    let cumulativeXP = 0;
    const data = xpTransactions.map(t => {
        cumulativeXP += t.amount;
        return {
            date: new Date(t.createdAt),
            amount: t.amount,
            cumulativeXP,
            path: t.path
        };
    });

    // Create chart area
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
    svg.appendChild(g);

    // Add gradient for area fill
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'area-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'var(--primary)');
    stop1.setAttribute('stop-opacity', '0.3');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', 'var(--primary)');
    stop2.setAttribute('stop-opacity', '0');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.insertBefore(defs, svg.firstChild);

    // X scale
    const xMin = new Date(Math.min(...data.map(d => d.date)));
    const xMax = new Date(Math.max(...data.map(d => d.date)));
    
    const xScale = (date) => {
        const range = xMax - xMin;
        const normalized = (date - xMin) / range;
        return normalized * width;
    };

    // Y scale
    const yMax = Math.max(...data.map(d => d.cumulativeXP));
    
    const yScale = (value) => {
        return height - (value / yMax * height);
    };

    // Create area path
    let areaPath = `M ${xScale(data[0].date)} ${yScale(data[0].cumulativeXP)}`;
    for (let i = 1; i < data.length; i++) {
        areaPath += ` L ${xScale(data[i].date)} ${yScale(data[i].cumulativeXP)}`;
    }
    areaPath += ` L ${xScale(data[data.length-1].date)} ${height} L ${xScale(data[0].date)} ${height} Z`;

    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('class', 'area');
    g.appendChild(area);

    // Create line path
    let linePath = `M ${xScale(data[0].date)} ${yScale(data[0].cumulativeXP)}`;
    for (let i = 1; i < data.length; i++) {
        linePath += ` L ${xScale(data[i].date)} ${yScale(data[i].cumulativeXP)}`;
    }

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', linePath);
    path.setAttribute('class', 'line');
    g.appendChild(path);

    // Add dots for data points
    data.forEach(d => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', xScale(d.date));
        circle.setAttribute('cy', yScale(d.cumulativeXP));
        circle.setAttribute('r', 4);
        circle.setAttribute('class', 'dot');
        
        // Add title for tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `Date: ${d.date.toLocaleDateString()}\nXP: ${d.amount}\nTotal XP: ${d.cumulativeXP}\nProject: ${d.path}`;
        circle.appendChild(title);
        
        g.appendChild(circle);
    });

    // X Axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    xAxis.setAttribute('transform', `translate(0,${height})`);
    xAxis.setAttribute('class', 'axis');
    
    // X Axis line
    const xAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxisLine.setAttribute('x1', 0);
    xAxisLine.setAttribute('y1', 0);
    xAxisLine.setAttribute('x2', width);
    xAxisLine.setAttribute('y2', 0);
    xAxisLine.setAttribute('stroke', 'var(--border-color)');
    xAxisLine.setAttribute('stroke-width', '1');
    xAxis.appendChild(xAxisLine);
    
    // X Axis ticks
    const xTicks = 5;
    const xStep = (xMax - xMin) / (xTicks - 1);
    
    for (let i = 0; i < xTicks; i++) {
        const tickDate = new Date(xMin.getTime() + i * xStep);
        const x = xScale(tickDate);
        
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', x);
        tick.setAttribute('y1', 0);
        tick.setAttribute('x2', x);
        tick.setAttribute('y2', 5);
        tick.setAttribute('stroke', 'var(--border-color)');
        xAxis.appendChild(tick);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', 20);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'axis-text');
        label.textContent = tickDate.toLocaleDateString();
        xAxis.appendChild(label);
    }
    
    g.appendChild(xAxis);

    // Y Axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    yAxis.setAttribute('class', 'axis');
    
    // Y Axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', height);
    yAxisLine.setAttribute('stroke', 'var(--border-color)');
    yAxisLine.setAttribute('stroke-width', '1');
    yAxis.appendChild(yAxisLine);
    
    // Y Axis ticks
    const yTicks = 5;
    const yStep = yMax / (yTicks - 1);
    
    for (let i = 0; i < yTicks; i++) {
        const tickValue = i * yStep;
        const y = yScale(tickValue);
        
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', -5);
        tick.setAttribute('y1', y);
        tick.setAttribute('x2', 0);
        tick.setAttribute('y2', y);
        tick.setAttribute('stroke', 'var(--border-color)');
        yAxis.appendChild(tick);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', -10);
        label.setAttribute('y', y + 5);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('class', 'axis-text');
        label.textContent = Math.round(tickValue).toLocaleString();
        yAxis.appendChild(label);
    }
    
    g.appendChild(yAxis);

    // Add chart title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', -15);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('class', 'chart-title');
    title.textContent = 'XP Progress Over Time';
    g.appendChild(title);
}

// Replace your generateProgressGraph function with this:
function generateProgressGraph(progressData) {
    const svg = document.getElementById('progressRatioGraph');
    svg.innerHTML = '';
    
    if (!progressData || progressData.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">No progress data available</text>';
        return;
    }

    const margin = { top: 40, right: 40, bottom: 60, left: 40 };
    const width = svg.clientWidth - margin.left - margin.right;
    const height = svg.clientHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2 - 20;

    // Count pass/fail
    const results = progressData.reduce((acc, curr) => {
        const result = curr.grade >= 1 ? 'PASS' : 'FAIL';
        acc[result] = (acc[result] || 0) + 1;
        return acc;
    }, {});

    // Create data array for pie chart
    const data = [
        { label: 'PASS', value: results.PASS || 0, color: 'var(--success)' },
        { label: 'FAIL', value: results.FAIL || 0, color: 'var(--danger)' }
    ].filter(d => d.value > 0);

    const total = data.reduce((sum, d) => sum + d.value, 0);
    if (total === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">No progress data available</text>';
        return;
    }

    // Create chart area
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
    svg.appendChild(g);

    // Draw pie slices
    let startAngle = 0;
    data.forEach(d => {
        const percentage = d.value / total;
        const endAngle = startAngle + percentage * 2 * Math.PI;
        
        // Calculate arc path
        const x1 = radius * Math.sin(startAngle);
        const y1 = -radius * Math.cos(startAngle);
        const x2 = radius * Math.sin(endAngle);
        const y2 = -radius * Math.cos(endAngle);
        
        const largeArc = percentage > 0.5 ? 1 : 0;
        
        const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', d.color);
        path.setAttribute('class', 'pie-slice');
        
        // Add title for tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${d.label}: ${d.value} (${(percentage * 100).toFixed(1)}%)`;
        path.appendChild(title);
        
        g.appendChild(path);
        
        // Add center label for large enough slices
        if (percentage > 0.1) {
            const labelAngle = startAngle + (endAngle - startAngle) / 2;
            const labelRadius = radius * 0.7;
            const labelX = labelRadius * Math.sin(labelAngle);
            const labelY = -labelRadius * Math.cos(labelAngle);
            
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', labelX);
            label.setAttribute('y', labelY);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('fill', 'white');
            label.setAttribute('font-weight', '600');
            label.setAttribute('font-size', '12px');
            label.textContent = `${(percentage * 100).toFixed(0)}%`;
            g.appendChild(label);
        }
        
        startAngle = endAngle;
    });

    // Add donut hole
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', 0);
    centerCircle.setAttribute('cy', 0);
    centerCircle.setAttribute('r', radius * 0.5);
    centerCircle.setAttribute('fill', 'var(--card-color)');
    centerCircle.setAttribute('class', 'pie-center');
    g.appendChild(centerCircle);

    // Add total count in center
    const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    centerText.setAttribute('x', 0);
    centerText.setAttribute('y', 0);
    centerText.setAttribute('text-anchor', 'middle');
    centerText.setAttribute('dominant-baseline', 'middle');
    centerText.setAttribute('class', 'pie-center-text');
    centerText.textContent = `${total}`;
    g.appendChild(centerText);

    // Add title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', 0);
    title.setAttribute('y', -radius - 25);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('class', 'chart-title');
    title.textContent = 'Projects Pass/Fail Ratio';
    g.appendChild(title);

    // Create legend container
    const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legend.setAttribute('transform', `translate(${-width/2 + margin.left}, ${radius + 40})`);
    
    // Add legend items
    data.forEach((d, i) => {
        const legendItem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendItem.setAttribute('transform', `translate(${i * 120}, 0)`);
        
        const colorSquare = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        colorSquare.setAttribute('width', 16);
        colorSquare.setAttribute('height', 16);
        colorSquare.setAttribute('fill', d.color);
        colorSquare.setAttribute('rx', 3);
        legendItem.appendChild(colorSquare);
        
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', 24);
        label.setAttribute('y', 12);
        label.setAttribute('fill', 'var(--text-color)');
        label.textContent = `${d.label}: ${d.value}`;
        legendItem.appendChild(label);
        
        legend.appendChild(legendItem);
    });
    
    g.appendChild(legend);
}

// Generate Progress Graph (Pass/Fail ratio)
function generateProgressGraph(progressData) {
    const svg = document.getElementById('progressRatioGraph');
    svg.innerHTML = '';
    
    if (!progressData || progressData.length === 0) {
        svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">No progress data available</text>';
        return;
    }

    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = svg.clientWidth - margin.left - margin.right;
    const height = svg.clientHeight - margin.top - margin.bottom;

    // Count pass/fail
    const results = progressData.reduce((acc, curr) => {
        const result = curr.grade >= 1 ? 'PASS' : 'FAIL';
        acc[result] = (acc[result] || 0) + 1;
        return acc;
    }, {});

    // Create data array for pie chart
    const data = [
        { label: 'PASS', value: results.PASS || 0, color: '#28a745' },
        { label: 'FAIL', value: results.FAIL || 0, color: '#dc3545' }
    ];

    const total = data.reduce((sum, d) => sum + d.value, 0);

    // Create chart area
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);
    svg.appendChild(g);

    // Draw pie chart
    const radius = Math.min(width, height) / 2;
    let startAngle = 0;

    data.forEach(d => {
        if (d.value === 0) return;
        
        const percentage = d.value / total;
        const endAngle = startAngle + percentage * 2 * Math.PI;
        
        // Calculate arc path
        const x1 = radius * Math.sin(startAngle);
        const y1 = -radius * Math.cos(startAngle);
        const x2 = radius * Math.sin(endAngle);
        const y2 = -radius * Math.cos(endAngle);
        
        const largeArc = percentage > 0.5 ? 1 : 0;
        
        const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', d.color);
        path.setAttribute('class', 'pie-slice');
        
        // Add title for tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${d.label}: ${d.value} (${(percentage * 100).toFixed(1)}%)`;
        path.appendChild(title);
        
        g.appendChild(path);
        
        // Label position
        const labelAngle = startAngle + (endAngle - startAngle) / 2;
        const labelRadius = radius * 0.7;
        const labelX = labelRadius * Math.sin(labelAngle);
        const labelY = -labelRadius * Math.cos(labelAngle);
        
        // Add label if slice is large enough
        if (percentage > 0.05) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', labelX);
            label.setAttribute('y', labelY);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'middle');
            label.setAttribute('fill', 'white');
            label.setAttribute('font-weight', 'bold');
            label.textContent = d.label;
            g.appendChild(label);
        }
        
        startAngle = endAngle;
    });

    // Add title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', 0);
    title.setAttribute('y', -radius - 20);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('font-size', '16px');
    title.textContent = 'Projects Pass/Fail Ratio';
    g.appendChild(title);

    // Add legend
    const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legend.setAttribute('transform', `translate(0, ${radius + 30})`);
    
    data.forEach((d, i) => {
        const legendItem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendItem.setAttribute('transform', `translate(${i * 120 - 60}, 0)`);
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', 15);
        rect.setAttribute('height', 15);
        rect.setAttribute('fill', d.color);
        legendItem.appendChild(rect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', 20);
        text.setAttribute('y', 12);
        text.textContent = `${d.label}: ${d.value}`;
        legendItem.appendChild(text);
        
        legend.appendChild(legendItem);
    });
    
    g.appendChild(legend);
}

// Set up tabs functionality
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Deactivate all tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Activate selected tab
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

const toggleBtn = document.getElementById('themeToggle');

    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    toggleBtn.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    });