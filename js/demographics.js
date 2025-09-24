/**
 * Demographics Module - APAC Data Loading and Analysis
 * APAC Revenue Projections System
 */

// Demographics Navigation Functions
function setActiveDemographicNav(activeSection) {
    document.querySelectorAll('.demo-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === activeSection) {
            btn.classList.add('active');
        }
    });
}

window.showDemographicOverview = function() {
    setActiveDemographicNav('overview');
    document.getElementById('demographicOverviewSection').style.display = 'block';
    document.getElementById('countryExplorerSection').style.display = 'none';
    document.getElementById('countryComparisonSection').style.display = 'none';
    document.getElementById('segmentAnalysisSection').style.display = 'none';
    
    // Load demographic overview data
    loadDemographicOverview();
};

window.showCountryExplorer = function() {
    setActiveDemographicNav('explorer');
    document.getElementById('demographicOverviewSection').style.display = 'none';
    document.getElementById('countryExplorerSection').style.display = 'block';
    document.getElementById('countryComparisonSection').style.display = 'none';
    document.getElementById('segmentAnalysisSection').style.display = 'none';
};

window.showCountryComparison = function() {
    setActiveDemographicNav('comparison');
    document.getElementById('demographicOverviewSection').style.display = 'none';
    document.getElementById('countryExplorerSection').style.display = 'none';
    document.getElementById('countryComparisonSection').style.display = 'block';
    document.getElementById('segmentAnalysisSection').style.display = 'none';
};

window.showSegmentAnalysis = function() {
    setActiveDemographicNav('analysis');
    document.getElementById('demographicOverviewSection').style.display = 'none';
    document.getElementById('countryExplorerSection').style.display = 'none';
    document.getElementById('countryComparisonSection').style.display = 'none';
    document.getElementById('segmentAnalysisSection').style.display = 'block';
};

// Load Country Details Function
window.loadCountryDetails = function(countryKey) {
    try {
        const demographicData = window.externalDemographicData || window.regionalData || {};
        
        if (!demographicData || !demographicData[countryKey]) {
            console.error('No demographic data found for country:', countryKey);
            alert('Country demographic data not available yet. Please wait for data to load.');
            return;
        }
        
        const countryData = demographicData[countryKey];
        const country = countryData.country || {};
        const segments = countryData.demographicSegments || [];
        const summary = countryData.summary || {};
        
        // Update country header
        document.getElementById('explorerCountryName').textContent = country.name || countryKey;
        document.getElementById('explorerCountryPopulation').textContent = country.population || 'N/A';
        document.getElementById('explorerCountryCurrency').textContent = country.currency || 'N/A';
        
        // Update summary metrics
        document.getElementById('explorerTotalSegments').textContent = segments.length;
        document.getElementById('explorerAvgAuthRate').textContent = summary.averageAuthRate ? summary.averageAuthRate.toFixed(1) + '%' : 'N/A';
        document.getElementById('explorerAvgPensionRate').textContent = summary.averagePensionRate ? summary.averagePensionRate.toFixed(1) + '%' : 'N/A';
        document.getElementById('explorerAvgDigitalAdoption').textContent = summary.averageDigitalAdoption ? summary.averageDigitalAdoption.toFixed(1) + '%' : 'N/A';
        
        // Build segments table
        let segmentsTableHTML = `
            <thead>
                <tr>
                    <th>Segment Name</th>
                    <th>Population (M)</th>
                    <th>Auth Rate (%)</th>
                    <th>Pension Rate (%)</th>
                    <th>Digital Adoption (%)</th>
                    <th>Economic Tier</th>
                    <th>Urbanization (%)</th>
                    <th>Growth Rate (%)</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        segments.forEach(segment => {
            segmentsTableHTML += `
                <tr>
                    <td><strong>${segment.name}</strong></td>
                    <td>${segment.population}</td>
                    <td>${segment.authPct || 'N/A'}</td>
                    <td>${segment.pensionPct || 'N/A'}</td>
                    <td>${segment.digitalAdoption || 'N/A'}</td>
                    <td><span class="tier-badge tier-${segment.economicTier}">${segment.economicTier}</span></td>
                    <td>${segment.urbanization || 'N/A'}</td>
                    <td>${segment.authGrowthRate || 'N/A'}</td>
                </tr>
            `;
        });
        
        segmentsTableHTML += '</tbody>';
        document.getElementById('explorerSegmentsTable').innerHTML = segmentsTableHTML;
        
    } catch (error) {
        console.error('Error loading country details:', error);
        alert('Error loading country details. Please try again.');
    }
};

// Compare Countries Function
window.compareCountries = function() {
    const country1Key = document.getElementById('compareCountry1').value;
    const country2Key = document.getElementById('compareCountry2').value;
    
    if (!country1Key || !country2Key) {
        alert('Please select both countries to compare');
        return;
    }
    
    const demographicData = window.externalDemographicData || window.regionalData;
    const countries = window.countries || {};
    
    if (!demographicData || !demographicData[country1Key] || !demographicData[country2Key]) {
        alert('Demographic data not available for selected countries');
        return;
    }
    
    const country1Data = demographicData[country1Key];
    const country2Data = demographicData[country2Key];
    
    // Build comparison table
    let comparisonHTML = `
        <div class="comparison-header">
            <h3>Country Comparison: ${country1Data.country?.name || country1Key} vs ${country2Data.country?.name || country2Key}</h3>
        </div>
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>${country1Data.country?.name || country1Key}</th>
                    <th>${country2Data.country?.name || country2Key}</th>
                    <th>Difference</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Basic country metrics
    const metrics = [
        {
            label: 'Total Population (M)',
            value1: country1Data.country?.population || 'N/A',
            value2: country2Data.country?.population || 'N/A',
            type: 'number'
        },
        {
            label: 'Currency',
            value1: country1Data.country?.currency || 'N/A',
            value2: country2Data.country?.currency || 'N/A',
            type: 'text'
        },
        {
            label: 'Total Segments',
            value1: country1Data.demographicSegments?.length || 0,
            value2: country2Data.demographicSegments?.length || 0,
            type: 'number'
        },
        {
            label: 'Avg Auth Rate (%)',
            value1: country1Data.summary?.averageAuthRate || 'N/A',
            value2: country2Data.summary?.averageAuthRate || 'N/A',
            type: 'percentage'
        },
        {
            label: 'Avg Pension Rate (%)',
            value1: country1Data.summary?.averagePensionRate || 'N/A',
            value2: country2Data.summary?.averagePensionRate || 'N/A',
            type: 'percentage'
        },
        {
            label: 'Avg Digital Adoption (%)',
            value1: country1Data.summary?.averageDigitalAdoption || 'N/A',
            value2: country2Data.summary?.averageDigitalAdoption || 'N/A',
            type: 'percentage'
        },
        {
            label: 'Avg Urbanization (%)',
            value1: country1Data.summary?.averageUrbanization || 'N/A',
            value2: country2Data.summary?.averageUrbanization || 'N/A',
            type: 'percentage'
        },
        {
            label: 'Avg Growth Rate (%)',
            value1: country1Data.summary?.averageGrowthRate || 'N/A',
            value2: country2Data.summary?.averageGrowthRate || 'N/A',
            type: 'percentage'
        }
    ];
    
    metrics.forEach(metric => {
        let difference = 'N/A';
        let diffClass = '';
        
        if (metric.type === 'number' || metric.type === 'percentage') {
            const val1 = parseFloat(metric.value1);
            const val2 = parseFloat(metric.value2);
            
            if (!isNaN(val1) && !isNaN(val2)) {
                const diff = val1 - val2;
                difference = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                diffClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
                
                if (metric.type === 'percentage') {
                    difference += '%';
                }
            }
        }
        
        comparisonHTML += `
            <tr>
                <td><strong>${metric.label}</strong></td>
                <td>${metric.value1}</td>
                <td>${metric.value2}</td>
                <td class="diff-${diffClass}">${difference}</td>
            </tr>
        `;
    });
    
    comparisonHTML += '</tbody></table>';
    
    document.getElementById('comparisonResults').innerHTML = comparisonHTML;
};

// Pension Model Loading Functions
function loadPensionModelFromExternal(silent = false) {
    const currentCountry = window.currentCountry || 'india';
    
    // Try to load country-specific regional data
    let demographicData = null;
    let dataType = null;
    
    if (window.externalModelConfig && window.externalModelConfig.regionalData && 
        window.externalModelConfig.regionalData[currentCountry]) {
        
        const countryData = window.externalModelConfig.regionalData[currentCountry];
        
        // Use standardized demographicSegments structure
        if (countryData.demographicSegments) {
            demographicData = countryData.demographicSegments;
            dataType = 'demographic';
        } else if (countryData.pensionStates) {
            demographicData = countryData.pensionStates;
            dataType = 'pension';
        }
    }
    
    if (!demographicData) {
        if (!silent) {
            console.log('No external pension/demographic data available for', currentCountry);
        }
        return false;
    }
    
    // Clear existing segments
    window.segments = [];
    
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    demographicData.forEach(item => {
        const segment = {
            id: Date.now() + Math.random(),
            name: item.name || `${item.stateName || item.segmentName} - ${dataType === 'pension' ? 'Pension Auth' : 'Auth'}`,
            type: 'sku',
            pricePerTransaction: dataType === 'pension' ? 3.50 : (item.pricePerTransaction || 2.50),
            costPerTransaction: dataType === 'pension' ? 2.00 : (item.costPerTransaction || 1.50),
            monthlyVolume: calculateMonthlyVolume(item, dataType),
            volumeGrowth: item.authGrowthRate || item.volumeGrowth || 8,
            category: dataType === 'pension' ? 'biometric' : 'authentication',
            notes: generateSegmentNotes(item, dataType),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        window.segments.push(segment);
    });
    
    if (!silent) {
        showSuccessMessage(`Loaded ${window.segments.length} segments from ${currentCountry} ${dataType} data`);
    }
    
    window.renderSegments();
    updateSegmentCount();
    return true;
}

// Calculate Monthly Volume for Demographics
function calculateMonthlyVolume(item, dataType) {
    const population = parseFloat(item.population) || 0;
    const authPct = parseFloat(item.authPct) || 10;
    const pensionPct = parseFloat(item.pensionPct) || 8;
    const authFreq = parseFloat(item.authFreq) || 1.0;
    
    if (dataType === 'pension') {
        // Pension-specific calculation
        const pensionPopulation = population * (pensionPct / 100);
        return Math.round(pensionPopulation * 1000000 * authFreq);
    } else {
        // General authentication calculation
        const authPopulation = population * (authPct / 100);
        return Math.round(authPopulation * 1000000 * authFreq);
    }
}

// Generate Segment Notes
function generateSegmentNotes(item, dataType) {
    const notes = [];
    
    if (item.economicTier) notes.push(`Economic Tier: ${item.economicTier}`);
    if (item.digitalAdoption) notes.push(`Digital Adoption: ${item.digitalAdoption}%`);
    if (item.urbanization) notes.push(`Urbanization: ${item.urbanization}%`);
    if (dataType === 'pension' && item.pensionPct) notes.push(`Pension Coverage: ${item.pensionPct}%`);
    
    return notes.join(', ');
}

// Main Pension Model Function
function loadPensionModel(silent = false) {
    // Check if external pension states are available
    if (window.externalPensionStates) {
        loadPensionModelFromExternal(silent);
        return;
    }
    
    // Otherwise use the original implementation
    // Clear existing segments
    window.segments = [];
    
    const usdRate = parseFloat(document.getElementById('usdRate').value) || 83.50;
    
    // State-wise pension data with population and coverage percentages
    const statesPensionData = [
        { name: 'UP - Pension Auth', population: 235, pensionPct: 6.4 },
        { name: 'MH - Pension Auth', population: 129, pensionPct: 8.5 },
        { name: 'Bihar - Pension Auth', population: 125, pensionPct: 4.2 },
        { name: 'WB - Pension Auth', population: 105, pensionPct: 10.8 },
        { name: 'MP - Pension Auth', population: 85, pensionPct: 5.8 },
        { name: 'TN - Pension Auth', population: 78, pensionPct: 15.2 },
        { name: 'Rajasthan - Pension Auth', population: 80, pensionPct: 7.1 },
        { name: 'Karnataka - Pension Auth', population: 68, pensionPct: 9.6 },
        { name: 'Gujarat - Pension Auth', population: 64, pensionPct: 8.3 },
        { name: 'AP - Pension Auth', population: 54, pensionPct: 11.4 },
        { name: 'Odisha - Pension Auth', population: 46, pensionPct: 6.9 },
        { name: 'Telangana - Pension Auth', population: 37, pensionPct: 12.8 },
        { name: 'Kerala - Pension Auth', population: 35, pensionPct: 14.8 },
        { name: 'Jharkhand - Pension Auth', population: 39, pensionPct: 5.1 },
        { name: 'Assam - Pension Auth', population: 36, pensionPct: 6.2 },
        { name: 'Punjab - Pension Auth', population: 31, pensionPct: 9.8 },
        { name: 'Chhattisgarh - Pension Auth', population: 29, pensionPct: 5.5 },
        { name: 'Haryana - Pension Auth', population: 28, pensionPct: 8.7 },
        { name: 'Delhi - Pension Auth', population: 19, pensionPct: 7.9 },
        { name: 'Uttarakhand - Pension Auth', population: 11, pensionPct: 8.1 }
    ];
    
    // Generate SKUs based on state pension data
    statesPensionData.forEach(state => {
        // Calculate monthly volume based on pension population
        const pensionPopulation = state.population * (state.pensionPct / 100);
        const monthlyVolume = Math.round(pensionPopulation * 1000000 * 0.8); // 0.8 authentications per month per person
        
        const segment = {
            id: Date.now() + Math.random(),
            name: state.name,
            type: 'sku',
            pricePerTransaction: 3.50, // Higher price for biometric pension authentication
            costPerTransaction: 2.00,
            monthlyVolume: monthlyVolume,
            volumeGrowth: 8 + (Math.random() * 4 - 2), // 6-10% growth with some randomness
            category: 'biometric',
            notes: `State: ${state.name.split(' - ')[0]}, Population: ${state.population}M, Pension Coverage: ${state.pensionPct}%`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        window.segments.push(segment);
    });
    
    if (!silent) {
        showSuccessMessage(`Loaded pension authentication model with ${window.segments.length} state-wise segments!`);
    }
    
    window.renderSegments();
    updateSegmentCount();
}

// Refresh Demographic Insights Function
function refreshDemographicInsights() {
    const currentCountry = window.currentCountry || 'india';
    
    // Get demographic data for current country
    let demographicData = null;
    if (window.externalModelConfig && window.externalModelConfig.regionalData && 
        window.externalModelConfig.regionalData[currentCountry]) {
        const countryData = window.externalModelConfig.regionalData[currentCountry];
        demographicData = countryData.demographicSegments || countryData.pensionStates;
    } else if (window.externalDemographicSegments) {
        demographicData = window.externalDemographicSegments;
    }
    
    if (!demographicData) {
        // Clear all fields
        const fields = ['totalPopulation', 'totalSegments', 'avgAuthRate', 'avgDigitalAdoption', 
                       'avgPensionRate', 'highEconomicSegments', 'mediumEconomicSegments', 
                       'lowEconomicSegments', 'avgGrowthRate', 'fastGrowingSegments', 
                       'revenueOpportunity', 'avgUrbanization', 'highDigitalSegments'];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.textContent = '-';
            }
        });
        return;
    }
    
    // Calculate insights
    const insights = calculateDemographicInsights(demographicData);
    
    // Update UI elements
    Object.keys(insights).forEach(key => {
        const element = document.getElementById(key);
        if (element && insights[key] !== undefined) {
            element.textContent = insights[key];
        }
    });
}

// Calculate Demographic Insights
function calculateDemographicInsights(demographicData) {
    let totalPopulation = 0;
    let totalAuthPopulation = 0;
    let totalPensionPopulation = 0;
    let totalDigitalPopulation = 0;
    let weightedAuthRate = 0;
    let weightedPensionRate = 0;
    let weightedDigitalAdoption = 0;
    let weightedUrbanization = 0;
    let weightedGrowthRate = 0;
    let highEconomicCount = 0;
    let mediumEconomicCount = 0;
    let lowEconomicCount = 0;
    let highDigitalCount = 0;
    let fastGrowingCount = 0;
    let totalRevenuePotential = 0;
    
    demographicData.forEach(segment => {
        const population = parseFloat(segment.population) || 0;
        const authPct = parseFloat(segment.authPct) || 0;
        const pensionPct = parseFloat(segment.pensionPct) || 0;
        const digitalAdoption = parseFloat(segment.digitalAdoption) || 0;
        const urbanization = parseFloat(segment.urbanization) || 0;
        const growthRate = parseFloat(segment.authGrowthRate) || 0;
        const economicTier = segment.economicTier;
        
        totalPopulation += population;
        
        if (authPct > 0) {
            totalAuthPopulation += population;
            weightedAuthRate += (authPct * population);
        }
        
        if (pensionPct > 0) {
            totalPensionPopulation += population;
            weightedPensionRate += (pensionPct * population);
        }
        
        if (digitalAdoption > 0) {
            totalDigitalPopulation += population;
            weightedDigitalAdoption += (digitalAdoption * population);
            
            if (digitalAdoption > 70) {
                highDigitalCount++;
            }
        }
        
        if (urbanization > 0) {
            weightedUrbanization += (urbanization * population);
        }
        
        if (growthRate > 0) {
            weightedGrowthRate += (growthRate * population);
            
            if (growthRate > 10) {
                fastGrowingCount++;
            }
        }
        
        // Count economic tiers
        if (economicTier === 'high') highEconomicCount++;
        else if (economicTier === 'medium') mediumEconomicCount++;
        else if (economicTier === 'low') lowEconomicCount++;
        
        // Calculate potential revenue (simplified)
        const authPopulation = population * (authPct / 100);
        const monthlyTransactions = authPopulation * 1000000 * 1.5; // 1.5 transactions per person per month
        const monthlyRevenue = monthlyTransactions * 2.50; // ₹2.50 per transaction
        totalRevenuePotential += monthlyRevenue * 12; // Annual
    });
    
    // Calculate averages
    const avgAuthRate = totalAuthPopulation > 0 ? (weightedAuthRate / totalAuthPopulation) : 0;
    const avgPensionRate = totalPensionPopulation > 0 ? (weightedPensionRate / totalPensionPopulation) : 0;
    const avgDigitalAdoption = totalDigitalPopulation > 0 ? (weightedDigitalAdoption / totalDigitalPopulation) : 0;
    const avgUrbanization = totalPopulation > 0 ? (weightedUrbanization / totalPopulation) : 0;
    const avgGrowthRate = totalPopulation > 0 ? (weightedGrowthRate / totalPopulation) : 0;
    
    return {
        totalPopulation: totalPopulation.toFixed(1) + 'M',
        totalSegments: demographicData.length,
        avgAuthRate: avgAuthRate.toFixed(1) + '%',
        avgPensionRate: avgPensionRate.toFixed(1) + '%',
        avgDigitalAdoption: avgDigitalAdoption.toFixed(1) + '%',
        avgUrbanization: avgUrbanization.toFixed(1) + '%',
        avgGrowthRate: avgGrowthRate.toFixed(1) + '%',
        highEconomicSegments: highEconomicCount,
        mediumEconomicSegments: mediumEconomicCount,
        lowEconomicSegments: lowEconomicCount,
        highDigitalSegments: highDigitalCount,
        fastGrowingSegments: fastGrowingCount,
        revenueOpportunity: formatCurrency(totalRevenuePotential)
    };
}

// Demographic Overview Loading Function
function loadDemographicOverview() {
    try {
        const demographicData = window.externalDemographicData || window.regionalData || {};
        const countries = window.countries || {};
        
        // Check if demographic data is available
        if (!demographicData || Object.keys(demographicData).length === 0) {
            console.log('No demographic data available, showing placeholder...');
            
            // Update overview cards with placeholder data
            const placeholders = [
                { id: 'totalCountriesOverview', value: '8' },
                { id: 'totalSegmentsOverview', value: 'Loading...' },
                { id: 'totalPopulationOverview', value: 'Loading...' },
                { id: 'avgAuthRateOverview', value: 'Loading...' },
                { id: 'avgPensionRateOverview', value: 'Loading...' }
            ];
            
            placeholders.forEach(placeholder => {
                const element = document.getElementById(placeholder.id);
                if (element) {
                    element.textContent = placeholder.value;
                }
            });
            return;
        }
        
        // Calculate aggregate statistics
        let totalSegments = 0;
        let totalPopulation = 0;
        let weightedAuthRate = 0;
        let weightedPensionRate = 0;
        let weightedDigitalAdoption = 0;
        let totalAuthPopulation = 0;
        let totalPensionPopulation = 0;
        let totalDigitalPopulation = 0;
        
        Object.keys(demographicData).forEach(countryKey => {
            const countryData = demographicData[countryKey];
            const segments = countryData.demographicSegments || [];
            
            totalSegments += segments.length;
            
            segments.forEach(segment => {
                const population = parseFloat(segment.population) || 0;
                const authRate = parseFloat(segment.authPct) || 0;
                const pensionRate = parseFloat(segment.pensionPct) || 0;
                const digitalAdoption = parseFloat(segment.digitalAdoption) || 0;
                
                totalPopulation += population;
                
                if (authRate > 0) {
                    weightedAuthRate += (authRate * population);
                    totalAuthPopulation += population;
                }
                
                if (pensionRate > 0) {
                    weightedPensionRate += (pensionRate * population);
                    totalPensionPopulation += population;
                }
                
                if (digitalAdoption > 0) {
                    weightedDigitalAdoption += (digitalAdoption * population);
                    totalDigitalPopulation += population;
                }
            });
        });
        
        // Calculate averages
        const avgAuthRate = totalAuthPopulation > 0 ? (weightedAuthRate / totalAuthPopulation) : 0;
        const avgPensionRate = totalPensionPopulation > 0 ? (weightedPensionRate / totalPensionPopulation) : 0;
        const avgDigitalAdoption = totalDigitalPopulation > 0 ? (weightedDigitalAdoption / totalDigitalPopulation) : 0;
        
        // Update overview cards
        const overviewData = [
            { id: 'totalCountriesOverview', value: Object.keys(demographicData).length },
            { id: 'totalSegmentsOverview', value: totalSegments },
            { id: 'totalPopulationOverview', value: totalPopulation.toFixed(1) + 'M' },
            { id: 'avgAuthRateOverview', value: avgAuthRate.toFixed(1) + '%' },
            { id: 'avgPensionRateOverview', value: avgPensionRate.toFixed(1) + '%' },
            { id: 'avgDigitalAdoptionOverview', value: avgDigitalAdoption.toFixed(1) + '%' }
        ];
        
        overviewData.forEach(data => {
            const element = document.getElementById(data.id);
            if (element) {
                element.textContent = data.value;
            }
        });
        
        // Build countries table
        buildCountriesOverviewTable(demographicData);
        
    } catch (error) {
        console.error('Error loading demographic overview:', error);
    }
}

// Build Countries Overview Table
function buildCountriesOverviewTable(demographicData) {
    let tableHTML = `
        <thead>
            <tr>
                <th>Country</th>
                <th>Population (M)</th>
                <th>Segments</th>
                <th>Auth Rate (%)</th>
                <th>Pension Rate (%)</th>
                <th>Digital Adoption (%)</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    Object.keys(demographicData).forEach(countryKey => {
        const countryData = demographicData[countryKey];
        const country = countryData.country || {};
        const summary = countryData.summary || {};
        const segments = countryData.demographicSegments || [];
        
        tableHTML += `
            <tr>
                <td>
                    <strong>${country.name || countryKey}</strong>
                    <br><small>${country.currency || 'N/A'}</small>
                </td>
                <td>${country.population || 'N/A'}</td>
                <td>${segments.length}</td>
                <td>${summary.averageAuthRate ? summary.averageAuthRate.toFixed(1) : 'N/A'}</td>
                <td>${summary.averagePensionRate ? summary.averagePensionRate.toFixed(1) : 'N/A'}</td>
                <td>${summary.averageDigitalAdoption ? summary.averageDigitalAdoption.toFixed(1) : 'N/A'}</td>
                <td>
                    <button class="btn-small btn-info" onclick="loadCountryDetails('${countryKey}'); showCountryExplorer();">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody>';
    
    const overviewTable = document.getElementById('countriesOverviewTable');
    if (overviewTable) {
        overviewTable.innerHTML = tableHTML;
    }
}

// Show Demographic Details Modal
function showDemographicDetails() {
    const currentCountry = window.currentCountry || 'india';
    
    // Get demographic data for current country
    let demographicData = null;
    if (window.externalModelConfig && window.externalModelConfig.regionalData && 
        window.externalModelConfig.regionalData[currentCountry]) {
        const countryData = window.externalModelConfig.regionalData[currentCountry];
        demographicData = countryData.demographicSegments || countryData.pensionStates;
    } else if (window.externalDemographicSegments) {
        demographicData = window.externalDemographicSegments;
    }
    
    if (!demographicData) {
        alert('No demographic data available for the current country.');
        return;
    }
    
    let detailsHTML = `
        <div class="demographic-details">
            <h3>Detailed Demographic Breakdown</h3>
            <table class="details-table">
                <thead>
                    <tr>
                        <th>Segment</th>
                        <th>Population (M)</th>
                        <th>Auth Rate (%)</th>
                        <th>Pension Rate (%)</th>
                        <th>Digital Adoption (%)</th>
                        <th>Economic Tier</th>
                        <th>Growth Rate (%)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    demographicData.forEach(segment => {
        detailsHTML += `
            <tr>
                <td><strong>${segment.name || segment.stateName}</strong></td>
                <td>${segment.population || 'N/A'}</td>
                <td>${segment.authPct || 'N/A'}</td>
                <td>${segment.pensionPct || 'N/A'}</td>
                <td>${segment.digitalAdoption || 'N/A'}</td>
                <td><span class="tier-badge tier-${segment.economicTier}">${segment.economicTier || 'N/A'}</span></td>
                <td>${segment.authGrowthRate || 'N/A'}</td>
            </tr>
        `;
    });
    
    detailsHTML += `
                </tbody>
            </table>
        </div>
        <div style="margin-top: 20px; text-align: center;">
            <button class="btn-warning" onclick="loadPensionModel()">Load as Segments</button>
        </div>
    `;
    
    showModal('Demographic Details', detailsHTML);
}

// Initialize demographic data and auto-refresh
function initializeDemographicData() {
    // Try to load from model config as fallback
    if (window.modelConfig && window.modelConfig.regionalData) {
        window.regionalData = window.modelConfig.regionalData;
        console.log('Initialized demographic data from model config');
    }
    
    // Auto-refresh insights
    setTimeout(refreshDemographicInsights, 1000);
}

// Auto-refresh demographic insights when country changes or data loads
function updateDemographicInsightsOnCountryChange() {
    // Add small delay to ensure data is loaded
    setTimeout(refreshDemographicInsights, 500);
}

// Hook into existing country change function if it exists
const originalChangeCountry = window.changeCountry;
if (originalChangeCountry) {
    window.changeCountry = function(country) {
        originalChangeCountry(country);
        updateDemographicInsightsOnCountryChange();
    };
}

// Export functions for external access
window.loadPensionModel = loadPensionModel;
window.refreshDemographicInsights = refreshDemographicInsights;
window.loadDemographicOverview = loadDemographicOverview;
window.showDemographicDetails = showDemographicDetails;
window.initializeDemographicData = initializeDemographicData;