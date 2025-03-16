import React, { useState, useEffect } from 'react';

const CooldownTimer = ({ initialTimeRemaining, onComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeRemaining);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onComplete]);

  // Format time remaining
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="cooldown-timer">
      <div className="timer-display">{formatTime(timeRemaining)}</div>
    </div>
  );
};

export default CooldownTimer;