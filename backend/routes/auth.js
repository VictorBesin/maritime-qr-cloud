import express from 'express';
import bcrypt from 'bcryptjs';
import jwtoken from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { code } = req.body;
  // For simplicity, we just look up by a user code
  try {
    const result = await pool.query('SELECT * FROM users WHERE access_code = $1', [code]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid code' });
    const user = result.rows[0];
    const token = jwtoken.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, rank: user.rank } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
