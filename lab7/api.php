<?php
/**
 * API handler for fitness test form
 */

// Include functions file
require_once 'functions.php';

// Initialize session to store messages
session_start();

// Get the action from request
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

// Handle different actions
switch ($action) {
    case 'create':
        handleCreate();
        break;
        
    case 'update':
        handleUpdate();
        break;
        
    case 'delete':
        handleDelete();
        break;
        
    case 'export':
        handleExport();
        break;
        
    default:
        // Invalid action
        $_SESSION['message'] = 'Invalid action specified';
        $_SESSION['error'] = true;
        header('Location: index.php');
        exit;
}

/**
 * Handle record creation
 */
function handleCreate() {
    try {
        // Validate required fields
        validateRequiredFields();
        
        // Add record
        $record = addRecord($_POST);
        
        // Set success message
        $_SESSION['message'] = 'Record created successfully!';
        $_SESSION['error'] = false;
        
        // Redirect to records page
        header('Location: index.php?tab=records');
        exit;
    } catch (Exception $e) {
        // Set error message
        $_SESSION['message'] = 'Error creating record: ' . $e->getMessage();
        $_SESSION['error'] = true;
        
        // Redirect back to form
        header('Location: index.php?tab=form');
        exit;
    }
}

/**
 * Handle record update
 */
function handleUpdate() {
    try {
        // Check if ID is provided
        if (!isset($_POST['id']) || empty($_POST['id'])) {
            throw new Exception('Record ID is required for update');
        }
        
        // Validate required fields
        validateRequiredFields();
        
        // Update record
        $record = updateRecord($_POST['id'], $_POST);
        
        if (!$record) {
            throw new Exception('Record not found');
        }
        
        // Set success message
        $_SESSION['message'] = 'Record updated successfully!';
        $_SESSION['error'] = false;
        
        // Redirect to records page
        header('Location: index.php?tab=records');
        exit;
    } catch (Exception $e) {
        // Set error message
        $_SESSION['message'] = 'Error updating record: ' . $e->getMessage();
        $_SESSION['error'] = true;
        
        // Redirect back to form
        header('Location: index.php?tab=form');
        exit;
    }
}

/**
 * Handle record deletion
 */
function handleDelete() {
    try {
        // Check if ID is provided
        if (!isset($_GET['id']) || empty($_GET['id'])) {
            throw new Exception('Record ID is required for deletion');
        }
        
        // Delete record
        $success = deleteRecord($_GET['id']);
        
        if (!$success) {
            throw new Exception('Record not found');
        }
        
        // Set success message
        $_SESSION['message'] = 'Record deleted successfully!';
        $_SESSION['error'] = false;
        
        // Redirect to records page
        header('Location: index.php?tab=records');
        exit;
    } catch (Exception $e) {
        // Set error message
        $_SESSION['message'] = 'Error deleting record: ' . $e->getMessage();
        $_SESSION['error'] = true;
        
        // Redirect to records page
        header('Location: index.php?tab=records');
        exit;
    }
}

/**
 * Handle data export
 */
function handleExport() {
    try {
        // Check if format is provided
        if (!isset($_GET['format']) || empty($_GET['format'])) {
            throw new Exception('Export format is required');
        }
        
        $format = strtolower($_GET['format']);
        
        if ($format === 'json') {
            // Export as JSON
            $data = exportToJSON();
            header('Content-Type: application/json');
            header('Content-Disposition: attachment; filename="fitness_records.json"');
            echo $data;
            exit;
        } elseif ($format === 'xml') {
            // Export as XML
            $data = exportToXML();
            header('Content-Type: application/xml');
            header('Content-Disposition: attachment; filename="fitness_records.xml"');
            echo $data;
            exit;
        } else {
            throw new Exception('Invalid export format. Use "json" or "xml".');
        }
    } catch (Exception $e) {
        // Set error message
        $_SESSION['message'] = 'Error exporting data: ' . $e->getMessage();
        $_SESSION['error'] = true;
        
        // Redirect to export tab
        header('Location: index.php?tab=export');
        exit;
    }
}

/**
 * Validate required form fields
 * @throws Exception if required fields are missing
 */
function validateRequiredFields() {
    $requiredFields = [
        'name', 'age', 'gender', 
        'exercise_frequency', 'fitness_goal',
        'fitness_level', 'limitations',
        'exercise_duration', 'recovery_time'
    ];
    
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($_POST[$field]) || 
            (is_string($_POST[$field]) && trim($_POST[$field]) === '')) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        throw new Exception('Required fields missing: ' . implode(', ', $missingFields));
    }
}