/**
 * Main JavaScript for Physical Fitness Test Form
 * Handles form submissions, tab switching, and data display
 */

document.addEventListener('DOMContentLoaded', () => {
    // Form element
    const fitnessForm = document.getElementById('fitness-form');
    
    // Tab elements
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Records display elements
    const recordsList = document.getElementById('records-list');
    const noRecordsMessage = document.getElementById('no-records');
    
    // Export elements
    const dataFormatSelector = document.getElementById('data-format-selector');
    const exportBtn = document.getElementById('export-btn');
    const downloadBtn = document.getElementById('download-btn');
    const exportContent = document.getElementById('export-content');
    
    // Initialize the app
    initApp();
    
    /**
     * Initialize the application
     */
    function initApp() {
        // Set up event listeners
        fitnessForm.addEventListener('submit', handleFormSubmit);
        fitnessForm.addEventListener('reset', handleFormReset);
        
        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
        
        // Export buttons
        exportBtn.addEventListener('click', generateExport);
        downloadBtn.addEventListener('click', downloadExport);
        
        // Initial data load
        refreshRecordsList();
    }
    
    /**
     * Handle form submission (create or update record)
     * @param {Event} event - Form submit event
     */
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(fitnessForm);
        const recordData = {};
        
        // Handle checkbox values (multiple selections)
        const exerciseTypes = [];
        
        for (let [key, value] of formData.entries()) {
            if (key === 'exercise_type') {
                exerciseTypes.push(value);
            } else {
                recordData[key] = value;
            }
        }
        
        // Add exercise types to record data
        recordData.exercise_type = exerciseTypes;
        
        // Check if we're updating or creating
        const editId = document.getElementById('edit-id').value;
        
        if (editId) {
            // Update existing record
            DataStorage.updateRecord(editId, recordData);
            alert('Record updated successfully!');
        } else {
            // Add new record
            DataStorage.addRecord(recordData);
            alert('Record saved successfully!');
        }
        
        // Reset form and refresh display
        fitnessForm.reset();
        document.getElementById('edit-id').value = '';
        refreshRecordsList();
        
        // Switch to records tab
        switchTab('records-tab');
    }
    
    /**
     * Handle form reset
     */
    function handleFormReset() {
        // Clear the edit ID when form is reset
        document.getElementById('edit-id').value = '';
        document.getElementById('submit-btn').textContent = 'Save Data';
    }
    
    /**
     * Switch between tabs
     * @param {string} tabId - The ID of the tab to switch to
     */
    function switchTab(tabId) {
        // Update tab buttons
        tabs.forEach(tab => {
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update tab content
        tabContents.forEach(content => {
            if (content.id === tabId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });
        
        // If switching to records tab, refresh the list
        if (tabId === 'records-tab') {
            refreshRecordsList();
        }
        
        // If switching to export tab, generate preview
        if (tabId === 'export-tab') {
            generateExport();
        }
    }
    
    /**
     * Refresh the records list display
     */
    function refreshRecordsList() {
        // Get all records
        const records = DataStorage.getAllRecords();
        
        // Clear the current list
        recordsList.innerHTML = '';
        
        // Show/hide no records message
        if (records.length === 0) {
            noRecordsMessage.classList.remove('hidden');
        } else {
            noRecordsMessage.classList.add('hidden');
            
            // Create record items
            records.forEach(record => {
                const recordItem = createRecordItem(record);
                recordsList.appendChild(recordItem);
            });
        }
    }
    
    /**
     * Create a record item element
     * @param {Object} record - The record data
     * @returns {HTMLElement} The record item element
     */
    function createRecordItem(record) {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        
        // Create record header
        const header = document.createElement('h3');
        header.textContent = record.name;
        recordItem.appendChild(header);
        
        // Create record details
        const details = document.createElement('div');
        details.className = 'record-details';
        
        // Add personal info
        details.innerHTML = `
            <p><strong>Age:</strong> ${record.age}</p>
            <p><strong>Gender:</strong> ${record.gender}</p>
            <p><strong>Exercise Frequency:</strong> ${record.exercise_frequency}</p>
            <p><strong>Exercise Types:</strong> ${Array.isArray(record.exercise_type) ? record.exercise_type.join(', ') : record.exercise_type}</p>
            <p><strong>Fitness Goal:</strong> ${record.fitness_goal}</p>
            <p><strong>Fitness Level:</strong> ${record.fitness_level}</p>
            <p><strong>Limitations:</strong> ${record.limitations}</p>
            <p><strong>Exercise Duration:</strong> ${record.exercise_duration}</p>
            <p><strong>Recovery Time:</strong> ${record.recovery_time}</p>
            <p><strong>Created:</strong> ${new Date(record.createdAt).toLocaleString()}</p>
            ${record.updatedAt ? `<p><strong>Updated:</strong> ${new Date(record.updatedAt).toLocaleString()}</p>` : ''}
        `;
        
        recordItem.appendChild(details);
        
        // Add action buttons
        const actions = document.createElement('div');
        actions.className = 'record-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editRecord(record.id));
        actions.appendChild(editBtn);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteRecord(record.id));
        actions.appendChild(deleteBtn);
        
        recordItem.appendChild(actions);
        
        return recordItem;
    }
    
    /**
     * Edit a record
     * @param {string} id - Record ID to edit
     */
    function editRecord(id) {
        // Get the record data
        const record = DataStorage.getRecordById(id);
        
        if (!record) {
            alert('Record not found!');
            return;
        }
        
        // Fill the form with record data
        document.getElementById('name').value = record.name;
        document.getElementById('age').value = record.age;
        document.getElementById('gender').value = record.gender;
        
        // Set radio buttons
        const radioInputs = ['exercise_frequency', 'exercise_duration', 'recovery_time'];
        radioInputs.forEach(name => {
            const radioElement = document.querySelector(`input[name="${name}"][value="${record[name]}"]`);
            if (radioElement) radioElement.checked = true;
        });
        
        // Set checkboxes for exercise types
        document.querySelectorAll('input[name="exercise_type"]').forEach(checkbox => {
            checkbox.checked = Array.isArray(record.exercise_type) 
                ? record.exercise_type.includes(checkbox.value)
                : record.exercise_type === checkbox.value;
        });
        
        // Set select dropdowns
        document.querySelector('select[name="fitness_goal"]').value = record.fitness_goal;
        document.querySelector('select[name="limitations"]').value = record.limitations;
        
        // Set range input
        document.getElementById('fitness_level').value = record.fitness_level;
        
        // Set the edit ID
        document.getElementById('edit-id').value = record.id;
        
        // Update button text
        document.getElementById('submit-btn').textContent = 'Update Record';
        
        // Switch to form tab
        switchTab('form-tab');
    }
    
    /**
     * Delete a record
     * @param {string} id - Record ID to delete
     */
    function deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            DataStorage.deleteRecord(id);
            refreshRecordsList();
        }
    }
    
    /**
     * Generate export preview
     */
    function generateExport() {
        const format = dataFormatSelector.value;
        
        if (format === 'json') {
            exportContent.textContent = DataStorage.exportToJSON();
        } else if (format === 'xml') {
            exportContent.textContent = DataStorage.exportToXML();
        }
    }
    
    /**
     * Download export file
     */
    function downloadExport() {
        const format = dataFormatSelector.value;
        let content, filename, mimeType;
        
        if (format === 'json') {
            content = DataStorage.exportToJSON();
            filename = 'fitness_records.json';
            mimeType = 'application/json';
        } else if (format === 'xml') {
            content = DataStorage.exportToXML();
            filename = 'fitness_records.xml';
            mimeType = 'application/xml';
        }
        
        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
});