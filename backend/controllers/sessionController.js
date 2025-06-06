const supabase = require('../services/supabaseClient');
const generateCode = require('../utils/generateCode');

class SessionController {
  async createSession(req, res, next) {
    try {
      const { price, expires_in_hours = 24 } = req.body;
      const photographerId = req.user?.id;

      if (!photographerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!price || price <= 0) {
        return res.status(400).json({ error: 'Valid price is required' });
      }

      const code = generateCode();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expires_in_hours);

      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          code,
          photographer_id: photographerId,
          price: parseFloat(price),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  }

  async getSessionByCode(req, res, next) {
    try {
      const { code } = req.params;

      const { data: session, error } = await supabase
        .from('sessions')
        .select(`
          *,
          photos (
            id,
            storage_path,
            is_watermarked
          )
        `)
        .eq('code', code.toUpperCase())
        .single();

      if (error || !session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (new Date(session.expires_at) < new Date()) {
        return res.status(410).json({ error: 'Session has expired' });
      }

      res.json(session);
    } catch (error) {
      next(error);
    }
  }

  async getPhotographerSessions(req, res, next) {
    try {
      const photographerId = req.user?.id;

      if (!photographerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          *,
          photos (count)
        `)
        .eq('photographer_id', photographerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json(sessions);
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req, res, next) {
    try {
      const { id } = req.params;
      const photographerId = req.user?.id;

      if (!photographerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id)
        .eq('photographer_id', photographerId);

      if (error) throw error;

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SessionController();