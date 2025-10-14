'use client';

import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle, XCircle } from 'lucide-react';

const Notification = () => {
  const { notification } = useNotification();

  if (!notification) {
    return null;
  }

  const { message, type } = notification;

  const isSuccess = type === 'success';

  return (
    <div
      className={`fixed top-24 right-4 w-auto max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center z-50 transition-transform duration-300 ease-in-out animate-slide-in-right`}
      style={{
        backgroundColor: isSuccess ? '#1f7a1f' : '#991b1b',
      }}
    >
      {isSuccess ? (
        <CheckCircle className="mr-3" />
      ) : (
        <XCircle className="mr-3" />
      )}
      <span>{message}</span>
    </div>
  );
};

export default Notification;
