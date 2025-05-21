/**
 * API routes for fitness test app
 */

const express = require('express');
const router = express.Router();
const RecordModel = require('../models/record');

// Get all records
router.get('/records', async (req, res) => {
  try {
    const records = await RecordModel.getAllRecords();
    res.json(records);
  } catch (error) {
    console.error('Error getting records:', error);
    res.status(500).json({ error: 'Failed to get records' });
  }
});

// Get a specific record by ID
router.get('/records/:id', async (req, res) => {
  try {
    const record = await RecordModel.getRecordById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Error getting record:', error);
    res.status(500).json({ error: 'Failed to get record' });
  }
});

// Create a new record
router.post('/records', async (req, res) => {
  try {
    const newRecord = await RecordModel.addRecord(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// Update a record
router.put('/records/:id', async (req, res) => {
  try {
    const updatedRecord = await RecordModel.updateRecord(req.params.id, req.body);
    if (!updatedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(updatedRecord);
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// Delete a record
router.delete('/records/:id', async (req, res) => {
  try {
    const success = await RecordModel.deleteRecord(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Export data in specified format (json or xml)
router.get('/export/:format', async (req, res) => {
  try {
    const format = req.params.format.toLowerCase();
    
    if (format === 'json') {
      const data = await RecordModel.exportToJSON();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=fitness_records.json');
      res.send(data);
    } 
    else if (format === 'xml') {
      const data = await RecordModel.exportToXML();
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename=fitness_records.xml');
      res.send(data);
    } 
    else {
      res.status(400).json({ error: 'Invalid format. Use "json" or "xml".' });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;