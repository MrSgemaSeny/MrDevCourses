import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string | Date;
  onComplete?: () => void;
  className?: string;
  showIcon?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  onComplete,
  className = '',
  showIcon = true,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isFinished: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: false });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;

    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true });
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current?.();
        }
        return false;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isFinished: false });
      return true;
    };

    const isRunning = calculateTime();
    if (!isRunning) return;

    const interval = setInterval(() => {
      const stillRunning = calculateTime();
      if (!stillRunning) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isFinished) {
    return <span className={`text-zinc-200 font-medium font-mono ${className}`}>Доступен сейчас</span>;
  }

  const formatUnit = (value: number, unit: string) => {
    return `${String(value).padStart(2, '0')}${unit}`;
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-xs text-zinc-300 ${className}`}>
      {showIcon && <Clock className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />}
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && <span className="px-1 py-0.5 rounded bg-zinc-900 border border-white/5">{formatUnit(timeLeft.days, 'д')}</span>}
        <span className="px-1 py-0.5 rounded bg-zinc-900 border border-white/5">{formatUnit(timeLeft.hours, 'ч')}</span>
        <span>:</span>
        <span className="px-1 py-0.5 rounded bg-zinc-900 border border-white/5">{formatUnit(timeLeft.minutes, 'м')}</span>
        <span>:</span>
        <span className="px-1 py-0.5 rounded bg-zinc-900 border border-white/5 text-zinc-400">{formatUnit(timeLeft.seconds, 'с')}</span>
      </div>
    </div>
  );
};
