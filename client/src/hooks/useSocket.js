import { useEffect } from 'react';
import socket from '../socket/socket';

export const useSocket = (eventName, handler) => {
  useEffect(() => {
    if (!eventName || !handler) return;

    socket.on(eventName, handler);
    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler]);
};

export default useSocket;
