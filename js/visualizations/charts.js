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
  function createLineChart(elementId, data, options = {}) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Default options
    const defaults = {
      width: container.clientWidth,
      height: container.clientHeight,
      margin: { top: 20, right: 20, bottom: 30, left: 40 },
      lineColor: APP_CONFIG.CHART_COLORS[0],
      pointColor: APP_CONFIG.CHART_COLORS[0],
      animate: true,
      showPoints: true,
      showArea: false,
      areaOpacity: 0.2
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
    
    // Convert date strings to timestamps (milliseconds)
    const xValues = data.map(d => new Date(d.x).getTime()).filter(v => !isNaN(v));
    const yValues = data.map(d => +d.y).filter(v => !isNaN(v));

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

        // Calculate points
    const points = data.map(d => {
      const dx = new Date(d.x).getTime(); // Date → timestamp
      const dy = +d.y;

      const x = isNaN(dx) ? NaN : ((dx - xMin) / (xMax - xMin)) * chartWidth;
      const y = isNaN(dy) ? NaN : chartHeight - ((dy - yMin) / (yMax - yMin)) * chartHeight;

      return { x, y };
    });
    console.log("These are the points",points);


    
    // Create axes
    createXAxis(chart, data.map(d => ({ name: d.x })), chartWidth, chartHeight);
    createYAxis(chart, yMax, chartHeight, yMin);
    
    // Create line path
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    chart.appendChild(linePath);
    
    
    // Create path data
    let pathData = '';
    points.forEach((p, i) => {
      if (i === 0) {
        pathData += `M ${p.x} ${p.y}`;
      } else {
        pathData += ` L ${p.x} ${p.y}`;
      }
    });
    
    linePath.setAttribute('d', pathData);
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke', opts.lineColor);
    linePath.setAttribute('stroke-width', 2);
    
    // Add animation
    if (opts.animate) {
      const totalLength = linePath.getTotalLength();
      linePath.setAttribute('stroke-dasharray', totalLength);
      linePath.setAttribute('stroke-dashoffset', totalLength);
      
      const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      animation.setAttribute('attributeName', 'stroke-dashoffset');
      animation.setAttribute('from', totalLength);
      animation.setAttribute('to', 0);
      animation.setAttribute('dur', '1s');
      animation.setAttribute('fill', 'freeze');
      linePath.appendChild(animation);
    }
    
    // Create area if needed
    if (opts.showArea) {
      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      chart.insertBefore(areaPath, linePath); // Add area behind line
      
      // Create path data for area
      let areaData = pathData;
      areaData += ` L ${points[points.length - 1].x} ${chartHeight}`;
      areaData += ` L ${points[0].x} ${chartHeight}`;
      areaData += ' Z';
      
      areaPath.setAttribute('d', areaData);
      areaPath.setAttribute('fill', opts.lineColor);
      areaPath.setAttribute('fill-opacity', opts.areaOpacity);
      areaPath.setAttribute('stroke', 'none');
      
      // Add animation
      if (opts.animate) {
        const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animation.setAttribute('attributeName', 'opacity');
        animation.setAttribute('from', 0);
        animation.setAttribute('to', 1);
        animation.setAttribute('dur', '1s');
        animation.setAttribute('fill', 'freeze');
        areaPath.appendChild(animation);
        areaPath.setAttribute('opacity', 0);
      }
    }
    
    // Add points
    if (opts.showPoints) {
      points.forEach((p, i) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', p.x);
        circle.setAttribute('cy', p.y);
        circle.setAttribute('r', 4);
        circle.setAttribute('fill', opts.pointColor);
        circle.setAttribute('stroke', 'var(--bg-secondary)');
        circle.setAttribute('stroke-width', 1);
        
        // Add tooltip
        circle.setAttribute('data-tooltip', `${data[i].x}: ${data[i].y}`);
        
        // Add animation
        if (opts.animate) {
          const animation = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
          animation.setAttribute('attributeName', 'opacity');
          animation.setAttribute('from', 0);
          animation.setAttribute('to', 1);
          animation.setAttribute('dur', '1s');
          animation.setAttribute('fill', 'freeze');
          circle.appendChild(animation);
          circle.setAttribute('opacity', 0);
        }
        
        chart.appendChild(circle);
      });
    }
    
    container.appendChild(svg);
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