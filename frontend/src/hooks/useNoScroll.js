import { useEffect } from 'react';

export const useNoScroll = () => {
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);
};

export default useNoScroll;