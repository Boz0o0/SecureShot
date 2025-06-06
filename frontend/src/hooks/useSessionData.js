import { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';

export const useSessionData = (code) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    const fetchSession = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await sessionAPI.getByCode(code);
        setSession(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [code]);

  return { session, loading, error, refetch: () => fetchSession() };
};