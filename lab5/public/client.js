/**
 * Client-side JavaScript for Physical Fitness Test Form
 * Handles form submissions, API requests, and UI updates
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
    
    // API base URL - update if your server runs on a different port
    const API_BASE_URL = '/api';
    
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
        
        // Export button
        exportBtn.addEventListener('click', handleExport);
        
        // Initial data load
        refreshRecordsList();
    }
    
    /**
     * Handle form submission (create or update record)
     * @param {Event} event - Form submit event
     */
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        showStatus('Saving data...', false);
        
        try {
            // Get form data
            const formData = new FormData(fitnessForm);
            const recordData = {};
            
            // Handle checkbox values (multiple selections)
            const exerciseTypes = [];
            
            for (let [key, value] of formData.entries()) {
                if (key === 'exercise_type') {
                    exerciseTypes.push(value);
                } else if (key !== 'edit-id') { // Skip edit-id for now
                    recordData[key] = value;
                }
            }
            
            // Add exercise types to record data
            recordData.exercise_type = exerciseTypes;
            
            // Check if we're updating or creating
            const editId = document.getElementById('edit-id').value;
            let response;
            
            if (editId) {
                // Update existing record
                response = await fetch(`${API_BASE_URL}/records/${editId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recordData)
                });
            } else {
                // Add new record
                response = await fetch(`${API_BASE_URL}/records`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(recordData)
                });
            }
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            // Show success message
            showStatus(editId ? 'Record updated successfully!' : 'Record saved successfully!', true);
            
            // Reset form and refresh display
            fitnessForm.reset();
            document.getElementById('edit-id').value = '';
            document.getElementById('submit-btn').textContent = 'Save Data';
            
            // Refresh records and switch to records tab
            await refreshRecordsList();
            switchTab('records-tab');
            
        } catch (error) {
            console.error('Error saving record:', error);
            showStatus(`Error: ${error.message}`, false, true);
        }
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
    }
    
    /**
     * Refresh the records list display
     */
    async function refreshRecordsList() {
        try {
            // Show loading state
            recordsList.innerHTML = '<div class="spinner"></div> Loading records...';
            
            // Fetch records from API
            const response = await fetch(`${API_BASE_URL}/records`);
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const records = await response.json();
            
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
        } catch (error) {
            console.error('Error fetching records:', error);
            recordsList.innerHTML = `<div class="status-message status-error">Error: ${error.message}</div>`;
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
    async function editRecord(id) {
        try {
            // Show loading state
            showStatus('Loading record data...', false);
            
            // Fetch the record data from API
            const response = await fetch(`${API_BASE_URL}/records/${id}`);
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const record = await response.json();
            
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
            
            // Clear status message
            clearStatus();
            
        } catch (error) {
            console.error('Error editing record:', error);
            showStatus(`Error: ${error.message}`, false, true);
        }
    }
    
    /**
     * Delete a record
     * @param {string} id - Record ID to delete
     */
    async function deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                // Show loading state
                showStatus('Deleting record...', false);
                
                // Delete record from API
                const response = await fetch(`${API_BASE_URL}/records/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                
                // Show success message and refresh
                showStatus('Record deleted successfully!', true);
                await refreshRecordsList();
                
            } catch (error) {
                console.error('Error deleting record:', error);
                showStatus(`Error: ${error.message}`, false, true);
            }
        }
    }
    
    /**
     * Handle export button click
     */
    function handleExport() {
        const format = dataFormatSelector.value;
        window.location.href = `${API_BASE_URL}/export/${format}`;
    }
    
    /**
     * Show status message
     * @param {string} message - Message to display
     * @param {boolean} success - Whether it's a success message
     * @param {boolean} isError - Whether it's an error message
     */
    function showStatus(message, success, isError = false) {
        // Remove any existing status messages
        clearStatus();
        
        // Create status message element
        const statusEl = document.createElement('div');
        statusEl.className = `status-message ${isError ? 'status-error' : (success ? 'status-success' : '')}`;
        statusEl.textContent = message;
        
        // Add loading spinner if not success or error
        if (!success && !isError) {
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            statusEl.prepend(spinner);
        }
        
        // Add to form
        fitnessForm.appendChild(statusEl);
        
        // Auto-clear success messages after 3 seconds
        if (success) {
            setTimeout(() => {
                statusEl.remove();
            }, 3000);
        }
    }
    
    /**
     * Clear all status messages
     */
    function clearStatus() {
        const statusMessages = document.querySelectorAll('.status-message');
        statusMessages.forEach(el => el.remove());
    }
});