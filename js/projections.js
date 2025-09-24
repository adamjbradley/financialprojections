/**
 * Projections Module - Financial Calculations and Revenue Models
 * APAC Revenue Projections System
 */

// Main projection calculation function
window.calculateProjections = function calculateProjections() {
    const yearsToProject = parseInt(document.getElementById('yearsToProject').value) || 5;
    const months = yearsToProject * 12;
    
    // Check if we have segments
    if (window.segments.length === 0) {
        alert('Please add at least one SKU before calculating projections.');
        return;
    }
    
    window.projectionData = [];
    window.segmentProjections = {};
    const currentDate = new Date();
    
    // Initialize segment projections
    window.segments.forEach(segment => {
        window.segmentProjections[segment.name] = [];
    });
    
    // Calculate monthly projections
    for (let i = 0; i < months; i++) {
        const projectedDate = new Date(currentDate);
        projectedDate.setMonth(currentDate.getMonth() + i);
        const monthLabel = projectedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        let totalMonthRevenue = 0;
        let totalMonthCost = 0;
        let totalMonthVolume = 0;
        
        // Calculate for each segment
        window.segments.forEach(segment => {
            const monthlyGrowthRate = segment.volumeGrowth / 100;
            const seasonalMultiplier = getSeasonalityMultiplier(i, seasonality);
            
            // Calculate volume with growth
            const projectedVolume = segment.monthlyVolume * 
                                  Math.pow(1 + monthlyGrowthRate, i) * 
                                  seasonalMultiplier;
            
            const segmentRevenue = projectedVolume * segment.pricePerTransaction;
            const segmentCost = projectedVolume * segment.costPerTransaction;
            const segmentProfit = segmentRevenue - segmentCost;
            
            window.segmentProjections[segment.name].push({
                month: monthLabel,
                volume: projectedVolume,
                revenue: segmentRevenue,
                cost: segmentCost,
                profit: segmentProfit,
                margin: segmentRevenue > 0 ? (segmentProfit / segmentRevenue * 100) : 0
            });
            
            totalMonthRevenue += segmentRevenue;
            totalMonthCost += segmentCost;
            totalMonthVolume += projectedVolume;
        });
        
        // Calculate operating expenses based on type
        const operatingExpenseType = document.getElementById('operatingExpenseType').value;
        let operatingExpenses = 0;
        
        if (operatingExpenseType === 'fixed' || operatingExpenseType === 'hybrid') {
            operatingExpenses += parseFloat(document.getElementById('operatingExpenses').value) || 0;
        }
        
        if (operatingExpenseType === 'percentage' || operatingExpenseType === 'hybrid') {
            const percentageExpense = parseFloat(document.getElementById('operatingExpensePercentage').value) || 0;
            operatingExpenses += (totalMonthRevenue * percentageExpense / 100);
        }
        
        const netProfit = totalMonthRevenue - totalMonthCost - operatingExpenses;
        const profitMargin = totalMonthRevenue > 0 ? (netProfit / totalMonthRevenue) * 100 : 0;
        
        window.projectionData.push({
            month: monthLabel,
            revenue: totalMonthRevenue,
            cogs: totalMonthCost,
            grossProfit: totalMonthRevenue - totalMonthCost,
            operatingExpenses: operatingExpenses,
            netProfit: netProfit,
            profitMargin: profitMargin,
            volume: totalMonthVolume,
            cumulativeRevenue: i === 0 ? totalMonthRevenue : window.projectionData[i-1].cumulativeRevenue + totalMonthRevenue
        });
    }
    
    // Switch to projections tab and display results
    switchTab('projections');
    displayResults();
}

// Helper function for seasonality multipliers
function getSeasonalityMultiplier(monthIndex, seasonality) {
    if (seasonality === 'none') return 1;
    
    const month = monthIndex % 12;
    const peakMonths = seasonality === 'festival' ? [9, 10, 11] : [5, 6, 7]; // Oct-Dec for festival, Jun-Aug for summer
    
    if (peakMonths.includes(month)) {
        return 1.2; // 20% increase during peak
    } else if (seasonality === 'festival' && [1, 2, 3].includes(month)) {
        return 0.8; // 20% decrease in lean months
    } else if (seasonality === 'summer' && [11, 0, 1].includes(month)) {
        return 0.9; // 10% decrease in winter
    }
    
    return 1; // Normal months
}

// Display functions
function displayResults() {
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').classList.add('fade-in');
    
    // Generate data for current chart period if chart period selector exists
    const periodElement = document.getElementById('chartPeriod');
    const selectedPeriod = periodElement ? periodElement.value : '1Y';
    window.currentTableData = generateChartData(selectedPeriod);
    
    if (window.currentView === 'consolidated') {
        displayConsolidatedResults();
    } else {
        displaySegmentedResults();
    }
    
    updateChart();
}

function displayConsolidatedResults() {
    const tableData = window.currentTableData || window.projectionData;
    const totalRevenue = tableData.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = tableData.reduce((sum, item) => sum + item.netProfit, 0);
    const avgPeriodRevenue = totalRevenue / tableData.length;
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    // Get period for labeling
    const periodElement = document.getElementById('chartPeriod');
    const selectedPeriod = periodElement ? periodElement.value : '1Y';
    const isDaily = selectedPeriod === '1M';
    const periodLabel = isDaily ? 'Daily' : 'Monthly';
    
    document.getElementById('summaryCards').innerHTML = `
        <div class="summary-card">
            <h3>Total Revenue</h3>
            <div class="value">₹${totalRevenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
            <div style="font-size: 1em; opacity: 0.9;">$${(totalRevenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
        </div>
        <div class="summary-card">
            <h3>Total Net Profit</h3>
            <div class="value">₹${totalProfit.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
            <div style="font-size: 1em; opacity: 0.9;">$${(totalProfit/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
        </div>
        <div class="summary-card">
            <h3>Avg ${periodLabel} Revenue</h3>
            <div class="value">₹${avgPeriodRevenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
            <div style="font-size: 1em; opacity: 0.9;">$${(avgPeriodRevenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
        </div>
        <div class="summary-card">
            <h3>Avg Profit Margin</h3>
            <div class="value">${avgProfitMargin.toFixed(1)}%</div>
            <div style="font-size: 0.9em; opacity: 0.9;">Exchange Rate: ₹${usdRate}/USD</div>
        </div>
    `;
    
    displayConsolidatedTable();
    
    if (window.segments.length > 0) {
        displaySegmentBreakdown();
    } else {
        document.getElementById('segmentBreakdown').style.display = 'none';
    }
}

function displaySegmentedResults() {
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    // Display individual segment summary cards
    let segmentCardsHTML = '';
    window.segments.forEach(segment => {
        const segmentData = window.segmentProjections[segment.name];
        const totalRevenue = segmentData.reduce((sum, item) => sum + item.revenue, 0);
        const totalProfit = segmentData.reduce((sum, item) => sum + (item.profit || 0), 0);
        const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
        
        segmentCardsHTML += `
            <div class="summary-card">
                <h3>${segment.name}</h3>
                <div class="value">₹${totalRevenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
                <div style="font-size: 0.9em; opacity: 0.9;">${(totalRevenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
                <div style="font-size: 0.8em; opacity: 0.8; margin-top: 5px;">Margin: ${avgProfitMargin.toFixed(1)}%</div>
            </div>
        `;
    });
    
    document.getElementById('summaryCards').innerHTML = segmentCardsHTML;
    
    // Display segmented table with individual SKU performance
    displaySegmentedTable();
    
    // Hide the consolidated segment breakdown since we're showing individual segments
    document.getElementById('segmentBreakdown').style.display = 'none';
}

// Data aggregation functions
function aggregateDataByYear(data) {
    const yearGroups = {};
    
    data.forEach(row => {
        // Extract year from month string (e.g., "2025 Jan" -> 2025)
        const monthParts = row.month.split(' ');
        let year;
        if (monthParts.length === 2 && !isNaN(parseInt(monthParts[0]))) {
            year = parseInt(monthParts[0]);
        } else {
            // Fallback: parse as date and extract year
            const date = new Date(row.month + ' 1, ' + new Date().getFullYear());
            year = date.getFullYear();
        }
        
        if (!yearGroups[year]) {
            yearGroups[year] = {
                year: year,
                revenue: 0,
                cogs: 0,
                netProfit: 0,
                operatingExpenses: 0,
                volume: 0,
                months: []
            };
        }
        
        yearGroups[year].revenue += row.revenue;
        yearGroups[year].cogs += row.cogs;
        yearGroups[year].netProfit += row.netProfit;
        yearGroups[year].operatingExpenses += row.operatingExpenses;
        yearGroups[year].volume += row.volume;
        yearGroups[year].months.push(row);
    });
    
    // Convert to array and calculate profit margins
    return Object.values(yearGroups).map(yearData => ({
        ...yearData,
        profitMargin: yearData.revenue > 0 ? (yearData.netProfit / yearData.revenue * 100) : 0
    }));
}

// Chart data generation for different periods
function generateChartData(period) {
    if (!window.projectionData || window.projectionData.length === 0) return [];
    
    const currentDate = new Date();
    let data = [];
    
    switch (period) {
        case '1M':
            // Generate daily data for 1 month
            const monthlyData = window.projectionData[0];
            for (let day = 1; day <= 30; day++) {
                const dailyRevenue = monthlyData.revenue / 30;
                const dailyCogs = monthlyData.cogs / 30;
                const dailyOperatingExpenses = monthlyData.operatingExpenses / 30;
                const dailyNetProfit = dailyRevenue - dailyCogs - dailyOperatingExpenses;
                const dailyVolume = monthlyData.volume / 30;
                
                data.push({
                    month: `Day ${day}`,
                    revenue: dailyRevenue,
                    cogs: dailyCogs,
                    operatingExpenses: dailyOperatingExpenses,
                    netProfit: dailyNetProfit,
                    profitMargin: dailyRevenue > 0 ? (dailyNetProfit / dailyRevenue * 100) : 0,
                    volume: dailyVolume
                });
            }
            break;
            
        case '1Y':
            data = window.projectionData.slice(0, 12);
            break;
            
        case '2Y':
            data = window.projectionData.slice(0, 24);
            break;
            
        case '5Y':
            data = window.projectionData.slice(0, 60);
            break;
            
        case '10Y':
            data = window.projectionData.slice(0, 120);
            break;
            
        default:
            data = window.projectionData.slice(0, 12);
    }
    
    return data;
}

// Scenario analysis functions
window.runScenarios = function() {
    // Auto-load pension model if no segments exist
    if (window.segments.length === 0) {
        loadPensionModel(false);
        setTimeout(() => {
            if (window.segments.length > 0) {
                calculateProjections();
            }
        }, 1000);
    } else {
        calculateProjections();
    }
    
    switchTab('analysis');
    
    // Check if we have SKU-based segments for accurate scenario modeling
    if (window.segments.length === 0) {
        document.getElementById('scenarioSection').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <h3>No SKUs Available</h3>
                <p>No SKUs found for scenario analysis. This might happen if the auto-load failed or segments were cleared.</p>
                <div style="margin: 20px 0;">
                    <button class="btn-primary" onclick="loadPensionModel(false); setTimeout(() => { if(window.segments.length > 0) runScenarios(); }, 1000);" style="margin: 5px;">
                        Load Default Pension Model
                    </button>
                    <button class="btn-primary" onclick="switchTab('setup')" style="margin: 5px;">
                        Go to Setup & Add SKUs
                    </button>
                </div>
            </div>
        `;
        document.getElementById('scenarioSection').style.display = 'block';
        return;
    }
    
    // Use external scenario definitions if available, otherwise use defaults
    const scenarios = window.externalScenarioDefinitions || [
        { 
            name: 'Conservative', 
            volumeGrowthMultiplier: 0.6, 
            priceMultiplier: 0.95, 
            costMultiplier: 1.1,
            operatingExpenseMultiplier: 1.15
        },
        { 
            name: 'Base Case', 
            volumeGrowthMultiplier: 1, 
            priceMultiplier: 1, 
            costMultiplier: 1,
            operatingExpenseMultiplier: 1
        },
        { 
            name: 'Optimistic', 
            volumeGrowthMultiplier: 1.5, 
            priceMultiplier: 1.08, 
            costMultiplier: 0.92,
            operatingExpenseMultiplier: 0.95
        }
    ];
    
    const months = parseInt(document.getElementById('projectionMonths').value);
    const seasonality = document.getElementById('seasonality').value;
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    // Calculate base operating expenses
    const operatingExpenseType = document.getElementById('operatingExpenseType').value;
    let baseOperatingExpenses = 0;
    
    if (operatingExpenseType === 'fixed' || operatingExpenseType === 'hybrid') {
        baseOperatingExpenses = parseFloat(document.getElementById('operatingExpenses').value) || 0;
    }
    
    let scenarioHTML = '';
    
    scenarios.forEach(scenario => {
        let totalRevenue = 0;
        let totalCosts = 0;
        let totalOperatingExpenses = 0;
        
        // Calculate scenario projections
        for (let i = 0; i < months; i++) {
            let monthRevenue = 0;
            let monthCosts = 0;
            
            // Calculate for each segment with scenario multipliers
            window.segments.forEach(segment => {
                const monthlyVolume = segment.monthlyVolume || 0;
                const pricePerTransaction = segment.pricePerTransaction || 0;
                const costPerTransaction = segment.costPerTransaction || 0;
                const volumeGrowth = segment.volumeGrowth || 0;
                
                const adjustedVolumeGrowth = (volumeGrowth / 100) * scenario.volumeGrowthMultiplier;
                const adjustedPrice = pricePerTransaction * scenario.priceMultiplier;
                const adjustedCost = costPerTransaction * scenario.costMultiplier;
                const seasonalMultiplier = getSeasonalityMultiplier(i, seasonality);
                
                // Calculate volume with adjusted growth
                const projectedVolume = monthlyVolume * 
                                      Math.pow(1 + adjustedVolumeGrowth, i) * 
                                      seasonalMultiplier;
                
                const segmentRevenue = projectedVolume * adjustedPrice;
                const segmentCost = projectedVolume * adjustedCost;
                
                monthRevenue += segmentRevenue;
                monthCosts += segmentCost;
            });
            
            totalRevenue += monthRevenue;
            totalCosts += monthCosts;
            
            // Add operating expenses for this month
            let monthOperatingExpenses = 0;
            if (operatingExpenseType === 'fixed' || operatingExpenseType === 'hybrid') {
                monthOperatingExpenses += baseOperatingExpenses * scenario.operatingExpenseMultiplier;
            }
            if (operatingExpenseType === 'percentage' || operatingExpenseType === 'hybrid') {
                const percentageExpense = parseFloat(document.getElementById('operatingExpensePercentage').value) || 0;
                monthOperatingExpenses += (monthRevenue * percentageExpense / 100) * scenario.operatingExpenseMultiplier;
            }
            totalOperatingExpenses += monthOperatingExpenses;
        }
        
        const grossProfit = totalRevenue - totalCosts;
        const netProfit = grossProfit - totalOperatingExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0;
        
        const scenarioClass = scenario.name.toLowerCase().replace(' ', '-');
        scenarioHTML += `
            <div class="scenario-card scenario-${scenarioClass}">
                <h3>${scenario.name}</h3>
                <div class="scenario-metrics">
                    <div class="metric">
                        <span class="metric-label">Total Revenue:</span>
                        <span class="metric-value">₹${totalRevenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                        <span class="metric-usd">($${(totalRevenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})})</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Net Profit:</span>
                        <span class="metric-value" style="color: ${netProfit >= 0 ? '#22c55e' : '#ef4444'}">
                            ₹${netProfit.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                        </span>
                        <span class="metric-usd">($${(netProfit/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})})</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Profit Margin:</span>
                        <span class="metric-value">${profitMargin.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="scenario-assumptions">
                    <small>Assumptions: Volume Growth ${(scenario.volumeGrowthMultiplier * 100).toFixed(0)}%, 
                    Price ${(scenario.priceMultiplier * 100).toFixed(0)}%, 
                    Cost ${(scenario.costMultiplier * 100).toFixed(0)}%</small>
                </div>
            </div>
        `;
    });
    
    document.getElementById('scenarioSection').innerHTML = `
        <h2>📊 Scenario Analysis</h2>
        <div class="scenario-grid">
            ${scenarioHTML}
        </div>
    `;
    document.getElementById('scenarioSection').style.display = 'block';
};

// Table display functions
function displayConsolidatedTable() {
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    const tableData = window.currentTableData || window.projectionData;
    
    // Get period for labeling
    const periodElement = document.getElementById('chartPeriod');
    const selectedPeriod = periodElement ? periodElement.value : '1Y';
    const isDaily = selectedPeriod === '1M';
    const isLongPeriod = ['5Y', '10Y'].includes(selectedPeriod);
    const showMonthly = document.getElementById('monthlyBreakdown').checked;
    
    // Show/hide table controls for long periods
    const tableControls = document.getElementById('tableControls');
    if (isLongPeriod) {
        tableControls.style.display = 'block';
    } else {
        tableControls.style.display = 'none';
    }
    
    // Determine data to display
    let displayData = tableData;
    let periodLabel, volumeLabel;
    
    if (isLongPeriod && !showMonthly) {
        // Show yearly aggregated data
        displayData = aggregateDataByYear(tableData);
        periodLabel = 'Year';
        volumeLabel = 'Annual Volume';
    } else {
        // Show month/day data
        periodLabel = isDaily ? 'Day' : 'Month';
        volumeLabel = isDaily ? 'Daily Volume' : 'Monthly Volume';
    }
    
    let tableHTML = `
        <thead>
            <tr>
                <th>${periodLabel}</th>
                <th>Revenue (INR)</th>
                <th>Revenue (USD)</th>
                <th>COGS (INR)</th>
                <th>COGS (USD)</th>
                <th>Net Profit (INR)</th>
                <th>Net Profit (USD)</th>
                <th>${volumeLabel}</th>
                <th>Margin</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // Calculate totals
    const totals = {
        revenue: 0,
        cogs: 0,
        netProfit: 0,
        volume: 0
    };
    
    displayData.forEach((row, index) => {
        totals.revenue += row.revenue;
        totals.cogs += row.cogs;
        totals.netProfit += row.netProfit;
        totals.volume += row.volume;
        
        const periodDisplay = row.year !== undefined ? row.year : row.month;
        const rowId = `row-${index}`;
        const hasMonthlyData = row.months && row.months.length > 0;
        
        tableHTML += `
            <tr id="${rowId}" ${hasMonthlyData ? `onclick="toggleYearExpansion('${rowId}')" style="cursor: pointer;"` : ''}>
                <td>
                    ${hasMonthlyData ? '<span class="expand-icon">▶</span> ' : ''}${periodDisplay}
                </td>
                <td>₹${row.revenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                <td>$${(row.revenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                <td>₹${row.cogs.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                <td>$${(row.cogs/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                <td style="color: ${row.netProfit >= 0 ? '#22c55e' : '#ef4444'}">
                    ₹${row.netProfit.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </td>
                <td style="color: ${row.netProfit >= 0 ? '#22c55e' : '#ef4444'}">
                    $${(row.netProfit/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}
                </td>
                <td>${row.volume.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                <td>${row.profitMargin.toFixed(1)}%</td>
            </tr>
        `;
        
        // Add monthly breakdown rows if in yearly view
        if (hasMonthlyData && showMonthly) {
            row.months.forEach(monthRow => {
                tableHTML += `
                    <tr class="monthly-detail" style="background: #f9f9f9; display: none;" data-parent="${rowId}">
                        <td style="padding-left: 30px;">→ ${monthRow.month}</td>
                        <td>₹${monthRow.revenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                        <td>$${(monthRow.revenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                        <td>₹${monthRow.cogs.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                        <td>$${(monthRow.cogs/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                        <td style="color: ${monthRow.netProfit >= 0 ? '#22c55e' : '#ef4444'}">
                            ₹${monthRow.netProfit.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                        </td>
                        <td style="color: ${monthRow.netProfit >= 0 ? '#22c55e' : '#ef4444'}">
                            $${(monthRow.netProfit/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}
                        </td>
                        <td>${monthRow.volume.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                        <td>${monthRow.profitMargin.toFixed(1)}%</td>
                    </tr>
                `;
            });
        }
    });
    
    // Add totals row
    const totalMargin = totals.revenue > 0 ? ((totals.netProfit / totals.revenue) * 100) : 0;
    tableHTML += `
        <tr style="background: #f8f9fa; font-weight: bold; border-top: 2px solid #dee2e6;">
            <td><strong>TOTAL</strong></td>
            <td><strong>₹${totals.revenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</strong></td>
            <td><strong>$${(totals.revenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</strong></td>
            <td><strong>₹${totals.cogs.toLocaleString('en-IN', {maximumFractionDigits: 0})}</strong></td>
            <td><strong>$${(totals.cogs/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</strong></td>
            <td style="color: ${totals.netProfit >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                <strong>₹${totals.netProfit.toLocaleString('en-IN', {maximumFractionDigits: 0})}</strong>
            </td>
            <td style="color: ${totals.netProfit >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">
                <strong>$${(totals.netProfit/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</strong>
            </td>
            <td><strong>${totals.volume.toLocaleString('en-IN', {maximumFractionDigits: 0})}</strong></td>
            <td><strong>${totalMargin.toFixed(1)}%</strong></td>
        </tr>
    `;
    
    tableHTML += '</tbody>';
    document.getElementById('projectionTable').innerHTML = tableHTML;
}

function displaySegmentedTable() {
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    let tableHTML = `
        <thead>
            <tr>
                <th>Month</th>
                <th>SKU</th>
                <th>Volume</th>
                <th>Revenue (INR)</th>
                <th>Revenue (USD)</th>
                <th>Cost (INR)</th>
                <th>Cost (USD)</th>
                <th>Profit (INR)</th>
                <th>Profit (USD)</th>
                <th>Margin</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    // Create rows for each month and each segment
    window.projectionData.forEach((monthData, monthIndex) => {
        window.segments.forEach((segment, segmentIndex) => {
            const segmentData = window.segmentProjections[segment.name][monthIndex];
            
            tableHTML += `
                <tr>
                    <td>${segmentIndex === 0 ? monthData.month : ''}</td>
                    <td><strong>${segment.name}</strong></td>
                    <td>${segmentData.volume ? (segmentData.volume / 1000000).toFixed(2) + 'M' : 'N/A'}</td>
                    <td>₹${segmentData.revenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                    <td>${(segmentData.revenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                    <td>₹${(segmentData.cost || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}</td>
                    <td>${((segmentData.cost || 0)/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                    <td style="color: ${(segmentData.profit || 0) >= 0 ? '#22c55e' : '#ef4444'}">
                        ₹${(segmentData.profit || 0).toLocaleString('en-IN', {maximumFractionDigits: 0})}
                    </td>
                    <td style="color: ${(segmentData.profit || 0) >= 0 ? '#22c55e' : '#ef4444'}">
                        ${((segmentData.profit || 0)/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}
                    </td>
                    <td>${(segmentData.margin || 0).toFixed(1)}%</td>
                </tr>
            `;
        });
        
        // Add separator row between months
        if (monthIndex < window.projectionData.length - 1) {
            tableHTML += `
                <tr style="background: #f8f9fa;">
                    <td colspan="10" style="height: 1px; padding: 0; border: none;"></td>
                </tr>
            `;
        }
    });
    
    tableHTML += '</tbody>';
    document.getElementById('projectionTable').innerHTML = tableHTML;
}

function displaySegmentBreakdown() {
    if (window.segments.length === 0) return;
    
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    const breakdownHTML = window.segments.map(segment => {
        const segmentData = window.segmentProjections[segment.name];
        const totalRevenue = segmentData.reduce((sum, item) => sum + item.revenue, 0);
        const totalProfit = segmentData.reduce((sum, item) => sum + (item.profit || 0), 0);
        const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
        
        return `
            <div class="segment-summary">
                <h4>${segment.name}</h4>
                <div class="segment-metric">
                    <span class="label">Total Revenue:</span>
                    <span class="value">₹${totalRevenue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                </div>
                <div class="segment-metric">
                    <span class="label">Total Revenue (USD):</span>
                    <span class="value">${(totalRevenue/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                </div>
                <div class="segment-metric">
                    <span class="label">Total Profit:</span>
                    <span class="value">₹${totalProfit.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                </div>
                <div class="segment-metric">
                    <span class="label">Total Profit (USD):</span>
                    <span class="value">${(totalProfit/usdRate).toLocaleString('en-US', {maximumFractionDigits: 0})}</span>
                </div>
                <div class="segment-metric">
                    <span class="label">Profit Margin:</span>
                    <span class="value">${avgProfitMargin.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('segmentBreakdown').innerHTML = `
        <div class="segment-breakdown-header" onclick="toggleSegmentBreakdown()">
            <h3 class="segment-breakdown-title">SKU Breakdown (${window.segments.length} segments)</h3>
            <div class="collapse-toggle">
                <span class="collapse-text">Hide Details</span>
                <span class="collapse-icon">▼</span>
            </div>
        </div>
        <div class="segment-breakdown-content" style="display: block;">
            ${breakdownHTML}
        </div>
    `;
    document.getElementById('segmentBreakdown').style.display = 'block';
}

// Utility functions
function toggleMonthlyBreakdown() {
    displayConsolidatedTable();
}

function toggleYearExpansion(rowId) {
    const row = document.getElementById(rowId);
    const monthlyRows = document.querySelectorAll(`tr[data-parent="${rowId}"]`);
    const expandIcon = row.querySelector('.expand-icon');
    
    if (monthlyRows.length === 0) return;
    
    const isExpanded = monthlyRows[0].style.display !== 'none';
    
    monthlyRows.forEach(monthRow => {
        monthRow.style.display = isExpanded ? 'none' : 'table-row';
    });
    
    if (expandIcon) {
        expandIcon.textContent = isExpanded ? '▶' : '▼';
    }
}

function toggleSegmentBreakdown() {
    const content = document.querySelector('.segment-breakdown-content');
    const text = document.querySelector('.collapse-text');
    const icon = document.querySelector('.collapse-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        text.textContent = 'Hide Details';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        text.textContent = 'Show Details';
        icon.textContent = '▶';
    }
}

// Model calculation helpers
function calculateModelTotalRevenue(model) {
    if (!model || !model.segments) return 0;
    
    const months = parseInt(document.getElementById('projectionMonths').value) || 12;
    let totalRevenue = 0;
    
    model.segments.forEach(segment => {
        for (let i = 0; i < months; i++) {
            const monthlyGrowthRate = segment.volumeGrowth / 100;
            const projectedVolume = segment.monthlyVolume * Math.pow(1 + monthlyGrowthRate, i);
            const segmentRevenue = projectedVolume * segment.pricePerTransaction;
            totalRevenue += segmentRevenue;
        }
    });
    
    return totalRevenue;
}