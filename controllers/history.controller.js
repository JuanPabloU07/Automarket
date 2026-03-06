const Log = require('../models/Log');

async function getHistory(req, res) {
  try {
    const logs = await Log.find()
      .sort({ date: -1 })
      .limit(100);

    res.json({ ok: true, data: logs });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'MongoDB unavailable: ' + err.message });
  }
}

module.exports = { getHistory };