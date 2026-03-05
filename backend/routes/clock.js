import express from 'express';
import pool from '../db.js';
import { checkCompliance } from '../complianceEngine.js';
import { generateMonthlyRecordsPDF } from '../pdfGenerator.js';

const router = express.Router();

// Get logs for a user
router.get('/logs/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clock_logs WHERE user_id = $1 ORDER BY timestamp DESC', [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sync offline logs
router.post('/sync', async (req, res) => {
  const { logs } = req.body;
  try {
    for (const log of logs) {
      // Check if already exists (idempotent sync)
      const exists = await pool.query('SELECT id FROM clock_logs WHERE client_id = $1', [log.clientId]);
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO clock_logs (user_id, qr_type_id, type, timestamp, client_id) VALUES ($1, $2, $3, $4, $5)',
          [log.userId, log.qrTypeId, log.type, log.timestamp, log.clientId]
        );
      }
    }
    res.json({ success: true, synced: logs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get STCW monthly compliance data
router.get('/monthly/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const startDate = `${year}-${month.padStart(2, '0')}-01T00:00:00Z`;
    // For end date, just query the whole month up to next month
    const endDate = new Date(year, parseInt(month), 1).toISOString();

    const logsResult = await pool.query(
      `SELECT * FROM clock_logs 
       WHERE user_id = $1 AND timestamp >= $2 AND timestamp < $3 
       ORDER BY timestamp ASC`,
      [userId, startDate, endDate]
    );

    const complianceData = checkCompliance(logsResult.rows, parseInt(year), parseInt(month));
    res.json(complianceData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get STCW monthly compliance PDF
router.get('/monthly/pdf/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    // 1. Get user details
    const userResult = await pool.query('SELECT id, name, rank FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = userResult.rows[0];

    // 2. Get logs corresponding to the month
    const startDate = `${year}-${month.padStart(2, '0')}-01T00:00:00Z`;
    const endDate = new Date(year, parseInt(month), 1).toISOString();

    const logsResult = await pool.query(
      `SELECT * FROM clock_logs 
       WHERE user_id = $1 AND timestamp >= $2 AND timestamp < $3 
       ORDER BY timestamp ASC`,
      [userId, startDate, endDate]
    );

    // 3. Run compliance engine
    const complianceData = checkCompliance(logsResult.rows, parseInt(year), parseInt(month));

    // 4. Stream PDF
    generateMonthlyRecordsPDF(user, complianceData, res);

  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      console.error("PDF Streaming Error:", err);
    }
  }
});

export default router;
