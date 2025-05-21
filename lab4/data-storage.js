/**
 * Data Storage Module
 * Handles all CRUD operations for fitness form data
 */

const DataStorage = (() => {
    // Storage key in localStorage
    const STORAGE_KEY = 'fitness_test_records';
    
    /**
     * Get all records from storage
     * @returns {Array} Array of record objects
     */
    const getAllRecords = () => {
        const recordsJSON = localStorage.getItem(STORAGE_KEY);
        if (!recordsJSON) {
            return [];
        }
        return JSON.parse(recordsJSON);
    };
    
    /**
     * Save all records to storage
     * @param {Array} records - Array of record objects
     */
    const saveAllRecords = (records) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    };
    
    /**
     * Add a new record
     * @param {Object} record - The form data record to add
     * @returns {Object} The added record with ID
     */
    const addRecord = (record) => {
        const records = getAllRecords();
        // Create a new ID (timestamp + random to ensure uniqueness)
        const newRecord = {
            ...record,
            id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString()
        };
        
        records.push(newRecord);
        saveAllRecords(records);
        return newRecord;
    };
    
    /**
     * Get a record by ID
     * @param {string} id - Record ID
     * @returns {Object|null} The record or null if not found
     */
    const getRecordById = (id) => {
        const records = getAllRecords();
        return records.find(record => record.id === id) || null;
    };
    
    /**
     * Update an existing record
     * @param {string} id - Record ID to update
     * @param {Object} updatedData - New data to merge with existing record
     * @returns {Object|null} Updated record or null if not found
     */
    const updateRecord = (id, updatedData) => {
        const records = getAllRecords();
        const index = records.findIndex(record => record.id === id);
        
        if (index === -1) {
            return null;
        }
        
        // Update record, preserving id and createdAt
        const updatedRecord = {
            ...updatedData,
            id: records[index].id,
            createdAt: records[index].createdAt,
            updatedAt: new Date().toISOString()
        };
        
        records[index] = updatedRecord;
        saveAllRecords(records);
        return updatedRecord;
    };
    
    /**
     * Delete a record by ID
     * @param {string} id - Record ID to delete
     * @returns {boolean} True if deleted, false if not found
     */
    const deleteRecord = (id) => {
        const records = getAllRecords();
        const initialLength = records.length;
        const filteredRecords = records.filter(record => record.id !== id);
        
        if (filteredRecords.length === initialLength) {
            return false; // Nothing was deleted
        }
        
        saveAllRecords(filteredRecords);
        return true;
    };
    
    /**
     * Clear all records
     */
    const clearAllRecords = () => {
        localStorage.removeItem(STORAGE_KEY);
    };
    
    /**
     * Export all records to JSON format
     * @returns {string} JSON string of all records
     */
    const exportToJSON = () => {
        const records = getAllRecords();
        return JSON.stringify(records, null, 2); // Pretty format with 2 spaces
    };
    
    /**
     * Export all records to XML format
     * @returns {string} XML string of all records
     */
    const exportToXML = () => {
        const records = getAllRecords();
        let xml = '<?xml version="1.0" encoding="UTF-8" ?>\n';
        xml += '<fitnessRecords>\n';
        
        records.forEach(record => {
            xml += '  <record>\n';
            xml += `    <id>${escapeXml(record.id)}</id>\n`;
            xml += `    <createdAt>${escapeXml(record.createdAt)}</createdAt>\n`;
            
            if (record.updatedAt) {
                xml += `    <updatedAt>${escapeXml(record.updatedAt)}</updatedAt>\n`;
            }
            
            // Personal information
            xml += '    <personalInfo>\n';
            xml += `      <name>${escapeXml(record.name)}</name>\n`;
            xml += `      <age>${escapeXml(record.age)}</age>\n`;
            xml += `      <gender>${escapeXml(record.gender)}</gender>\n`;
            xml += '    </personalInfo>\n';
            
            // Survey responses
            xml += '    <fitnessData>\n';
            xml += `      <exerciseFrequency>${escapeXml(record.exercise_frequency)}</exerciseFrequency>\n`;
            
            // Handle exercise_type which could be multiple values
            xml += '      <exerciseTypes>\n';
            const exerciseTypes = Array.isArray(record.exercise_type) 
                ? record.exercise_type 
                : [record.exercise_type];
                
            exerciseTypes.forEach(type => {
                if (type) xml += `        <type>${escapeXml(type)}</type>\n`;
            });
            xml += '      </exerciseTypes>\n';
            
            xml += `      <fitnessGoal>${escapeXml(record.fitness_goal)}</fitnessGoal>\n`;
            xml += `      <fitnessLevel>${escapeXml(record.fitness_level)}</fitnessLevel>\n`;
            xml += `      <limitations>${escapeXml(record.limitations)}</limitations>\n`;
            xml += `      <exerciseDuration>${escapeXml(record.exercise_duration)}</exerciseDuration>\n`;
            xml += `      <recoveryTime>${escapeXml(record.recovery_time)}</recoveryTime>\n`;
            xml += '    </fitnessData>\n';
            
            xml += '  </record>\n';
        });
        
        xml += '</fitnessRecords>';
        return xml;
    };
    
    /**
     * Helper function to escape XML special characters
     * @param {string} unsafe - String to escape
     * @returns {string} Safe XML string
     */
    const escapeXml = (unsafe) => {
        if (unsafe === undefined || unsafe === null) return '';
        return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    
    // Public API
    return {
        getAllRecords,
        addRecord,
        getRecordById,
        updateRecord,
        deleteRecord,
        clearAllRecords,
        exportToJSON,
        exportToXML
    };
})();