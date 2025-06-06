const supabase = require('../services/supabaseClient');

async function verifySessionCode(req, res, next) {
  try {
    const { code } = req.params;

    if (!code || code.length !== 6) {
      return res.status(400).json({ error: 'Invalid session code format' });
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (new Date(session.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Session has expired' });
    }

    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = verifySessionCode;