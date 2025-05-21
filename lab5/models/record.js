/**
 * Record model for fitness test app
 * Handles data operations including file storage
 */

const fs = require('fs-extra');
const path = require('path');
const { Builder } = require('xml2js');
const { parseString } = require('xml2js');
const { promisify } = require('util');

// Convert xml2js parseString to Promise-based
const parseStringPromise = promisify(parseString);

// File paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const JSON_FILE = path.join(DATA_DIR, 'records.json');
const XML_FILE = path.join(DATA_DIR, 'records.xml');

// Ensure data directory and files exist
fs.ensureDirSync(DATA_DIR);

// Initialize files if they don't exist
if (!fs.existsSync(JSON_FILE)) {
  fs.writeJSONSync(JSON_FILE, [], { spaces: 2 });
}

if (!fs.existsSync(XML_FILE)) {
  const initialXml = '<?xml version="1.0" encoding="UTF-8"?>\n<fitnessRecords></fitnessRecords>';
  fs.writeFileSync(XML_FILE, initialXml);
}

/**
 * Get all records from the JSON file
 * @returns {Promise<Array>} Array of record objects
 */
const getAllRecords = async () => {
  try {
    return fs.readJSON(JSON_FILE);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return [];
  }
};

/**
 * Save all records to both JSON and XML files
 * @param {Array} records - Array of record objects
 * @returns {Promise<void>}
 */
const saveAllRecords = async (records) => {
  try {
    // Save to JSON file
    await fs.writeJSON(JSON_FILE, records, { spaces: 2 });
    
    // Save to XML file
    const builder = new Builder({ 
      rootName: 'fitnessRecords',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    
    // Transform records for XML structure
    const xmlRecords = {
      record: records.map(record => {
        return {
          id: record.id,
          createdAt: record.createdAt,
          ...(record.updatedAt && { updatedAt: record.updatedAt }),
          personalInfo: {
            name: record.name,
            age: record.age,
            gender: record.gender
          },
          fitnessData: {
            exerciseFrequency: record.exercise_frequency,
            exerciseTypes: {
              type: Array.isArray(record.exercise_type) 
                ? record.exercise_type.filter(t => t) 
                : (record.exercise_type ? [record.exercise_type] : [])
            },
            fitnessGoal: record.fitness_goal,
            fitnessLevel: record.fitness_level,
            limitations: record.limitations,
            exerciseDuration: record.exercise_duration,
            recoveryTime: record.recovery_time
          }
        };
      })
    };
    
    const xml = builder.buildObject(xmlRecords);
    await fs.writeFile(XML_FILE, xml);
  } catch (error) {
    console.error('Error saving records:', error);
    throw error;
  }
};

/**
 * Get a record by ID
 * @param {string} id - Record ID
 * @returns {Promise<Object|null>} The record or null if not found
 */
const getRecordById = async (id) => {
  try {
    const records = await getAllRecords();
    return records.find(record => record.id === id) || null;
  } catch (error) {
    console.error('Error getting record by ID:', error);
    return null;
  }
};

/**
 * Add a new record
 * @param {Object} record - The form data record to add
 * @returns {Promise<Object>} The added record with ID
 */
const addRecord = async (record) => {
  try {
    const records = await getAllRecords();
    
    // Create a new ID (timestamp + random to ensure uniqueness)
    const newRecord = {
      ...record,
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    
    // Ensure exercise_type is always an array
    if (record.exercise_type && !Array.isArray(record.exercise_type)) {
      newRecord.exercise_type = [record.exercise_type];
    } else if (!record.exercise_type) {
      newRecord.exercise_type = [];
    }
    
    records.push(newRecord);
    await saveAllRecords(records);
    return newRecord;
  } catch (error) {
    console.error('Error adding record:', error);
    throw error;
  }
};

/**
 * Update an existing record
 * @param {string} id - Record ID to update
 * @param {Object} updatedData - New data to merge with existing record
 * @returns {Promise<Object|null>} Updated record or null if not found
 */
const updateRecord = async (id, updatedData) => {
  try {
    const records = await getAllRecords();
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Ensure exercise_type is always an array
    if (updatedData.exercise_type && !Array.isArray(updatedData.exercise_type)) {
      updatedData.exercise_type = [updatedData.exercise_type];
    }
    
    // Update record, preserving id and createdAt
    const updatedRecord = {
      ...updatedData,
      id: records[index].id,
      createdAt: records[index].createdAt,
      updatedAt: new Date().toISOString()
    };
    
    records[index] = updatedRecord;
    await saveAllRecords(records);
    return updatedRecord;
  } catch (error) {
    console.error('Error updating record:', error);
    throw error;
  }
};

/**
 * Delete a record by ID
 * @param {string} id - Record ID to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
const deleteRecord = async (id) => {
  try {
    const records = await getAllRecords();
    const initialLength = records.length;
    const filteredRecords = records.filter(record => record.id !== id);
    
    if (filteredRecords.length === initialLength) {
      return false; // Nothing was deleted
    }
    
    await saveAllRecords(filteredRecords);
    return true;
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

/**
 * Export all records to JSON format
 * @returns {Promise<string>} JSON string of all records
 */
const exportToJSON = async () => {
  try {
    const records = await getAllRecords();
    return JSON.stringify(records, null, 2); // Pretty format with 2 spaces
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
};

/**
 * Export all records to XML format
 * @returns {Promise<string>} XML string of all records
 */
const exportToXML = async () => {
  try {
    const xmlContent = await fs.readFile(XML_FILE, 'utf8');
    return xmlContent;
  } catch (error) {
    console.error('Error exporting to XML:', error);
    throw error;
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  addRecord,
  updateRecord,
  deleteRecord,
  exportToJSON,
  exportToXML
};