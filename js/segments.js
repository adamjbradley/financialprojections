/**
 * Segments Module - Segment Management and Operations
 * APAC Revenue Projections System
 */

// Function to open the Add Segment modal
window.addSegment = function() {
    // Clear the form for a new segment
    document.getElementById('segmentName').value = '';
    document.getElementById('segmentType').value = 'sku';
    document.getElementById('pricePerTransaction').value = '1.50';
    document.getElementById('costPerTransaction').value = '0.30';
    document.getElementById('monthlyVolume').value = '1000000';
    document.getElementById('volumeGrowth').value = '15';
    document.getElementById('category').value = 'authentication';
    document.getElementById('pensionPct').value = '12.5';
    document.getElementById('segmentNotes').value = '';
    
    // Set modal title and show
    document.getElementById('modalTitle').textContent = 'Add Segment';
    window.editingSegmentId = null;
    
    // Show the modal
    const modal = document.getElementById('segmentModal');
    modal.classList.add('active');
};

// Function to close the modal
window.closeModal = function() {
    const modal = document.getElementById('segmentModal');
    modal.classList.remove('active');
    window.editingSegmentId = null;
};

// Function to save the segment (called from modal)
window.saveSegment = function() {
    window.addOrUpdateSegment();
};

// Enhanced segment management functions
window.addOrUpdateSegment = function() {
    const name = document.getElementById('segmentName').value.trim();
    const pricePerTransaction = parseFloat(document.getElementById('pricePerTransaction').value);
    const costPerTransaction = parseFloat(document.getElementById('costPerTransaction').value);
    const monthlyVolume = parseFloat(document.getElementById('monthlyVolume').value);
    const volumeGrowth = parseFloat(document.getElementById('volumeGrowth').value) || 5;
    const category = document.getElementById('category').value;
    const notes = document.getElementById('segmentNotes').value.trim();
    
    // Enhanced validation
    const validation = validateSegmentData(name, pricePerTransaction, costPerTransaction, monthlyVolume, volumeGrowth);
    if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
    }
    
    if (window.editingSegmentId) {
        // Update existing segment
        const segmentIndex = window.segments.findIndex(seg => seg.id === window.editingSegmentId);
        if (segmentIndex !== -1) {
            window.segments[segmentIndex] = {
                ...window.segments[segmentIndex],
                name,
                pricePerTransaction,
                costPerTransaction,
                monthlyVolume,
                volumeGrowth,
                category,
                notes,
                updatedAt: new Date().toISOString()
            };
            
            cancelEditSegment();
            showSuccessMessage(`Segment "${name}" updated successfully!`);
        }
    } else {
        // Add new segment
        const newSegment = {
            id: Date.now() + Math.random(),
            name,
            type: window.currentSegmentType,
            pricePerTransaction,
            costPerTransaction,
            monthlyVolume,
            volumeGrowth,
            category,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        window.segments.push(newSegment);
        showSuccessMessage(`Segment "${name}" added successfully!`);
    }
    
    clearSegmentForm();
    
    // Save segments to localStorage
    localStorage.setItem('segments', JSON.stringify(window.segments));
    
    window.renderSegments();
    updateSegmentCount();
    
    // Close the modal after successful save
    window.closeModal();
};

window.clearSegmentForm = function() {
    document.getElementById('segmentName').value = '';
    document.getElementById('pricePerTransaction').value = '';
    document.getElementById('costPerTransaction').value = '';
    document.getElementById('monthlyVolume').value = '';
    document.getElementById('volumeGrowth').value = '5';
    document.getElementById('category').value = 'authentication';
    document.getElementById('segmentNotes').value = '';
    
    // Clear validation errors
    document.querySelectorAll('.validation-error').forEach(el => {
        el.classList.remove('validation-error');
    });
    document.querySelectorAll('.validation-message').forEach(el => {
        el.remove();
    });
};

window.toggleOperatingExpenseInputs = function() {
    const type = document.getElementById('operatingExpenseType').value;
    const fixedGroup = document.getElementById('fixedExpenseGroup');
    const percentageGroup = document.getElementById('percentageExpenseGroup');
    
    switch(type) {
        case 'fixed':
            fixedGroup.style.display = 'block';
            percentageGroup.style.display = 'none';
            break;
        case 'percentage':
            fixedGroup.style.display = 'none';
            percentageGroup.style.display = 'block';
            break;
        case 'hybrid':
            fixedGroup.style.display = 'block';
            percentageGroup.style.display = 'block';
            break;
    }
};

window.validateProfitability = function() {
    if (window.segments.length === 0) return '';
    
    // Calculate total monthly gross profit
    const totalGrossProfit = window.segments.reduce((sum, segment) => {
        const revenue = segment.monthlyVolume * segment.pricePerTransaction;
        const cost = segment.monthlyVolume * segment.costPerTransaction;
        return sum + (revenue - cost);
    }, 0);
    
    // Calculate operating expenses
    const operatingExpenseType = document.getElementById('operatingExpenseType').value;
    let operatingExpenses = 0;
    
    if (operatingExpenseType === 'fixed' || operatingExpenseType === 'hybrid') {
        operatingExpenses += parseFloat(document.getElementById('operatingExpenses').value) || 0;
    }
    
    if (operatingExpenseType === 'percentage' || operatingExpenseType === 'hybrid') {
        const totalRevenue = window.segments.reduce((sum, segment) => 
            sum + (segment.monthlyVolume * segment.pricePerTransaction), 0);
        const percentageExpense = parseFloat(document.getElementById('operatingExpensePercentage').value) || 0;
        operatingExpenses += (totalRevenue * percentageExpense / 100);
    }
    
    const netProfit = totalGrossProfit - operatingExpenses;
    const profitMargin = totalGrossProfit > 0 ? (netProfit / totalGrossProfit) * 100 : 0;
    
    if (netProfit < 0) {
        return `⚠️ Warning: Current configuration will result in negative profit (₹${Math.abs(netProfit).toLocaleString('en-IN')} loss). Consider reducing operating expenses or increasing segment pricing/volume.`;
    } else if (profitMargin < 10) {
        return `⚠️ Warning: Low profit margin (${profitMargin.toFixed(1)}%). Consider optimizing costs or pricing.`;
    } else if (profitMargin > 80) {
        return `💡 Note: Very high profit margin (${profitMargin.toFixed(1)}%). Verify if pricing and costs are realistic.`;
    }
    
    return `✅ Healthy profit margin: ${profitMargin.toFixed(1)}%`;
};

// SKU Edit Dialog Functions
window.editSegment = function(id) {
    // Handle both string and numeric IDs
    const segment = window.segments.find(seg => seg.id == id || seg.id === id);
    if (!segment) {
        console.error('Segment not found for ID:', id, 'Available segments:', window.segments.map(s => ({id: s.id, name: s.name})));
        return;
    }
    
    // Store the ID for the edit dialog
    window.currentEditingSkuId = id;
    
    // Populate edit dialog with segment data
    document.getElementById('editSkuName').value = segment.name;
    document.getElementById('editSkuPrice').value = segment.pricePerTransaction;
    document.getElementById('editSkuCost').value = segment.costPerTransaction;
    document.getElementById('editSkuVolume').value = segment.monthlyVolume;
    document.getElementById('editSkuGrowth').value = segment.volumeGrowth;
    document.getElementById('editSkuCategory').value = segment.category || 'authentication';
    document.getElementById('editSkuNotes').value = segment.notes || '';
    
    // Update dialog title
    document.getElementById('skuEditTitle').textContent = `✏️ Edit SKU: ${segment.name}`;
    
    // Show the edit dialog
    document.getElementById('skuEditDialog').style.display = 'flex';
    document.getElementById('editSkuName').focus();
    
    // Clear any previous validation messages
    const validationDiv = document.getElementById('skuEditValidation');
    validationDiv.style.display = 'none';
};

window.closeSkuEditDialog = function() {
    document.getElementById('skuEditDialog').style.display = 'none';
    window.currentEditingSkuId = null;
    
    // Clear validation messages
    const validationDiv = document.getElementById('skuEditValidation');
    validationDiv.style.display = 'none';
};

window.updateSku = function() {
    if (!window.currentEditingSkuId) return;
    
    // Get form values
    const name = document.getElementById('editSkuName').value.trim();
    const price = parseFloat(document.getElementById('editSkuPrice').value);
    const cost = parseFloat(document.getElementById('editSkuCost').value);
    const volume = parseFloat(document.getElementById('editSkuVolume').value);
    const growth = parseFloat(document.getElementById('editSkuGrowth').value) || 5;
    const category = document.getElementById('editSkuCategory').value;
    const notes = document.getElementById('editSkuNotes').value.trim();
    
    // Validate data
    const validation = validateSkuEditData(name, price, cost, volume, growth);
    if (!validation.isValid) {
        showSkuEditValidationErrors(validation.errors);
        return;
    }
    
    // Find and update the segment
    const segmentIndex = window.segments.findIndex(seg => String(seg.id) === String(window.currentEditingSkuId));
    if (segmentIndex === -1) return;
    
    // Update the segment
    window.segments[segmentIndex] = {
        ...window.segments[segmentIndex],
        name,
        pricePerTransaction: price,
        costPerTransaction: cost,
        monthlyVolume: volume,
        volumeGrowth: growth,
        category,
        notes,
        updatedAt: new Date().toISOString()
    };
    
    // Close dialog and refresh UI
    window.closeSkuEditDialog();
    window.renderSegments();
    showSuccessMessage(`SKU "${name}" updated successfully!`);
};

window.duplicateCurrentSku = function() {
    if (!window.currentEditingSkuId) return;
    
    const originalSegment = window.segments.find(seg => seg.id === window.currentEditingSkuId);
    if (!originalSegment) return;
    
    // Get current form values (in case user made changes)
    const name = document.getElementById('editSkuName').value.trim();
    const price = parseFloat(document.getElementById('editSkuPrice').value);
    const cost = parseFloat(document.getElementById('editSkuCost').value);
    const volume = parseFloat(document.getElementById('editSkuVolume').value);
    const growth = parseFloat(document.getElementById('editSkuGrowth').value) || 5;
    const category = document.getElementById('editSkuCategory').value;
    const notes = document.getElementById('editSkuNotes').value.trim();
    
    // Create duplicate with modified name
    const duplicateName = `${name} (Copy)`;
    const duplicateSegment = {
        id: Date.now() + Math.random(),
        name: duplicateName,
        type: originalSegment.type,
        pricePerTransaction: price,
        costPerTransaction: cost,
        monthlyVolume: volume,
        volumeGrowth: growth,
        category,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    window.segments.push(duplicateSegment);
    window.closeSkuEditDialog();
    window.renderSegments();
    showSuccessMessage(`SKU duplicated as "${duplicateName}"!`);
};

window.deleteCurrentSku = function() {
    if (!window.currentEditingSkuId) return;
    
    const segment = window.segments.find(seg => seg.id === window.currentEditingSkuId);
    if (!segment) return;
    
    if (confirm(`Are you sure you want to delete the SKU "${segment.name}"?\n\nThis action cannot be undone.`)) {
        window.segments = window.segments.filter(seg => seg.id !== window.currentEditingSkuId);
        window.closeSkuEditDialog();
        window.renderSegments();
        showSuccessMessage(`SKU "${segment.name}" deleted successfully!`);
    }
};

window.cancelEditSegment = function() {
    window.editingSegmentId = null;
    
    // Reset button
    const addButton = document.querySelector('button[onclick="addOrUpdateSegment()"]');
    if (addButton) {
        addButton.textContent = 'Add Segment';
        addButton.classList.remove('btn-warning');
        addButton.classList.add('btn-primary');
    }
    
    clearSegmentForm();
    window.renderSegments();
};

window.duplicateSegment = function(id) {
    // Handle both string and numeric IDs
    const segment = window.segments.find(seg => seg.id == id || seg.id === id);
    if (!segment) {
        console.error('Segment not found for duplication, ID:', id);
        return;
    }
    
    const duplicatedSegment = {
        ...segment,
        id: Date.now() + Math.random(),
        name: segment.name + ' (Copy)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    window.segments.push(duplicatedSegment);
    window.renderSegments();
    updateSegmentCount();
    showSuccessMessage(`Segment "${segment.name}" duplicated successfully!`);
};

// Bulk Operations Functions
window.toggleSegmentSelection = function(id) {
    if (window.selectedSegments.has(id)) {
        window.selectedSegments.delete(id);
    } else {
        window.selectedSegments.add(id);
    }
    updateBulkActionsVisibility();
    window.renderSegments();
};

function updateBulkActionsVisibility() {
    const bulkActions = document.querySelector('.segment-bulk-actions');
    if (bulkActions) {
        if (window.selectedSegments.size > 0) {
            bulkActions.classList.add('show');
        } else {
            bulkActions.classList.remove('show');
        }
    }
}

window.duplicateSelectedSegments = function() {
    if (window.selectedSegments.size === 0) {
        alert('Please select segments to duplicate.');
        return;
    }
    
    const segmentsToDuplicate = window.segments.filter(seg => window.selectedSegments.has(seg.id));
    const timestamp = new Date().toISOString();
    
    segmentsToDuplicate.forEach(segment => {
        const duplicatedSegment = {
            ...segment,
            id: Date.now() + Math.random(),
            name: segment.name + ' (Copy)',
            createdAt: timestamp,
            updatedAt: timestamp
        };
        window.segments.push(duplicatedSegment);
    });
    
    window.selectedSegments.clear();
    window.renderSegments();
    updateSegmentCount();
    updateBulkActionsVisibility();
    showSuccessMessage(`${segmentsToDuplicate.length} segment(s) duplicated successfully!`);
};

window.deleteSelectedSegments = function() {
    if (window.selectedSegments.size === 0) {
        alert('Please select segments to delete.');
        return;
    }
    
    const segmentsToDelete = window.segments.filter(seg => window.selectedSegments.has(seg.id));
    const segmentNames = segmentsToDelete.map(seg => seg.name).join(', ');
    
    if (confirm(`Delete ${segmentsToDelete.length} selected segment(s)?\n\n${segmentNames}\n\nThis action cannot be undone.`)) {
        window.segments = window.segments.filter(seg => !window.selectedSegments.has(seg.id));
        window.selectedSegments.clear();
        window.renderSegments();
        updateSegmentCount();
        updateBulkActionsVisibility();
        showSuccessMessage(`${segmentsToDelete.length} segment(s) deleted successfully!`);
    }
};

// Delete with Undo functionality
window.deleteSegment = function(id) {
    // Convert ID to string for consistent comparison
    const targetId = String(id);
    
    // Find segment with string comparison
    const segment = window.segments.find(seg => String(seg.id) === targetId);
    if (!segment) {
        console.error('Segment not found for deletion, ID:', id);
        return;
    }
    
    const deletedSegment = { ...segment };
    const segmentIndex = window.segments.findIndex(seg => String(seg.id) === targetId);
    
    // Remove the segment
    window.segments.splice(segmentIndex, 1);
    
    // Update UI after a brief delay to ensure smooth animation
    setTimeout(() => {
        window.renderSegments();
        updateSegmentCount();
        updateBulkActionsVisibility();
    }, 10);
    
    // Show undo toast
    showUndoToast(`Segment "${deletedSegment.name}" deleted`, () => {
        // Restore the segment at its original position
        window.segments.splice(segmentIndex, 0, deletedSegment);
        setTimeout(() => {
            window.renderSegments();
            updateSegmentCount();
            updateBulkActionsVisibility();
        }, 10);
        showSuccessMessage(`Segment "${deletedSegment.name}" restored!`);
    });
};

// Filter and Search Functions
window.clearFilters = function() {
    document.getElementById('segmentSearchFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    window.renderSegments();
};

window.updateSegmentCount = function updateSegmentCount() {
    const countElement = document.getElementById('segmentCount');
    if (countElement) {
        countElement.textContent = window.segments.length;
    }
}

// Predefined Segment Functions
window.addPredefinedSegment = function(segmentType, index) {
    if (!window.predefinedSegments[segmentType] || !window.predefinedSegments[segmentType][index]) {
        console.error('Predefined segment not found');
        return;
    }
    
    const predefined = window.predefinedSegments[segmentType][index];
    
    // Check if segment already exists
    const existingSegment = window.segments.find(seg => 
        seg.name.toLowerCase() === predefined.name.toLowerCase()
    );
    
    if (existingSegment) {
        alert(`Segment "${predefined.name}" already exists!`);
        return;
    }
    
    const newSegment = {
        id: Date.now() + Math.random(),
        name: predefined.name,
        type: segmentType,
        pricePerTransaction: predefined.price,
        costPerTransaction: predefined.cost,
        monthlyVolume: Math.round(predefined.volume),
        volumeGrowth: predefined.volumeGrowth,
        category: predefined.category,
        notes: `Market: ${predefined.market}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    window.segments.push(newSegment);
    window.renderSegments();
    updateSegmentCount();
    showSuccessMessage(`Added predefined segment: ${predefined.name}`);
};

// Test Functions for Development
window.addTestSegment = function() {
    console.log('Adding enhanced test segment...');
    
    const testSegment = {
        id: Date.now() + Math.random(),
        name: `Test Segment ${window.segments.length + 1}`,
        type: 'sku',
        pricePerTransaction: 2.50,
        costPerTransaction: 1.20,
        monthlyVolume: 1000000,
        volumeGrowth: 8,
        category: 'authentication',
        notes: 'This is a test segment with realistic values',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    window.segments.push(testSegment);
    window.renderSegments();
    updateSegmentCount();
    showSuccessMessage('Test segment added successfully!');
};

// Enhanced predefined segment loading for different business scenarios
window.loadBankingScenario = function() {
    const bankingSegments = [
        { name: 'Account Opening - Premium', price: 25.00, cost: 15.00, volume: 500000, growth: 15, category: 'kyc' },
        { name: 'Transaction Authentication', price: 0.25, cost: 0.15, volume: 50000000, growth: 12, category: 'authentication' },
        { name: 'Loan Verification', price: 35.00, cost: 20.00, volume: 200000, growth: 20, category: 'kyc' }
    ];
    
    loadSegmentScenario(bankingSegments, 'Banking');
};

window.loadTelecomScenario = function() {
    const telecomSegments = [
        { name: 'SIM Activation', price: 18.00, cost: 10.00, volume: 2000000, growth: 10, category: 'kyc' },
        { name: 'Number Portability', price: 15.00, cost: 8.00, volume: 800000, growth: 8, category: 'authentication' },
        { name: 'Premium Service Auth', price: 5.00, cost: 2.50, volume: 5000000, growth: 15, category: 'authentication' }
    ];
    
    loadSegmentScenario(telecomSegments, 'Telecom');
};

function loadSegmentScenario(segmentData, scenarioName) {
    segmentData.forEach(segData => {
        const newSegment = {
            id: Date.now() + Math.random(),
            name: segData.name,
            type: 'sku',
            pricePerTransaction: segData.price,
            costPerTransaction: segData.cost,
            monthlyVolume: segData.volume,
            volumeGrowth: segData.growth,
            category: segData.category,
            notes: `${scenarioName} scenario segment`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        window.segments.push(newSegment);
    });
    
    window.renderSegments();
    updateSegmentCount();
    showSuccessMessage(`${scenarioName} scenario loaded with ${segmentData.length} segments!`);
}