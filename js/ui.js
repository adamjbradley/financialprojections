/**
 * UI Module - DOM Manipulation and Event Handlers
 * APAC Revenue Projections System
 */

// Tab switching functionality
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Find the tab that matches the name
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName.toLowerCase()) || 
            (tabName === 'setup' && tab.textContent.includes('Setup')) ||
            (tabName === 'projections' && tab.textContent.includes('Projections')) ||
            (tabName === 'analysis' && tab.textContent.includes('Analysis')) ||
            (tabName === 'demographics' && tab.textContent.includes('Demographics')) ||
            (tabName === 'models' && tab.textContent.includes('Models'))) {
            tab.classList.add('active');
        }
    });
    
    // Show corresponding content
    const content = document.getElementById(tabName);
    if (content) {
        content.classList.add('active');
    }
    
    // Special handling for demographics tab
    if (tabName === 'demographics') {
        // Auto-show demographic overview by default
        setTimeout(() => {
            if (typeof showDemographicOverview === 'function') {
                showDemographicOverview();
            }
        }, 100);
    }
}

// Render segments in the UI
window.renderSegments = function() {
    console.log('renderSegments called with', window.segments.length, 'segments');
    console.log('Segments to render:', window.segments.map(s => ({id: s.id, name: s.name})));
    
    const container = document.getElementById('segmentsList');
    
    // Handle missing filter elements gracefully
    const searchFilterElement = document.getElementById('segmentSearchFilter');
    const searchFilter = searchFilterElement ? searchFilterElement.value.toLowerCase() : '';
    
    const categoryFilterElement = document.getElementById('categoryFilter');
    const categoryFilter = categoryFilterElement ? categoryFilterElement.value : '';
    
    if (!container) {
        console.error('segmentsList container not found');
        return;
    }
    
    // Filter segments
    let filteredSegments = window.segments;
    
    if (searchFilter) {
        filteredSegments = filteredSegments.filter(segment => 
            segment.name.toLowerCase().includes(searchFilter) ||
            (segment.notes && segment.notes.toLowerCase().includes(searchFilter))
        );
    }
    
    if (categoryFilter && categoryFilter !== 'all') {
        filteredSegments = filteredSegments.filter(segment => 
            segment.category === categoryFilter
        );
    }
    
    if (filteredSegments.length === 0) {
        container.innerHTML = `
            <div class="no-segments">
                <div class="no-segments-icon">📊</div>
                <div class="no-segments-message">
                    ${window.segments.length === 0 ? 'No SKUs added yet' : 'No SKUs match your filters'}
                </div>
                <div class="no-segments-action">
                    ${window.segments.length === 0 ? 
                        '<button class="btn-primary" onclick="loadPensionModel()">📊 Load Pension Model</button>' :
                        '<button class="btn-secondary" onclick="document.getElementById(\'segmentSearchFilter\').value=\'\'; document.getElementById(\'categoryFilter\').value=\'all\'; renderSegments();">Clear Filters</button>'
                    }
                </div>
            </div>
        `;
        return;
    }
    
    // Show bulk actions if any segments are selected
    const bulkActionsHTML = window.selectedSegments.size > 0 ? `
        <div class="segment-bulk-actions show">
            <div class="bulk-actions-header">
                <span>${window.selectedSegments.size} segment(s) selected</span>
                <div class="bulk-actions-buttons">
                    <button class="btn-secondary btn-small" onclick="window.selectedSegments.clear(); updateBulkActionsVisibility(); window.renderSegments();">Clear Selection</button>
                    <button class="btn-warning btn-small" onclick="duplicateSelectedSegments()">📋 Duplicate</button>
                    <button class="btn-warning btn-small" onclick="deleteSelectedSegments()">🗑️ Delete</button>
                </div>
            </div>
        </div>
    ` : '';
    
    let segmentsHTML = bulkActionsHTML;
    
    // Group segments by category for better organization
    const groupedSegments = {};
    filteredSegments.forEach(segment => {
        const category = segment.category || 'Other';
        if (!groupedSegments[category]) {
            groupedSegments[category] = [];
        }
        groupedSegments[category].push(segment);
    });
    
    // Render each category
    Object.keys(groupedSegments).sort().forEach(category => {
        const categorySegments = groupedSegments[category];
        
        segmentsHTML += `
            <div class="segment-category-group">
                <div class="segment-category-header">
                    <h4>${category} (${categorySegments.length})</h4>
                </div>
        `;
        
        categorySegments.forEach(segment => {
            const isSelected = window.selectedSegments.has(segment.id);
            const price = segment.pricePerTransaction || 0;
            const cost = segment.costPerTransaction || 0;
            const volume = segment.monthlyVolume || 0;
            
            const profitMargin = price > 0 ? ((price - cost) / price * 100) : 0;
            const monthlyRevenue = volume * price;
            
            segmentsHTML += `
                <div class="segment-card ${isSelected ? 'selected' : ''}" data-segment-id="${segment.id}">
                    <div class="segment-card-header">
                        <div class="segment-select">
                            <input type="checkbox" 
                                   id="select-${segment.id}" 
                                   ${isSelected ? 'checked' : ''}
                                   onchange="window.toggleSegmentSelection('${segment.id}')">
                            <label for="select-${segment.id}"></label>
                        </div>
                        <div class="segment-info">
                            <h3 class="segment-name">${segment.name}</h3>
                            <div class="segment-category-badge category-${segment.category || 'other'}">
                                ${segment.category || 'Other'}
                            </div>
                        </div>
                        <div class="segment-actions">
                            <button class="segment-action-btn edit" onclick="window.editSegment('${segment.id}')" title="Edit Segment">
                                ✏️ Edit
                            </button>
                            <button class="segment-action-btn duplicate" onclick="window.duplicateSegment('${segment.id}')" title="Duplicate Segment">
                                📋 Duplicate
                            </button>
                            <button class="segment-action-btn delete" onclick="window.deleteSegment('${segment.id}')" title="Delete Segment">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                    
                    <div class="segment-metrics">
                        <div class="metric">
                            <span class="metric-label">Price:</span>
                            <span class="metric-value">₹${(segment.pricePerTransaction || 0).toFixed(2)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Cost:</span>
                            <span class="metric-value">₹${(segment.costPerTransaction || 0).toFixed(2)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Volume:</span>
                            <span class="metric-value">${window.formatNumber(segment.monthlyVolume || 0)}/month</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Growth:</span>
                            <span class="metric-value">${segment.volumeGrowth || 0}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Margin:</span>
                            <span class="metric-value profit-${profitMargin >= 50 ? 'high' : profitMargin >= 20 ? 'medium' : 'low'}">
                                ${(profitMargin || 0).toFixed(1)}%
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Monthly Revenue:</span>
                            <span class="metric-value">${formatCurrency(monthlyRevenue)}</span>
                        </div>
                    </div>
                    
                    ${segment.notes ? `
                        <div class="segment-notes">
                            <span class="notes-label">Notes:</span>
                            <span class="notes-text">${segment.notes}</span>
                        </div>
                    ` : ''}
                    
                    ${segment.createdAt ? `
                        <div class="segment-metadata">
                            <small>Created: ${formatDate(segment.createdAt)} | Updated: ${formatDate(segment.updatedAt || segment.createdAt)}</small>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        segmentsHTML += '</div>';
    });
    
    container.innerHTML = segmentsHTML;
    
    // Update profitability warning
    const profitabilityElement = document.getElementById('profitabilityCheck');
    if (profitabilityElement && typeof window.validateProfitability === 'function') {
        profitabilityElement.innerHTML = window.validateProfitability();
    }
};

// Chart update function
function updateChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const metric = document.getElementById('chartMetric').value;
    const view = document.getElementById('chartView').value;
    const period = document.getElementById('chartPeriod').value;
    
    if (window.chart) {
        window.chart.destroy();
    }
    
    // Generate data based on selected period
    const chartData = generateChartData(period);
    window.currentTableData = chartData;
    
    let datasets = [];
    let labels = chartData.map(item => item.month);
    
    if (view === 'total') {
        // Single dataset for total view
        let data;
        let label;
        let color;
        
        switch (metric) {
            case 'revenue':
                data = chartData.map(item => item.revenue / 1000000); // Convert to millions
                label = 'Revenue (₹ Millions)';
                color = '#3b82f6';
                break;
            case 'profit':
                data = chartData.map(item => item.netProfit / 1000000); // Convert to millions
                label = 'Net Profit (₹ Millions)';
                color = '#22c55e';
                break;
            case 'margin':
                data = chartData.map(item => item.profitMargin);
                label = 'Profit Margin (%)';
                color = '#f59e0b';
                break;
            case 'volume':
                data = chartData.map(item => item.volume / 1000000); // Convert to millions
                label = 'Transaction Volume (Millions)';
                color = '#8b5cf6';
                break;
        }
        
        datasets.push({
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: color + '20',
            fill: true,
            tension: 0.4
        });
    } else {
        // Multiple datasets for segments view
        const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];
        
        window.segments.forEach((segment, index) => {
            const segmentData = window.segmentProjections[segment.name];
            if (!segmentData) return;
            
            // Only show data that matches the chart period
            const relevantData = segmentData.slice(0, chartData.length);
            
            let data;
            switch (metric) {
                case 'revenue':
                    data = relevantData.map(item => item.revenue / 1000000);
                    break;
                case 'profit':
                    data = relevantData.map(item => (item.profit || 0) / 1000000);
                    break;
                case 'margin':
                    data = relevantData.map(item => item.margin || 0);
                    break;
                case 'volume':
                    data = relevantData.map(item => item.volume / 1000000);
                    break;
            }
            
            datasets.push({
                label: segment.name,
                data: data,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                fill: false,
                tension: 0.4
            });
        });
    }
    
    window.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: datasets[0]?.label || 'Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Period'
                    }
                }
            },
            plugins: {
                legend: {
                    display: view === 'segments',
                    position: 'top'
                },
                title: {
                    display: true,
                    text: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Projection - ${period}`
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // Update table display
    displayResults();
}

// Modal functionality
function showModal(title, content, showCloseButton = true) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('dynamicModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dynamicModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modalTitle"></h2>
                    ${showCloseButton ? '<button class="modal-close" onclick="closeModal()">&times;</button>' : ''}
                </div>
                <div class="modal-body" id="modalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update modal content
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Close modal on background click
    modal.onclick = function(e) {
        if (e.target === modal && showCloseButton) {
            closeModal();
        }
    };
}

function closeModal() {
    const modal = document.getElementById('dynamicModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize segment types and predefined data
function initializeSegmentTypes() {
    // This function is called on page load to set up initial UI state
    updatePredefinedSegments();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize demographic insights
    if (typeof initializeDemographicData === 'function') {
        initializeDemographicData();
    }
}

function setupEventListeners() {
    // Search and filter listeners
    const searchFilter = document.getElementById('segmentSearchFilter');
    if (searchFilter) {
        searchFilter.addEventListener('input', debounce(() => {
            window.renderSegments();
        }, 300));
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            window.renderSegments();
        });
    }
    
    // Chart control listeners
    const chartMetric = document.getElementById('chartMetric');
    const chartView = document.getElementById('chartView');
    const chartPeriod = document.getElementById('chartPeriod');
    
    if (chartMetric) chartMetric.addEventListener('change', updateChart);
    if (chartView) chartView.addEventListener('change', updateChart);
    if (chartPeriod) chartPeriod.addEventListener('change', updateChart);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S to save current model
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (typeof showSaveModelDialog === 'function') {
            showSaveModelDialog();
        }
    }
    
    // Ctrl/Cmd + Enter to calculate projections
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (typeof calculateProjections === 'function') {
            calculateProjections();
        }
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        closeModal();
        // Close other dialogs
        const dialogs = document.querySelectorAll('.modal-overlay[style*="flex"], .dialog[style*="flex"]');
        dialogs.forEach(dialog => {
            dialog.style.display = 'none';
        });
    }
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update predefined segments dropdown
function updatePredefinedSegments() {
    const segmentType = window.currentSegmentType || 'sku';
    const container = document.getElementById('predefinedSegmentsContainer');
    
    if (!container || !window.predefinedSegments || !window.predefinedSegments[segmentType]) {
        return;
    }
    
    const segments = window.predefinedSegments[segmentType];
    let html = '<div class="predefined-segments-grid">';
    
    segments.forEach((segment, index) => {
        html += `
            <div class="predefined-segment-card">
                <div class="predefined-segment-header">
                    <h4>${segment.name}</h4>
                    <span class="category-badge category-${segment.category}">${segment.category}</span>
                </div>
                <div class="predefined-segment-metrics">
                    <div>Price: ₹${segment.price}</div>
                    <div>Cost: ₹${segment.cost}</div>
                    <div>Volume: ${formatNumber(segment.volume)}</div>
                    <div>Growth: ${segment.volumeGrowth}%</div>
                </div>
                <div class="predefined-segment-market">
                    <small>${segment.market}</small>
                </div>
                <button class="btn-primary btn-small" onclick="window.addPredefinedSegment('${segmentType}', ${index})">
                    Add Segment
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// View management functions
function setCurrentView(viewType) {
    window.currentView = viewType;
    
    // Update view toggle buttons
    document.querySelectorAll('.view-toggle button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="setCurrentView('${viewType}')"]`)?.classList.add('active');
    
    // Update display
    if (window.projectionData && window.projectionData.length > 0) {
        displayResults();
    }
}

// Loading states
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
        `;
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const loading = element.querySelector('.loading-state');
        if (loading) {
            loading.remove();
        }
    }
}

// Error handling
function showError(elementId, message, canRetry = false, retryCallback = null) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-message">${message}</div>
                ${canRetry && retryCallback ? `
                    <button class="btn-primary" onclick="${retryCallback}()">Try Again</button>
                ` : ''}
            </div>
        `;
    }
}

// Animation helpers
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = Math.min(progress / duration, 1);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300, callback = null) {
    let start = null;
    const initialOpacity = parseFloat(window.getComputedStyle(element).opacity);
    
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = initialOpacity * (1 - progress / duration);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
            if (callback) callback();
        }
    }
    
    requestAnimationFrame(animate);
}

// Tooltip functionality
function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }, 3000);
}

// Context menu functionality
function showContextMenu(event, menuItems) {
    event.preventDefault();
    
    // Remove existing context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.textContent = item.label;
        menuItem.onclick = () => {
            item.action();
            menu.remove();
        };
        menu.appendChild(menuItem);
    });
    
    document.body.appendChild(menu);
    
    menu.style.left = event.clientX + 'px';
    menu.style.top = event.clientY + 'px';
    
    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function closeContextMenu() {
            menu.remove();
            document.removeEventListener('click', closeContextMenu);
        });
    }, 0);
}

// Progress bar functionality
function updateProgressBar(elementId, progress, text = '') {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
                <div class="progress-text">${text}</div>
            </div>
        `;
    }
}

// Notification system enhancement
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentNode.parentNode.remove()">&times;</button>
        </div>
    `;
    
    // Add to notification container or create one
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentNode) {
            fadeOut(notification, 300, () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            });
        }
    }, duration);
}

// Export UI functions to window for external access
window.switchTab = switchTab;
window.updateChart = updateChart;
window.showModal = showModal;
window.closeModal = closeModal;
window.initializeSegmentTypes = initializeSegmentTypes;
window.updatePredefinedSegments = updatePredefinedSegments;
window.setCurrentView = setCurrentView;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showError = showError;
window.showNotification = showNotification;
window.updateProgressBar = updateProgressBar;