/**
 * Export Module - Excel/CSV Export Functionality
 * APAC Revenue Projections System
 */

// Main export function for table data
function exportTableData(format) {
    const tableData = window.currentTableData || window.projectionData;
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    const periodElement = document.getElementById('chartPeriod');
    const selectedPeriod = periodElement ? periodElement.value : '1Y';
    const isLongPeriod = ['5Y', '10Y'].includes(selectedPeriod);
    const showMonthly = document.getElementById('monthlyBreakdown')?.checked || false;
    
    let exportData = tableData;
    let filename = `revenue_projections_${selectedPeriod}`;
    
    // If long period and not showing monthly, use yearly aggregation
    if (isLongPeriod && !showMonthly) {
        exportData = aggregateDataByYear(tableData);
        filename += '_yearly';
    } else {
        filename += selectedPeriod === '1M' ? '_daily' : '_monthly';
    }
    
    if (format === 'csv') {
        exportToCSV(exportData, filename, usdRate);
    } else if (format === 'excel') {
        exportToExcel(exportData, filename, usdRate);
    }
}

// CSV Export Function
function exportToCSV(data, filename, usdRate) {
    let csvContent = '';
    
    // Headers
    if (data[0] && data[0].year !== undefined) {
        // Yearly data
        csvContent = 'Year,Revenue (INR),Revenue (USD),COGS (INR),COGS (USD),Net Profit (INR),Net Profit (USD),Transaction Volume,Profit Margin (%)\n';
        data.forEach(row => {
            csvContent += `${row.year},"₹${row.revenue.toLocaleString('en-IN')}","$${(row.revenue/usdRate).toLocaleString('en-US')}","₹${row.cogs.toLocaleString('en-IN')}","$${(row.cogs/usdRate).toLocaleString('en-US')}","₹${row.netProfit.toLocaleString('en-IN')}","$${(row.netProfit/usdRate).toLocaleString('en-US')}",${row.volume.toLocaleString('en-IN')},${row.profitMargin.toFixed(1)}\n`;
        });
    } else {
        // Monthly/Daily data
        csvContent = 'Period,Revenue (INR),Revenue (USD),COGS (INR),COGS (USD),Net Profit (INR),Net Profit (USD),Transaction Volume,Profit Margin (%)\n';
        data.forEach(row => {
            csvContent += `${row.month},"₹${row.revenue.toLocaleString('en-IN')}","$${(row.revenue/usdRate).toLocaleString('en-US')}","₹${row.cogs.toLocaleString('en-IN')}","$${(row.cogs/usdRate).toLocaleString('en-US')}","₹${row.netProfit.toLocaleString('en-IN')}","$${(row.netProfit/usdRate).toLocaleString('en-US')}",${row.volume.toLocaleString('en-IN')},${row.profitMargin.toFixed(1)}\n`;
        });
    }
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
}

// Excel Export Function with XLSX library
function exportToExcel(data, filename, usdRate) {
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        console.warn('XLSX library not available, falling back to CSV export');
        exportToCSV(data, filename, usdRate);
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = [];
    
    if (data[0] && data[0].year !== undefined) {
        // Yearly data headers
        excelData.push(['Year', 'Revenue (INR)', 'Revenue (USD)', 'COGS (INR)', 'COGS (USD)', 'Net Profit (INR)', 'Net Profit (USD)', 'Transaction Volume', 'Profit Margin (%)']);
        data.forEach(row => {
            excelData.push([
                row.year,
                row.revenue,
                row.revenue/usdRate,
                row.cogs,
                row.cogs/usdRate,
                row.netProfit,
                row.netProfit/usdRate,
                row.volume,
                row.profitMargin
            ]);
        });
    } else {
        // Monthly/Daily data headers
        excelData.push(['Period', 'Revenue (INR)', 'Revenue (USD)', 'COGS (INR)', 'COGS (USD)', 'Net Profit (INR)', 'Net Profit (USD)', 'Transaction Volume', 'Profit Margin (%)']);
        data.forEach(row => {
            excelData.push([
                row.month,
                row.revenue,
                row.revenue/usdRate,
                row.cogs,
                row.cogs/usdRate,
                row.netProfit,
                row.netProfit/usdRate,
                row.volume,
                row.profitMargin
            ]);
        });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, 'Revenue Projections');
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Comprehensive Excel Export Function (Full Analysis)  
window.exportToExcel = function exportToExcel() {
    if (window.projectionData.length === 0) {
        alert('No projection data to export. Please calculate projections first.');
        return;
    }
    
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        alert('Excel export requires the XLSX library. This feature exports data as CSV instead.');
        exportToCSV();
        return;
    }
    
    const wb = XLSX.utils.book_new();
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    // 1. Main Projections Sheet
    const mainData = window.projectionData.map(row => ({
        'Month': row.month,
        'Revenue (INR)': row.revenue,
        'Revenue (USD)': row.revenue / usdRate,
        'COGS (INR)': row.cogs,
        'COGS (USD)': row.cogs / usdRate,
        'Gross Profit (INR)': row.grossProfit,
        'Gross Profit (USD)': row.grossProfit / usdRate,
        'Operating Expenses (INR)': row.operatingExpenses,
        'Operating Expenses (USD)': row.operatingExpenses / usdRate,
        'Net Profit (INR)': row.netProfit,
        'Net Profit (USD)': row.netProfit / usdRate,
        'Profit Margin (%)': row.profitMargin,
        'Transaction Volume': row.volume,
        'Cumulative Revenue (INR)': row.cumulativeRevenue,
        'Cumulative Revenue (USD)': row.cumulativeRevenue / usdRate
    }));
    
    const mainSheet = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(wb, mainSheet, 'Main Projections');
    
    // 2. Segment Breakdown Sheet (if segments exist)
    if (window.segments.length > 0) {
        const segmentData = [];
        
        window.projectionData.forEach((monthData, monthIndex) => {
            window.segments.forEach(segment => {
                const segmentProjection = window.segmentProjections[segment.name][monthIndex];
                
                segmentData.push({
                    'Month': monthData.month,
                    'Segment Name': segment.name,
                    'Category': segment.category || 'N/A',
                    'Price per Transaction (INR)': segment.pricePerTransaction,
                    'Price per Transaction (USD)': segment.pricePerTransaction / usdRate,
                    'Cost per Transaction (INR)': segment.costPerTransaction,
                    'Cost per Transaction (USD)': segment.costPerTransaction / usdRate,
                    'Monthly Volume': segmentProjection.volume,
                    'Revenue (INR)': segmentProjection.revenue,
                    'Revenue (USD)': segmentProjection.revenue / usdRate,
                    'Cost (INR)': segmentProjection.cost || 0,
                    'Cost (USD)': (segmentProjection.cost || 0) / usdRate,
                    'Profit (INR)': segmentProjection.profit || 0,
                    'Profit (USD)': (segmentProjection.profit || 0) / usdRate,
                    'Profit Margin (%)': segmentProjection.margin || 0,
                    'Volume Growth (%)': segment.volumeGrowth,
                    'Notes': segment.notes || ''
                });
            });
        });
        
        const segmentSheet = XLSX.utils.json_to_sheet(segmentData);
        XLSX.utils.book_append_sheet(wb, segmentSheet, 'Segment Details');
    }
    
    // 3. Summary Statistics Sheet
    const totalRevenue = window.projectionData.reduce((sum, row) => sum + row.revenue, 0);
    const totalProfit = window.projectionData.reduce((sum, row) => sum + row.netProfit, 0);
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100) : 0;
    const totalVolume = window.projectionData.reduce((sum, row) => sum + row.volume, 0);
    
    const summaryData = [
        { 'Metric': 'Total Revenue (INR)', 'Value': totalRevenue, 'Value (USD)': totalRevenue / usdRate },
        { 'Metric': 'Total Net Profit (INR)', 'Value': totalProfit, 'Value (USD)': totalProfit / usdRate },
        { 'Metric': 'Average Profit Margin (%)', 'Value': avgProfitMargin, 'Value (USD)': avgProfitMargin },
        { 'Metric': 'Total Transaction Volume', 'Value': totalVolume, 'Value (USD)': totalVolume },
        { 'Metric': 'Average Monthly Revenue (INR)', 'Value': totalRevenue / window.projectionData.length, 'Value (USD)': (totalRevenue / window.projectionData.length) / usdRate },
        { 'Metric': 'Average Monthly Profit (INR)', 'Value': totalProfit / window.projectionData.length, 'Value (USD)': (totalProfit / window.projectionData.length) / usdRate },
        { 'Metric': 'Exchange Rate (INR/USD)', 'Value': usdRate, 'Value (USD)': 1 },
        { 'Metric': 'Projection Period (Months)', 'Value': window.projectionData.length, 'Value (USD)': window.projectionData.length },
        { 'Metric': 'Number of Segments', 'Value': window.segments.length, 'Value (USD)': window.segments.length }
    ];
    
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // 4. Segment Configuration Sheet
    if (window.segments.length > 0) {
        const segmentConfigData = window.segments.map(segment => ({
            'Segment ID': segment.id,
            'Name': segment.name,
            'Type': segment.type,
            'Category': segment.category || 'N/A',
            'Price per Transaction (INR)': segment.pricePerTransaction,
            'Price per Transaction (USD)': segment.pricePerTransaction / usdRate,
            'Cost per Transaction (INR)': segment.costPerTransaction,
            'Cost per Transaction (USD)': segment.costPerTransaction / usdRate,
            'Monthly Volume': segment.monthlyVolume,
            'Volume Growth (% annually)': segment.volumeGrowth,
            'Margin (%)': segment.pricePerTransaction > 0 ? ((segment.pricePerTransaction - segment.costPerTransaction) / segment.pricePerTransaction * 100) : 0,
            'Notes': segment.notes || '',
            'Created At': segment.createdAt || '',
            'Updated At': segment.updatedAt || ''
        }));
        
        const segmentConfigSheet = XLSX.utils.json_to_sheet(segmentConfigData);
        XLSX.utils.book_append_sheet(wb, segmentConfigSheet, 'Segment Config');
    }
    
    // 5. Demographic Data Sheet (if available)
    if (window.externalDemographicSegments && window.externalDemographicSegments.length > 0) {
        const demographicExportData = window.externalDemographicSegments.map(segment => ({
            'Segment Name': segment.name,
            'Population (Millions)': segment.population || 'N/A',
            'Authentication Rate (%)': segment.authPct || 'N/A',
            'Pension Rate (%)': segment.pensionPct || 'N/A',
            'Authentication Frequency': segment.authFreq || 'N/A',
            'Digital Adoption (%)': segment.digitalAdoption || 'N/A',
            'Economic Tier': segment.economicTier || 'N/A',
            'Urbanization (%)': segment.urbanization || 'N/A',
            'Auth Growth Rate (%)': segment.authGrowthRate || 'N/A'
        }));
        
        const demographicSheet = XLSX.utils.json_to_sheet(demographicExportData);
        XLSX.utils.book_append_sheet(wb, demographicSheet, 'Demographics');
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `APAC_Revenue_Projections_${timestamp}`;
    
    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Fallback CSV Export Function
window.exportToCSV = function exportToCSVLegacy() {
    if (window.projectionData.length === 0) {
        alert('No projection data to export. Please calculate projections first.');
        return;
    }
    
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    // Create CSV content
    let csvContent = "Month,Revenue (INR),Revenue (USD),COGS (INR),COGS (USD),Net Profit (INR),Net Profit (USD),Profit Margin (%)\n";
    
    window.projectionData.forEach(row => {
        csvContent += [
            row.month,
            row.revenue.toFixed(2),
            (row.revenue / usdRate).toFixed(2),
            row.cogs.toFixed(2),
            (row.cogs / usdRate).toFixed(2),
            row.netProfit.toFixed(2),
            (row.netProfit / usdRate).toFixed(2),
            row.profitMargin.toFixed(1)
        ].join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `APAC_Revenue_Projections_${timestamp}.csv`;
    link.click();
}

// Export Demographic Data Function
function exportDemographicData() {
    const currentCountry = window.currentCountry || 'india';
    
    // Get demographic data for current country
    let demographicData = null;
    let countryData = null;
    
    if (window.externalModelConfig && window.externalModelConfig.regionalData && 
        window.externalModelConfig.regionalData[currentCountry]) {
        countryData = window.externalModelConfig.regionalData[currentCountry];
        demographicData = countryData.demographicSegments || countryData.pensionStates;
    } else if (window.externalDemographicSegments) {
        demographicData = window.externalDemographicSegments;
    }
    
    if (!demographicData || demographicData.length === 0) {
        alert('No demographic data available for export.');
        return;
    }
    
    // Check if XLSX library is available
    if (typeof XLSX === 'undefined') {
        console.warn('XLSX library not available, exporting as CSV');
        exportDemographicCSV(demographicData, currentCountry);
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // 1. Main demographic data
    const exportData = demographicData.map(segment => ({
        'Segment Name': segment.name || segment.stateName,
        'Population (Millions)': segment.population || 'N/A',
        'Authentication Rate (%)': segment.authPct || 'N/A',
        'Pension Rate (%)': segment.pensionPct || 'N/A',
        'Authentication Frequency': segment.authFreq || 'N/A',
        'Digital Adoption (%)': segment.digitalAdoption || 'N/A',
        'Economic Tier': segment.economicTier || 'N/A',
        'Urbanization (%)': segment.urbanization || 'N/A',
        'Auth Growth Rate (%)': segment.authGrowthRate || 'N/A',
        'Notes': segment.notes || ''
    }));
    
    const mainSheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, mainSheet, 'Demographics');
    
    // 2. Summary statistics if available
    if (countryData && countryData.summary) {
        const summaryData = Object.entries(countryData.summary).map(([key, value]) => ({
            'Metric': key,
            'Value': value
        }));
        
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    }
    
    // 3. Country information if available
    if (countryData && countryData.country) {
        const countryInfo = Object.entries(countryData.country).map(([key, value]) => ({
            'Property': key,
            'Value': value
        }));
        
        const countrySheet = XLSX.utils.json_to_sheet(countryInfo);
        XLSX.utils.book_append_sheet(wb, countrySheet, 'Country Info');
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${currentCountry}_demographics_${timestamp}`;
    
    // Write file
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Export Demographic Data as CSV (fallback)
function exportDemographicCSV(demographicData, countryKey) {
    let csvContent = 'Segment Name,Population (M),Auth Rate (%),Pension Rate (%),Auth Frequency,Digital Adoption (%),Economic Tier,Urbanization (%),Auth Growth Rate (%)\n';
    
    demographicData.forEach(segment => {
        csvContent += [
            `"${segment.name || segment.stateName}"`,
            segment.population || 'N/A',
            segment.authPct || 'N/A',
            segment.pensionPct || 'N/A',
            segment.authFreq || 'N/A',
            segment.digitalAdoption || 'N/A',
            segment.economicTier || 'N/A',
            segment.urbanization || 'N/A',
            segment.authGrowthRate || 'N/A'
        ].join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `${countryKey}_demographics_${timestamp}.csv`;
    link.click();
}

// Export Model Configuration Function
function exportModelConfiguration() {
    if (window.segments.length === 0) {
        alert('No segments available to export. Please add segments first.');
        return;
    }
    
    const configuration = {
        metadata: {
            exportedAt: new Date().toISOString(),
            version: '4.0.0',
            description: 'APAC Revenue Projections Model Configuration',
            segments: window.segments.length
        },
        settings: {
            projectionMonths: parseInt(document.getElementById('projectionMonths')?.value) || 12,
            usdRate: parseFloat(document.getElementById('usdRate')?.value) || 83.50,
            seasonality: document.getElementById('seasonality')?.value || 'none',
            operatingExpenseType: document.getElementById('operatingExpenseType')?.value || 'fixed',
            operatingExpenses: parseFloat(document.getElementById('operatingExpenses')?.value) || 0,
            operatingExpensePercentage: parseFloat(document.getElementById('operatingExpensePercentage')?.value) || 0
        },
        segments: window.segments,
        currentCountry: window.currentCountry || 'india'
    };
    
    // Create JSON string with formatting
    const jsonContent = JSON.stringify(configuration, null, 2);
    
    // Create and download file
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `model_configuration_${timestamp}.json`;
    link.click();
}

// Export Scenario Analysis Results
function exportScenarioResults() {
    // This function would export scenario analysis results
    // Implementation depends on how scenario results are stored
    alert('Scenario export functionality will be implemented based on scenario analysis structure.');
}

// Utility function to format data for export
function formatExportValue(value, type = 'number') {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
        case 'currency':
            return typeof value === 'number' ? value.toFixed(2) : value;
        case 'percentage':
            return typeof value === 'number' ? value.toFixed(1) + '%' : value;
        case 'number':
            return typeof value === 'number' ? value.toLocaleString() : value;
        default:
            return value.toString();
    }
}

// Export functions to window for external access
window.exportTableData = exportTableData;
window.exportToExcel = exportToExcel;
window.exportToCSV = exportToCSV;
window.exportDemographicData = exportDemographicData;
window.exportModelConfiguration = exportModelConfiguration;
window.exportScenarioResults = exportScenarioResults;