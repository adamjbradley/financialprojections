/**
 * Missing Functions Module - Temporary fixes for missing functionality
 * APAC Revenue Projections System
 */

// Reset all data and forms
window.resetAll = function() {
    if (confirm('Are you sure you want to reset all data? This will clear all segments and projections.')) {
        // Clear segments
        window.segments = [];
        window.projectionData = [];
        
        // Reset form values to defaults
        document.getElementById('startRevenue').value = '0';
        document.getElementById('yearsToProject').value = '5';
        document.getElementById('usdExchangeRate').value = '83.15';
        document.getElementById('inflationRate').value = '4.5';
        document.getElementById('taxRate').value = '30';
        document.getElementById('companyName').value = 'UIDAI India';
        
        // Clear local storage
        localStorage.removeItem('segments');
        localStorage.removeItem('projectionData');
        localStorage.removeItem('savedModels');
        
        // Refresh displays
        if (window.renderSegments) window.renderSegments();
        if (window.updateChart) window.updateChart();
        
        // Show notification
        if (window.showToast) {
            window.showToast('All data has been reset', 'info');
        }
    }
};

// Import segments from JSON file
window.importSegments = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedSegments = JSON.parse(e.target.result);
                    
                    if (Array.isArray(importedSegments)) {
                        window.segments = importedSegments;
                    } else if (importedSegments.segments && Array.isArray(importedSegments.segments)) {
                        window.segments = importedSegments.segments;
                    } else {
                        throw new Error('Invalid segment format');
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('segments', JSON.stringify(window.segments));
                    
                    // Refresh display
                    if (window.renderSegments) window.renderSegments();
                    
                    if (window.showToast) {
                        window.showToast(`Imported ${window.segments.length} segments successfully`, 'success');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    alert('Failed to import segments. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
};

// Export segments to JSON file
window.exportSegments = function() {
    if (!window.segments || window.segments.length === 0) {
        alert('No segments to export');
        return;
    }
    
    const exportData = {
        version: '2.2.0',
        exportDate: new Date().toISOString(),
        segments: window.segments
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `segments_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    if (window.showToast) {
        window.showToast('Segments exported successfully', 'success');
    }
};

// Load predefined segment templates
window.loadPredefinedSegments = function() {
    if (!window.predefinedSegments) {
        alert('No predefined segments available');
        return;
    }
    
    const confirmLoad = confirm('This will replace all current segments with predefined templates. Continue?');
    if (!confirmLoad) return;
    
    // Convert predefined segments to array format
    const segmentTemplates = [];
    
    for (const [key, template] of Object.entries(window.predefinedSegments)) {
        segmentTemplates.push({
            id: Date.now() + Math.random(),
            name: template.name,
            type: 'sku',
            pricePerTransaction: template.price,
            costPerTransaction: template.cost,
            monthlyVolume: template.monthlyVolume,
            volumeGrowth: template.volumeGrowth,
            category: template.category || 'authentication',
            pensionPct: template.pensionPct || 0,
            notes: template.description || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }
    
    window.segments = segmentTemplates;
    
    // Save to localStorage
    localStorage.setItem('segments', JSON.stringify(window.segments));
    
    // Refresh display
    if (window.renderSegments) window.renderSegments();
    
    if (window.showToast) {
        window.showToast(`Loaded ${segmentTemplates.length} predefined segments`, 'success');
    }
};

// Export projections to Excel or CSV
window.exportProjections = function(format) {
    if (!window.projectionData || window.projectionData.length === 0) {
        alert('No projection data to export. Please calculate projections first.');
        return;
    }
    
    if (format === 'excel') {
        if (window.exportToExcel) {
            window.exportToExcel();
        } else {
            alert('Excel export function not available');
        }
    } else if (format === 'csv') {
        if (window.exportToCSV) {
            window.exportToCSV();
        } else if (window.exportTableData) {
            window.exportTableData('csv');
        } else {
            alert('CSV export function not available');
        }
    }
};

// Save current model configuration
window.saveCurrentModel = function() {
    const modelNameInput = document.getElementById('modelName');
    const modelName = modelNameInput ? modelNameInput.value.trim() : '';
    
    if (!modelName) {
        alert('Please enter a model name');
        return;
    }
    
    if (!window.segments || window.segments.length === 0) {
        alert('No segments to save');
        return;
    }
    
    const model = {
        id: Date.now(),
        name: modelName,
        createdAt: new Date().toISOString(),
        segments: window.segments,
        parameters: {
            startRevenue: document.getElementById('startRevenue').value,
            yearsToProject: document.getElementById('yearsToProject').value,
            usdExchangeRate: document.getElementById('usdExchangeRate').value,
            inflationRate: document.getElementById('inflationRate').value,
            taxRate: document.getElementById('taxRate').value,
            companyName: document.getElementById('companyName').value
        },
        projectionData: window.projectionData || []
    };
    
    // Initialize saved models array if needed
    if (!window.savedModels) {
        window.savedModels = [];
    }
    
    window.savedModels.push(model);
    
    // Save to localStorage
    localStorage.setItem('savedModels', JSON.stringify(window.savedModels));
    
    // Clear model name input
    if (modelNameInput) modelNameInput.value = '';
    
    // Refresh saved models display
    if (window.renderSavedModels) {
        window.renderSavedModels();
    } else {
        // Simple display update
        const modelsList = document.getElementById('savedModelsList');
        if (modelsList) {
            const modelDiv = document.createElement('div');
            modelDiv.className = 'saved-model-item';
            modelDiv.innerHTML = `
                <h4>${model.name}</h4>
                <p>Created: ${new Date(model.createdAt).toLocaleString()}</p>
                <p>Segments: ${model.segments.length}</p>
            `;
            modelsList.appendChild(modelDiv);
        }
    }
    
    if (window.showToast) {
        window.showToast(`Model "${modelName}" saved successfully`, 'success');
    }
};

// Export all saved models
window.exportAllModels = function() {
    const models = JSON.parse(localStorage.getItem('savedModels') || '[]');
    
    if (models.length === 0) {
        alert('No saved models to export');
        return;
    }
    
    const exportData = {
        version: '2.2.0',
        exportDate: new Date().toISOString(),
        models: models
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `saved_models_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    if (window.showToast) {
        window.showToast(`Exported ${models.length} models`, 'success');
    }
};

// Import saved models
window.importModels = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    let models;
                    
                    // Handle different formats
                    if (Array.isArray(importedData)) {
                        models = importedData;
                    } else if (importedData.models && Array.isArray(importedData.models)) {
                        models = importedData.models;
                    } else if (importedData.segments) {
                        // This might be a segments export, convert to model
                        models = [{
                            id: Date.now(),
                            name: `Imported from ${file.name}`,
                            createdAt: new Date().toISOString(),
                            segments: Array.isArray(importedData.segments) ? importedData.segments : importedData.segments,
                            parameters: importedData.parameters || {}
                        }];
                    } else if (importedData.name && (importedData.segments || importedData.parameters)) {
                        // Single model object
                        models = [importedData];
                    } else {
                        throw new Error('Invalid file format. Expected models export or segments export.');
                    }
                    
                    // Ensure each model has required fields
                    models = models.map(model => ({
                        id: model.id || Date.now() + Math.random(),
                        name: model.name || 'Imported Model',
                        createdAt: model.createdAt || new Date().toISOString(),
                        segments: model.segments || [],
                        parameters: model.parameters || {},
                        projectionData: model.projectionData || []
                    }));
                    
                    // Merge with existing models
                    const existingModels = JSON.parse(localStorage.getItem('savedModels') || '[]');
                    const mergedModels = [...existingModels, ...models];
                    
                    // Save to localStorage
                    localStorage.setItem('savedModels', JSON.stringify(mergedModels));
                    window.savedModels = mergedModels;
                    
                    // Refresh display - make sure we're on the models tab to see results
                    const currentTab = document.querySelector('.tab-content.active');
                    const isModelsTab = currentTab && currentTab.id === 'models';
                    
                    if (isModelsTab) {
                        window.renderSavedModels();
                    } else {
                        // Switch to models tab to show imported models
                        if (window.switchTab) {
                            window.switchTab('models');
                        }
                    }
                    
                    if (window.showToast) {
                        window.showToast(`Imported ${models.length} model${models.length > 1 ? 's' : ''} successfully`, 'success');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    alert(`Failed to import models: ${error.message}\n\nPlease ensure the file is a valid JSON export from this application.`);
                }
            };
            reader.readAsText(file);
        }
    };
    
    input.click();
};

// Change country selection
window.changeCountry = function(countryKey) {
    console.log('Changing country to:', countryKey);
    
    // Update the current country in config
    if (window.APP_CONFIG) {
        window.APP_CONFIG.currentCountry = countryKey;
    }
    
    // Update UI elements based on country
    const companyNameInput = document.getElementById('companyName');
    if (companyNameInput) {
        const countryNames = {
            'india': 'UIDAI India',
            'singapore': 'Singapore Digital ID',
            'australia': 'Australia Digital Services',
            'japan': 'Japan Digital Agency',
            'south_korea': 'Korea Digital Services',
            'thailand': 'Thailand Digital ID',
            'indonesia': 'Indonesia Digital Services',
            'philippines': 'Philippines Digital ID'
        };
        companyNameInput.value = countryNames[countryKey] || 'Digital Services';
    }
    
    // Load country-specific data
    if (window.loadCountryDetails) {
        window.loadCountryDetails(countryKey);
    }
    
    // Show notification
    if (window.showToast) {
        const countryFlag = {
            'india': '🇮🇳',
            'singapore': '🇸🇬',
            'australia': '🇦🇺',
            'japan': '🇯🇵',
            'south_korea': '🇰🇷',
            'thailand': '🇹🇭',
            'indonesia': '🇮🇩',
            'philippines': '🇵🇭'
        };
        window.showToast(`Switched to ${countryFlag[countryKey] || ''} ${countryKey.charAt(0).toUpperCase() + countryKey.slice(1).replace('_', ' ')}`, 'info');
    }
};

// Render saved models in the UI
window.renderSavedModels = function() {
    const modelsList = document.getElementById('savedModelsList');
    if (!modelsList) return;
    
    const models = JSON.parse(localStorage.getItem('savedModels') || '[]');
    window.savedModels = models;
    
    if (models.length === 0) {
        modelsList.innerHTML = '<p style="text-align: center; color: #666;">No saved models yet. Save your current configuration to get started.</p>';
        return;
    }
    
    modelsList.innerHTML = '';
    
    models.forEach((model, index) => {
        const modelDiv = document.createElement('div');
        modelDiv.className = 'saved-model-item';
        modelDiv.style.cssText = 'border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px; background: #f9f9f9;';
        
        const createdDate = new Date(model.createdAt).toLocaleDateString();
        const createdTime = new Date(model.createdAt).toLocaleTimeString();
        
        modelDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #333;">${model.name}</h4>
                    <p style="margin: 0; font-size: 0.9em; color: #666;">
                        Created: ${createdDate} at ${createdTime}<br>
                        Segments: ${model.segments ? model.segments.length : 0}<br>
                        ${model.parameters ? `Company: ${model.parameters.companyName || 'N/A'}` : ''}
                    </p>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="loadModelById(${model.id})" style="padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Load</button>
                    <button onclick="deleteModel(${model.id})" style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
        
        modelsList.appendChild(modelDiv);
    });
};

// Load saved models on startup
window.loadSavedModels = function() {
    const models = JSON.parse(localStorage.getItem('savedModels') || '[]');
    window.savedModels = models;
    
    // Render the models if we're on the models tab
    const modelsTab = document.getElementById('models');
    if (modelsTab && modelsTab.classList.contains('active')) {
        window.renderSavedModels();
    }
    
    console.log(`Loaded ${models.length} saved models from localStorage`);
};

// Load a specific model by ID
window.loadModelById = function(modelId) {
    const models = JSON.parse(localStorage.getItem('savedModels') || '[]');
    const model = models.find(m => m.id === modelId);
    
    if (!model) {
        alert('Model not found');
        return;
    }
    
    if (confirm(`Load model "${model.name}"? This will replace your current configuration.`)) {
        console.log('Loading model:', model);
        
        // Load segments - ensure they're an array
        if (model.segments && Array.isArray(model.segments)) {
            window.segments = [...model.segments]; // Create a copy
            console.log(`Loading ${window.segments.length} segments from model`);
            
            // Ensure each segment has required fields
            window.segments = window.segments.map(seg => ({
                id: seg.id || Date.now() + Math.random(),
                name: seg.name || 'Unnamed Segment',
                type: seg.type || 'sku',
                pricePerTransaction: seg.pricePerTransaction || 0,
                costPerTransaction: seg.costPerTransaction || 0,
                monthlyVolume: seg.monthlyVolume || 0,
                volumeGrowth: seg.volumeGrowth || 0,
                category: seg.category || 'authentication',
                pensionPct: seg.pensionPct || 0,
                notes: seg.notes || '',
                createdAt: seg.createdAt || new Date().toISOString(),
                updatedAt: seg.updatedAt || new Date().toISOString()
            }));
            
            // Save to localStorage
            localStorage.setItem('segments', JSON.stringify(window.segments));
            console.log('Segments saved to localStorage');
        } else {
            console.warn('Model has no valid segments array');
            window.segments = [];
        }
        
        // Load parameters
        if (model.parameters) {
            const params = model.parameters;
            const fields = {
                'startRevenue': params.startRevenue,
                'yearsToProject': params.yearsToProject, 
                'usdExchangeRate': params.usdExchangeRate,
                'inflationRate': params.inflationRate,
                'taxRate': params.taxRate,
                'companyName': params.companyName
            };
            
            for (const [fieldId, value] of Object.entries(fields)) {
                if (value !== undefined && value !== null) {
                    const element = document.getElementById(fieldId);
                    if (element) {
                        element.value = value;
                        console.log(`Set ${fieldId} to ${value}`);
                    }
                }
            }
        }
        
        // Load projection data if available
        if (model.projectionData && Array.isArray(model.projectionData)) {
            window.projectionData = [...model.projectionData];
            if (window.updateChart) {
                setTimeout(() => window.updateChart(), 100);
            }
        }
        
        // Switch to setup tab and force render
        if (window.switchTab) {
            window.switchTab('setup');
        }
        
        // Force re-render of segments after a short delay
        setTimeout(() => {
            if (window.renderSegments) {
                console.log('Force rendering segments');
                window.renderSegments();
            }
        }, 200);
        
        if (window.showToast) {
            window.showToast(`Loaded model: ${model.name} (${window.segments.length} segments)`, 'success');
        }
    }
};

// Delete a specific model
window.deleteModel = function(modelId) {
    const models = JSON.parse(localStorage.getItem('savedModels') || '[]');
    const modelIndex = models.findIndex(m => m.id === modelId);
    
    if (modelIndex === -1) {
        alert('Model not found');
        return;
    }
    
    const modelName = models[modelIndex].name;
    
    if (confirm(`Delete model "${modelName}"? This cannot be undone.`)) {
        models.splice(modelIndex, 1);
        localStorage.setItem('savedModels', JSON.stringify(models));
        window.savedModels = models;
        
        // Refresh display
        window.renderSavedModels();
        
        if (window.showToast) {
            window.showToast(`Deleted model: ${modelName}`, 'info');
        }
    }
};

// Clear all saved models
window.clearAllModels = function() {
    if (confirm('Delete ALL saved models? This cannot be undone.')) {
        localStorage.removeItem('savedModels');
        window.savedModels = [];
        window.renderSavedModels();
        
        if (window.showToast) {
            window.showToast('All saved models deleted', 'info');
        }
    }
};

// Update switchTab to render saved models when switching to models tab
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabName) {
    // Call original switchTab if it exists
    if (originalSwitchTab) {
        originalSwitchTab(tabName);
    }
    
    // Render saved models when switching to models tab
    if (tabName === 'models') {
        window.renderSavedModels();
    }
};

console.log('Missing functions module loaded');