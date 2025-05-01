/**
 * Charts Visualization Module
 */
const Charts = (function() {
  /**
   * Create a bar chart
   * @param {string} elementId - ID of the container element
   * @param {Array} data - Array of data objects with name and value properties
   * @param {Object} options - Chart options
   */
  function createBarChart(elementId, data, options = {}) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Default options
    const defaults = {
      width: container.clientWidth,
      height: container.clientHeight,
      margin: { top: 20, right: 20, bottom: 30, left: 40 },
      barColor: APP_CONFIG.CHART_COLORS[0],
      barPadding: 0.2,
      animate: true,
      showValues: true
    };
    
    // Merge options
    const opts = { ...defaults, ...options };
    
    // Calculate dimensions
    const chartWidth = opts.width - opts.margin.left - opts.margin.right;
    const chartHeight = opts.height - opts.margin.top - opts.margin.bottom;
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', opts.width);
    svg.setAttribute('height', opts.height);
    svg.style.overflow = 'visible';
    
    // Create chart group
    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chart.setAttribute('transform', `translate(${opts.margin.left},${opts.margin.top})`);
    svg.appendChild(chart);
    
    // Calculate scales
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length * (1 - opts.barPadding);
    
    // Create axes
    createXAxis(chart, data, chartWidth, chartHeight);
    createYAxis(chart, maxValue, chartHeight);
    
    // Create bars
    data.forEach((d, i) => {
      const barHeight = (d.value / maxValue) * chartHeight;
      const x = (chartWidth / data.length) * i + (chartWidth / data.length) * opts.barPadding / 2;
      const y = chartHeight - barHeight;
      
      // Create bar
      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.setAttribute('x', x);
      bar.setAttribute('y', chartHeight); // Start from bottom for animation
      bar.setAttribute('width', barWidth);
      bar.setAttribute('height', 0); // Start with 0 height for animation
      bar.setAttribute('fill', typeof opts.barColor === 'function' ? opts.barColor(d, i) : opts.barColor);
      
      // Add animation
      if (opts.animate) {
        const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animation.setAttribute('attributeName', 'y');
        animation.setAttribute('from', chartHeight);
        animation.setAttribute('to', y);
        animation.setAttribute('dur', '0.5s');
        animation.setAttribute('fill', 'freeze');
        bar.appendChild(animation);
        
        const heightAnimation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        heightAnimation.setAttribute('attributeName', 'height');
        heightAnimation.setAttribute('from', 0);
        heightAnimation.setAttribute('to', barHeight);
        heightAnimation.setAttribute('dur', '0.5s');
        heightAnimation.setAttribute('fill', 'freeze');
        bar.appendChild(heightAnimation);
      } else {
        bar.setAttribute('y', y);
        bar.setAttribute('height', barHeight);
      }
      
      // Add tooltip
      bar.setAttribute('data-tooltip', `${d.name}: ${d.value}`);
      
      chart.appendChild(bar);
      
      // Add value label
      if (opts.showValues) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x + barWidth / 2);
        text.setAttribute('y', y - 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'var(--text-secondary)');
        text.setAttribute('font-size', '12px');
        text.textContent = d.value;
        
        if (opts.animate) {
          const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animation.setAttribute('attributeName', 'opacity');
          animation.setAttribute('from', 0);
          animation.setAttribute('to', 1);
          animation.setAttribute('dur', '0.5s');
          animation.setAttribute('fill', 'freeze');
          text.appendChild(animation);
          text.setAttribute('opacity', 0);
        }
        
        chart.appendChild(text);
      }
    });
    
    container.appendChild(svg);
  }
  
  /**
   * Create a pie chart
   * @param {string} elementId - ID of the container element
   * @param {Array} data - Array of data objects with name and value properties
   * @param {Object} options - Chart options
   */
  function createPieChart(elementId, data, options = {}) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Default options
    const defaults = {
      width: container.clientWidth,
      height: container.clientHeight,
      radius: Math.min(container.clientWidth, container.clientHeight) / 2 - 40,
      colors: APP_CONFIG.CHART_COLORS,
      animate: true,
      showLabels: true,
      donut: false,
      donutRatio: 0.5
    };
    
    // Merge options
    const opts = { ...defaults, ...options };
    
    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', opts.width);
    svg.setAttribute('height', opts.height);
    svg.style.overflow = 'visible';
    
    // Create chart group
    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chart.setAttribute('transform', `translate(${opts.width / 2},${opts.height / 2})`);
    chart.classList.add('center_g');
    svg.appendChild(chart);
    
    // Calculate total value
    const total = data.reduce((sum, d) => sum + d.value, 0);
    
    // Create pie slices
    let startAngle = 0;
    data.forEach((d, i) => {
      // Calculate angles
      const angle = (d.value / total) * 360;
      const endAngle = startAngle + angle;
      
      // Calculate paths
      const path = createPieSlice(
        0, 0, 
        opts.radius, 
        startAngle, 
        endAngle,
        opts.donut ? opts.radius * opts.donutRatio : 0
      );
      
      // Create slice
      const slice = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      slice.setAttribute('d', path);
      slice.setAttribute('fill', opts.colors[i % opts.colors.length]);
      slice.setAttribute('stroke', 'var(--bg-secondary)');
      slice.setAttribute('stroke-width', '1');
      
      // Add animation
      if (opts.animate) {
        const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animation.setAttribute('attributeName', 'opacity');
        animation.setAttribute('from', 0);
        animation.setAttribute('to', 1);
        animation.setAttribute('dur', '0.5s');
        animation.setAttribute('fill', 'freeze');
        slice.appendChild(animation);
        slice.setAttribute('opacity', 0);
      }
      
      // Add tooltip
      slice.setAttribute('data-tooltip', `${d.name}: ${d.value} (${Math.round(d.value / total * 100)}%)`);
      
      chart.appendChild(slice);
      
      // Add label
      if (opts.showLabels) {
        // Calculate label position
        const midAngle = startAngle + angle / 2;
        const labelRadius = opts.radius * 0.7;
        const x = labelRadius * Math.cos(midAngle * Math.PI / 180);
        const y = labelRadius * Math.sin(midAngle * Math.PI / 180);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('fill', 'var(--text-color)');
        text.setAttribute('font-size', '12px');
        text.textContent = `${Math.round(d.value / total * 100)}%`;
        
        if (opts.animate) {
          const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animation.setAttribute('attributeName', 'opacity');
          animation.setAttribute('from', 0);
          animation.setAttribute('to', 1);
          animation.setAttribute('dur', '0.7s');
          animation.setAttribute('fill', 'freeze');
          text.appendChild(animation);
          text.setAttribute('opacity', 0);
        }
        
        chart.appendChild(text);
      }
      
      startAngle = endAngle;
    });
    
    // Create legend
    if (opts.showLabels) {
      createLegend(svg, data, opts);
    }
    
    container.appendChild(svg);
  }
  
  /**
   * Create a line chart
   * @param {string} elementId - ID of the container element
   * @param {Array} data - Array of data objects with x and y properties
   * @param {Object} options - Chart options
   */
/**
 * Creates an interactive line chart with customizable options
 * @param {string} elementId - ID of the container element
 * @param {Array} data - Array of {x, y} data points 
 * @param {Object} options - Configuration options
 */
function createLineChart(elementId, data, options = {}) {
  // Get container and validate
  const container = document.getElementById(elementId);
  if (!container) {
    console.error("Container element not found");
    return;
  }
  
  // Default options
  const defaults = {
    width: container.clientWidth || 600,
    height: container.clientHeight || 400,
    margin: { top: 20, right: 30, bottom: 50, left: 50 },
    lineColor: "#3b82f6", // Default blue color
    pointColor: "#3b82f6",
    animate: true,
    showPoints: true,
    showArea: false,
    areaOpacity: 0.2,
    lineWidth: 2,
    pointRadius: 4,
    showTooltips: true,
    showAxes: true,
    xAxisLabel: "",
    yAxisLabel: "",
    gridLines: true
  };
  
  // Merge options
  const opts = { ...defaults, ...options };
  
  // Calculate dimensions
  const chartWidth = opts.width - opts.margin.left - opts.margin.right;
  const chartHeight = opts.height - opts.margin.top - opts.margin.bottom;
  
  // Clear previous content
  container.innerHTML = '';
  
  // Create SVG
  const svg = createSVGElement('svg', {
    width: opts.width,
    height: opts.height,
    style: 'overflow: visible;'
  });
  
  // Create chart group with margin transform
  const chart = createSVGElement('g', {
    transform: `translate(${opts.margin.left},${opts.margin.top})`
  });
  svg.appendChild(chart);
  
  // Prepare and validate data
  const validData = data.filter(d => {
    const x = new Date(d.x).getTime();
    const y = parseFloat(d.y);
    return !isNaN(x) && !isNaN(y);
  });
  
  if (validData.length === 0) {
    renderNoDataMessage(chart, chartWidth, chartHeight);
    container.appendChild(svg);
    return;
  }
  
  // Convert data to usable format
  const xValues = validData.map(d => new Date(d.x).getTime());
  const yValues = validData.map(d => parseFloat(d.y));
  
  // Calculate domain
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  // Add padding to y-axis (10%)
  const yPadding = (yMax - yMin) * 0.1;
  const adjustedYMin = Math.max(0, yMin - yPadding);
  const adjustedYMax = yMax + yPadding;
  
  // Calculate points
  const points = validData.map(d => {
    const x = scaleValue(new Date(d.x).getTime(), xMin, xMax, 0, chartWidth);
    const y = scaleValue(parseFloat(d.y), adjustedYMin, adjustedYMax, chartHeight, 0);
    return { x, y, originalX: d.x, originalY: d.y };
  });
  
  // Add grid if enabled
  if (opts.gridLines) {
    renderGrid(chart, chartWidth, chartHeight);
  }
  
  // Create axes
  if (opts.showAxes) {
    renderAxes(chart, chartWidth, chartHeight, xMin, xMax, adjustedYMin, adjustedYMax, opts);
  }
  
  // Create area if needed (before line so it's behind)
  if (opts.showArea) {
    const areaPath = createAreaPath(points, chartHeight, opts);
    chart.appendChild(areaPath);
  }
  
  // Create line path
  const linePath = createLinePath(points, opts);
  chart.appendChild(linePath);
  
  // Add points
  if (opts.showPoints) {
    points.forEach((p, i) => {
      const point = createPoint(p, validData[i], opts);
      chart.appendChild(point);
      
      // Add tooltip functionality if enabled
      if (opts.showTooltips) {
        addTooltipBehavior(point, p, validData[i]);
      }
    });
  }
  
  // Add the chart to the container
  container.appendChild(svg);
  
  // Helper functions
  
  // Create SVG element with attributes
  function createSVGElement(type, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  }
  
  // Scale a value from one range to another
  function scaleValue(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
  }
  
  // Format date for display
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  // Format number for display
  function formatNumber(num) {
    return parseFloat(num).toLocaleString(undefined, { 
      maximumFractionDigits: 2 
    });
  }
  
  // Show "No data" message
  function renderNoDataMessage(parent, width, height) {
    const text = createSVGElement('text', {
      x: width / 2,
      y: height / 2,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': '14px',
      fill: '#666'
    });
    text.textContent = 'No valid data to display';
    parent.appendChild(text);
  }
  
  // Create grid lines
  function renderGrid(parent, width, height) {
    const grid = createSVGElement('g', {
      class: 'grid',
      stroke: '#e5e5e5',
      'stroke-width': '0.5'
    });
    
    // Horizontal grid lines (5 lines)
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      const line = createSVGElement('line', {
        x1: 0,
        y1: y,
        x2: width,
        y2: y,
        stroke: '#e5e5e5'
      });
      grid.appendChild(line);
    }
    
    // Vertical grid lines (5 lines)
    for (let i = 0; i <= 5; i++) {
      const x = (width / 5) * i;
      const line = createSVGElement('line', {
        x1: x,
        y1: 0,
        x2: x,
        y2: height,
        stroke: '#e5e5e5'
      });
      grid.appendChild(line);
    }
    
    parent.appendChild(grid);
  }
  
  // Create axes
  function renderAxes(parent, width, height, xMin, xMax, yMin, yMax, options) {
    const axesGroup = createSVGElement('g', { class: 'axes' });
    
    // X-axis line
    const xAxis = createSVGElement('line', {
      x1: 0,
      y1: height,
      x2: width,
      y2: height,
      stroke: '#666',
      'stroke-width': 1
    });
    axesGroup.appendChild(xAxis);
    
    // Y-axis line
    const yAxis = createSVGElement('line', {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: height,
      stroke: '#666',
      'stroke-width': 1
    });
    axesGroup.appendChild(yAxis);
    
    // X-axis ticks and labels
    const xTickCount = 5;
    for (let i = 0; i <= xTickCount; i++) {
      const x = (width / xTickCount) * i;
      const tickValue = xMin + (xMax - xMin) * (i / xTickCount);
      
      // Tick mark
      const tick = createSVGElement('line', {
        x1: x,
        y1: height,
        x2: x,
        y2: height + 5,
        stroke: '#666',
        'stroke-width': 1
      });
      
      // Label
      const label = createSVGElement('text', {
        x: x,
        y: height + 20,
        'text-anchor': 'middle',
        'font-size': '12px',
        fill: '#666'
      });
      label.textContent = formatDate(tickValue);
      
      axesGroup.appendChild(tick);
      axesGroup.appendChild(label);
    }
    
    // Y-axis ticks and labels
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const y = height - (height / yTickCount) * i;
      const tickValue = yMin + (yMax - yMin) * (i / yTickCount);
      
      // Tick mark
      const tick = createSVGElement('line', {
        x1: -5,
        y1: y,
        x2: 0,
        y2: y,
        stroke: '#666',
        'stroke-width': 1
      });
      
      // Label
      const label = createSVGElement('text', {
        x: -10,
        y: y,
        'text-anchor': 'end',
        'dominant-baseline': 'middle',
        'font-size': '12px',
        fill: '#666'
      });
      label.textContent = formatNumber(tickValue);
      
      axesGroup.appendChild(tick);
      axesGroup.appendChild(label);
    }
    
    // Add axis labels if provided
    if (options.xAxisLabel) {
      const xLabel = createSVGElement('text', {
        x: width / 2,
        y: height + 40,
        'text-anchor': 'middle',
        'font-size': '14px',
        fill: '#333'
      });
      xLabel.textContent = options.xAxisLabel;
      axesGroup.appendChild(xLabel);
    }
    
    if (options.yAxisLabel) {
      const yLabel = createSVGElement('text', {
        x: -35,
        y: height / 2,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'transform': `rotate(-90, -35, ${height / 2})`,
        'font-size': '14px',
        fill: '#333'
      });
      yLabel.textContent = options.yAxisLabel;
      axesGroup.appendChild(yLabel);
    }
    
    parent.appendChild(axesGroup);
  }
  
  // Create line path
  function createLinePath(points, options) {
    // Create path data
    let pathData = '';
    points.forEach((p, i) => {
      if (i === 0) {
        pathData += `M ${p.x} ${p.y}`;
      } else {
        pathData += ` L ${p.x} ${p.y}`;
      }
    });
    
    const path = createSVGElement('path', {
      d: pathData,
      fill: 'none',
      stroke: options.lineColor,
      'stroke-width': options.lineWidth,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round'
    });
    
    // Add animation
    if (options.animate) {
      const length = path.getTotalLength();
      path.setAttribute('stroke-dasharray', length);
      path.setAttribute('stroke-dashoffset', length);
      
      const animation = createSVGElement('animate', {
        attributeName: 'stroke-dashoffset',
        from: length,
        to: 0,
        dur: '1s',
        fill: 'freeze'
      });
      
      path.appendChild(animation);
    }
    
    return path;
  }
  
  // Create area path
  function createAreaPath(points, height, options) {
    // Create path data for area
    let areaData = '';
    points.forEach((p, i) => {
      if (i === 0) {
        areaData += `M ${p.x} ${p.y}`;
      } else {
        areaData += ` L ${p.x} ${p.y}`;
      }
    });
    
    // Close the path to create an area
    areaData += ` L ${points[points.length - 1].x} ${height}`;
    areaData += ` L ${points[0].x} ${height}`;
    areaData += ' Z';
    
    const areaPath = createSVGElement('path', {
      d: areaData,
      fill: options.lineColor,
      'fill-opacity': options.areaOpacity,
      stroke: 'none'
    });
    
    // Add animation
    if (options.animate) {
      areaPath.setAttribute('opacity', '0');
      const animation = createSVGElement('animate', {
        attributeName: 'opacity',
        from: 0,
        to: 1,
        dur: '1s',
        fill: 'freeze'
      });
      areaPath.appendChild(animation);
    }
    
    return areaPath;
  }
  
  // Create data point
  function createPoint(point, originalData, options) {
    const circle = createSVGElement('circle', {
      cx: point.x,
      cy: point.y,
      r: options.pointRadius,
      fill: options.pointColor,
      stroke: '#ffffff',
      'stroke-width': 1.5,
      'data-x': originalData.x,
      'data-y': originalData.y
    });
    
    // Add animation
    if (options.animate) {
      circle.setAttribute('opacity', '0');
      const animation = createSVGElement('animate', {
        attributeName: 'opacity',
        from: '0',
        to: '1',
        dur: '1s',
        fill: 'freeze'
      });
      circle.appendChild(animation);
    }
    
    return circle;
  }
  
  // Add tooltip behavior
  function addTooltipBehavior(element, point, originalData) {
    // Create tooltip element outside of SVG
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.display = 'none';
    tooltip.style.padding = '8px';
    tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = '#fff';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '12px';
    tooltip.style.pointerEvents = 'none';
    tooltip.style.zIndex = '1000';
    tooltip.style.whiteSpace = 'nowrap';
    document.body.appendChild(tooltip);
    
    // Mouse events
    element.addEventListener('mouseenter', (e) => {
      const date = formatDate(new Date(originalData.x).getTime());
      const value = formatNumber(originalData.y);
      tooltip.innerHTML = `<strong>${date}</strong>: ${value}`;
      tooltip.style.display = 'block';
    });
    
    element.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      tooltip.style.left = (e.clientX + 10) + 'px';
      tooltip.style.top = (e.clientY + 10) + 'px';
    });
    
    element.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  }
}
  
  /**
   * Create X axis
   * @param {SVGElement} chart - Chart SVG group element
   * @param {Array} data - Data array
   * @param {number} width - Chart width
   * @param {number} height - Chart height
   */
  function createXAxis(chart, data, width, height) {
    // Create axis line
    const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisLine.setAttribute('x1', 0);
    axisLine.setAttribute('y1', height);
    axisLine.setAttribute('x2', width);
    axisLine.setAttribute('y2', height);
    axisLine.setAttribute('stroke', 'var(--chart-grid)');
    axisLine.setAttribute('stroke-width', 1);
    chart.appendChild(axisLine);
    
    // Create ticks
    const tickCount = Math.min(data.length, 5);
    if (tickCount <= 1) return;
    
    for (let i = 0; i < tickCount; i++) {
      const x = (width / (tickCount - 1)) * i;
      
      // Tick line
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', x);
      tick.setAttribute('y1', height);
      tick.setAttribute('x2', x);
      tick.setAttribute('y2', height + 5);
      tick.setAttribute('stroke', 'var(--chart-grid)');
      tick.setAttribute('stroke-width', 1);
      chart.appendChild(tick);
      
      // Only add labels if we have data
      if (data.length > i) {
        // Tick label
        const index = Math.floor((data.length - 1) * (i / (tickCount - 1)));
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', height + 15);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', 'var(--text-secondary)');
        label.setAttribute('font-size', '10px');
        
        // Truncate long names
        let name = data[index].name.toString();
        if (name.length > 10) {
          name = name.substring(0, 8) + '...';
        }
        
        label.textContent = name;
        chart.appendChild(label);
      }
    }
  }
  
  /**
   * Create Y axis
   * @param {SVGElement} chart - Chart SVG group element
   * @param {number} maxValue - Maximum data value
   * @param {number} height - Chart height
   * @param {number} minValue - Minimum data value (optional, defaults to 0)
   */
  function createYAxis(chart, maxValue, height, minValue = 0) {
    // Create axis line
    const axisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    axisLine.setAttribute('x1', 0);
    axisLine.setAttribute('y1', 0);
    axisLine.setAttribute('x2', 0);
    axisLine.setAttribute('y2', height);
    axisLine.setAttribute('stroke', 'var(--chart-grid)');
    axisLine.setAttribute('stroke-width', 1);
    chart.appendChild(axisLine);
    
    // Create ticks
    const tickCount = 5;
    const range = maxValue - minValue;
    
    for (let i = 0; i < tickCount; i++) {
      const y = height - (height / (tickCount - 1)) * i;
      const value = minValue + (range / (tickCount - 1)) * i;
      
      // Tick line
      const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      tick.setAttribute('x1', -5);
      tick.setAttribute('y1', y);
      tick.setAttribute('x2', 0);
      tick.setAttribute('y2', y);
      tick.setAttribute('stroke', 'var(--chart-grid)');
      tick.setAttribute('stroke-width', 1);
      chart.appendChild(tick);
      
      // Grid line
      const grid = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      grid.setAttribute('x1', 0);
      grid.setAttribute('y1', y);
      grid.setAttribute('x2', chart.parentNode.getAttribute('width') - 60);
      grid.setAttribute('y2', y);
      grid.setAttribute('stroke', 'var(--chart-grid)');
      grid.setAttribute('stroke-width', 0.5);
      grid.setAttribute('stroke-dasharray', '2,2');
      chart.appendChild(grid);
      
      // Tick label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', -10);
      label.setAttribute('y', y);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('alignment-baseline', 'middle');
      label.setAttribute('fill', 'var(--text-secondary)');
      label.setAttribute('font-size', '10px');
      
      // Format the value
      let formattedValue;
      if (value >= 1000) {
        formattedValue = (value / 1000).toFixed(1) + 'k';
      } else {
        formattedValue = Math.round(value);
      }
      
      label.textContent = formattedValue;
      chart.appendChild(label);
    }
  }
  
  /**
   * Create a pie chart slice path
   * @param {number} x - Center X coordinate
   * @param {number} y - Center Y coordinate
   * @param {number} radius - Outer radius
   * @param {number} startAngle - Start angle in degrees
   * @param {number} endAngle - End angle in degrees
   * @param {number} innerRadius - Inner radius for donut charts
   * @return {string} SVG path data
   */
  function createPieSlice(x, y, radius, startAngle, endAngle, innerRadius = 0) {
    // Convert angles from degrees to radians
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    // Calculate points
    const startOuterX = x + radius * Math.cos(startRad);
    const startOuterY = y + radius * Math.sin(startRad);
    const endOuterX = x + radius * Math.cos(endRad);
    const endOuterY = y + radius * Math.sin(endRad);
    
    // Create path
    let path = `M ${startOuterX} ${startOuterY}`;
    
    // Add arc
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    path += ` A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}`;
    
    // Add inner arc for donut charts
    if (innerRadius > 0) {
      const startInnerX = x + innerRadius * Math.cos(endRad);
      const startInnerY = y + innerRadius * Math.sin(endRad);
      const endInnerX = x + innerRadius * Math.cos(startRad);
      const endInnerY = y + innerRadius * Math.sin(startRad);
      
      path += ` L ${startInnerX} ${startInnerY}`;
      path += ` A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endInnerX} ${endInnerY}`;
      path += ' Z';
    } else {
      path += ` L ${x} ${y}`;
      path += ' Z';
    }
    
    return path;
  }
  
  /**
   * Create legend for charts
   * @param {SVGElement} svg - SVG element
   * @param {Array} data - Data array
   * @param {Object} options - Chart options
   */
  function createLegend(svg, data, options) {
    const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    legendGroup.setAttribute('transform', `translate(${options.width - 100}, 20)`);
    
    data.forEach((d, i) => {
      const y = i * 20;
      
      // Color box
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', 0);
      rect.setAttribute('y', y);
      rect.setAttribute('width', 12);
      rect.setAttribute('height', 12);
      rect.setAttribute('fill', options.colors[i % options.colors.length]);
      legendGroup.appendChild(rect);
      
      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', 20);
      text.setAttribute('y', y + 10);
      text.setAttribute('fill', 'var(--text-secondary)');
      text.setAttribute('font-size', '12px');
      
      // Truncate long names
      let name = d.name;
      if (name.length > 15) {
        name = name.substring(0, 12) + '...';
      }
      
      text.textContent = name;
      legendGroup.appendChild(text);
    });
    
    svg.appendChild(legendGroup);
  }
  
  // Public API
  return {
    createBarChart,
    createPieChart,
    createLineChart
  };
})();