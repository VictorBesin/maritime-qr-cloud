import express from 'express';
import pool from '../db.js';
import QRCode from 'qrcode';

const router = express.Router();

// Generate QR Code for a user and duty type
router.get('/generate/:userId/:qrTypeId', async (req, res) => {
  try {
    const qrData = JSON.stringify({
      userId: req.params.userId,
      qrTypeId: req.params.qrTypeId,
      url: `/api/qr-clock/${req.params.userId}/${req.params.qrTypeId}`
    });
    const qrImage = await QRCode.toDataURL(qrData);
    res.json({ qrImage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process a scan
router.post('/scan', async (req, res) => {
  const { userId, qrTypeId, timestamp, clientId } = req.body;
  try {
    // Determine IN or OUT based on last log
    const lastLog = await pool.query('SELECT type FROM clock_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1', [userId]);
    let type = 'IN';
    if (lastLog.rows.length > 0 && lastLog.rows[0].type === 'IN') {
      type = 'OUT';
    }

    await pool.query(
      'INSERT INTO clock_logs (user_id, qr_type_id, type, timestamp, client_id) VALUES ($1, $2, $3, $4, $5)',
      [userId, qrTypeId, type, timestamp || new Date().toISOString(), clientId || `web-${Date.now()}`]
    );

    res.json({ success: true, type, qrTypeId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
