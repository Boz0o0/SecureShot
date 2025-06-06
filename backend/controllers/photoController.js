const supabase = require('../services/supabaseClient');
const { v4: uuidv4 } = require('uuid');

class PhotoController {
  async uploadPhotos(req, res, next) {
    try {
      const { sessionId } = req.params;
      const photographerId = req.user?.id;

      if (!photographerId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify session belongs to photographer
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('photographer_id', photographerId)
        .single();

      if (sessionError || !session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadPromises = req.files.map(async (file) => {
        const fileName = `${uuidv4()}-${file.originalname}`;
        const filePath = `sessions/${sessionId}/${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Save photo metadata to database
        const { data: photo, error: photoError } = await supabase
          .from('photos')
          .insert({
            session_id: sessionId,
            storage_path: filePath,
            is_watermarked: true
          })
          .select()
          .single();

        if (photoError) throw photoError;

        return photo;
      });

      const photos = await Promise.all(uploadPromises);
      res.status(201).json(photos);
    } catch (error) {
      next(error);
    }
  }

  async getSessionPhotos(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { thumbnail = false } = req.query;

      const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;

      // Generate signed URLs for photos
      const photosWithUrls = await Promise.all(
        photos.map(async (photo) => {
          const { data: signedUrl } = await supabase.storage
            .from('photos')
            .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

          return {
            ...photo,
            url: signedUrl?.signedUrl,
            is_thumbnail: thumbnail === 'true'
          };
        })
      );

      res.json(photosWithUrls);
    } catch (error) {
      next(error);
    }
  }

  async getFullResolutionPhotos(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { buyer_email } = req.query;

      if (!buyer_email) {
        return res.status(400).json({ error: 'Buyer email is required' });
      }

      // Verify purchase exists
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('session_id', sessionId)
        .eq('buyer_email', buyer_email)
        .single();

      if (purchaseError || !purchase) {
        return res.status(403).json({ error: 'Purchase not found or access denied' });
      }

      const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;

      // Generate signed URLs for full resolution photos
      const photosWithUrls = await Promise.all(
        photos.map(async (photo) => {
          const { data: signedUrl } = await supabase.storage
            .from('photos')
            .createSignedUrl(photo.storage_path, 7200); // 2 hours expiry

          return {
            ...photo,
            url: signedUrl?.signedUrl,
            is_full_resolution: true
          };
        })
      );

      res.json(photosWithUrls);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PhotoController();