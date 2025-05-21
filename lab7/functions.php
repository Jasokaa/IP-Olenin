<?php
/**
 * Functions for handling data operations
 */

// File paths
define('DATA_DIR', __DIR__ . '/data');
define('JSON_FILE', DATA_DIR . '/records.json');
define('XML_FILE', DATA_DIR . '/records.xml');

// Ensure data directory exists
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0777, true);
}

// Initialize files if they don't exist
if (!file_exists(JSON_FILE)) {
    file_put_contents(JSON_FILE, json_encode([]));
}

if (!file_exists(XML_FILE)) {
    $initialXml = '<?xml version="1.0" encoding="UTF-8"?><fitnessRecords></fitnessRecords>';
    file_put_contents(XML_FILE, $initialXml);
}

/**
 * Get all records from JSON file
 * @return array Array of records
 */
function getAllRecords() {
    if (!file_exists(JSON_FILE)) {
        return [];
    }
    
    $jsonData = file_get_contents(JSON_FILE);
    return json_decode($jsonData, true) ?: [];
}

/**
 * Get a record by ID
 * @param string $id Record ID
 * @return array|null Record data or null if not found
 */
function getRecordById($id) {
    $records = getAllRecords();
    
    foreach ($records as $record) {
        if ($record['id'] === $id) {
            return $record;
        }
    }
    
    return null;
}

/**
 * Add a new record
 * @param array $data Record data
 * @return array Created record with ID
 */
function addRecord($data) {
    $records = getAllRecords();
    
    // Create a new record with ID and timestamp
    $newRecord = [
        'id' => uniqid() . '-' . mt_rand(1000, 9999),
        'createdAt' => date('c'), // ISO 8601 date
    ];
    
    // Add all form data
    foreach ($data as $key => $value) {
        $newRecord[$key] = $value;
    }
    
    // Add to records array
    $records[] = $newRecord;
    
    // Save to files
    saveAllRecords($records);
    
    return $newRecord;
}

/**
 * Update an existing record
 * @param string $id Record ID
 * @param array $data Updated data
 * @return array|null Updated record or null if not found
 */
function updateRecord($id, $data) {
    $records = getAllRecords();
    $found = false;
    
    foreach ($records as $key => $record) {
        if ($record['id'] === $id) {
            // Create updated record preserving ID and createdAt
            $updatedRecord = [
                'id' => $record['id'],
                'createdAt' => $record['createdAt'],
                'updatedAt' => date('c'), // ISO 8601 date
            ];
            
            // Add all form data
            foreach ($data as $dataKey => $value) {
                if ($dataKey !== 'id' && $dataKey !== 'action') { // Skip id and action
                    $updatedRecord[$dataKey] = $value;
                }
            }
            
            $records[$key] = $updatedRecord;
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        return null;
    }
    
    // Save to files
    saveAllRecords($records);
    
    return $updatedRecord;
}

/**
 * Delete a record by ID
 * @param string $id Record ID
 * @return bool Success status
 */
function deleteRecord($id) {
    $records = getAllRecords();
    $initialCount = count($records);
    
    // Filter out the record to delete
    $records = array_filter($records, function($record) use ($id) {
        return $record['id'] !== $id;
    });
    
    if (count($records) === $initialCount) {
        return false; // Nothing was deleted
    }
    
    // Reindex the array
    $records = array_values($records);
    
    // Save to files
    saveAllRecords($records);
    
    return true;
}

/**
 * Save all records to both JSON and XML files
 * @param array $records Records to save
 */
function saveAllRecords($records) {
    // Save to JSON file
    $jsonData = json_encode($records, JSON_PRETTY_PRINT);
    file_put_contents(JSON_FILE, $jsonData);
    
    // Save to XML file
    $xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><fitnessRecords></fitnessRecords>');
    
    foreach ($records as $record) {
        $recordNode = $xml->addChild('record');
        
        // Add basic record info
        $recordNode->addChild('id', $record['id']);
        $recordNode->addChild('createdAt', $record['createdAt']);
        
        if (isset($record['updatedAt'])) {
            $recordNode->addChild('updatedAt', $record['updatedAt']);
        }
        
        // Add personal info
        $personalInfo = $recordNode->addChild('personalInfo');
        $personalInfo->addChild('name', $record['name']);
        $personalInfo->addChild('age', $record['age']);
        $personalInfo->addChild('gender', $record['gender']);
        
        // Add fitness data
        $fitnessData = $recordNode->addChild('fitnessData');
        $fitnessData->addChild('exerciseFrequency', $record['exercise_frequency']);
        
        // Exercise types (can be array)
        $exerciseTypes = $fitnessData->addChild('exerciseTypes');
        
        if (isset($record['exercise_type'])) {
            if (is_array($record['exercise_type'])) {
                foreach ($record['exercise_type'] as $type) {
                    if (!empty($type)) {
                        $exerciseTypes->addChild('type', $type);
                    }
                }
            } else if (!empty($record['exercise_type'])) {
                $exerciseTypes->addChild('type', $record['exercise_type']);
            }
        }
        
        $fitnessData->addChild('fitnessGoal', $record['fitness_goal']);
        $fitnessData->addChild('fitnessLevel', $record['fitness_level']);
        $fitnessData->addChild('limitations', $record['limitations']);
        $fitnessData->addChild('exerciseDuration', $record['exercise_duration']);
        $fitnessData->addChild('recoveryTime', $record['recovery_time']);
    }
    
    // Save XML
    $dom = new DOMDocument('1.0');
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = true;
    $dom->loadXML($xml->asXML());
    file_put_contents(XML_FILE, $dom->saveXML());
}

/**
 * Export data as JSON
 * @return string JSON string
 */
function exportToJSON() {
    $records = getAllRecords();
    return json_encode($records, JSON_PRETTY_PRINT);
}

/**
 * Export data as XML
 * @return string XML string
 */
function exportToXML() {
    if (file_exists(XML_FILE)) {
        return file_get_contents(XML_FILE);
    }
    
    // If XML file doesn't exist, create it
    $records = getAllRecords();
    saveAllRecords($records);
    return file_get_contents(XML_FILE);
}