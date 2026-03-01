import React from 'react';

interface TimerProps {
  timeLeft: number;
  timeLimit: number;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, timeLimit }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / timeLimit;
  const offset = circumference * (1 - progress);

  let colorClass = 'text-sky-500';
  if (timeLeft <= 10) {
    colorClass = 'text-rose-500';
  } else if (timeLeft <= 30) {
    colorClass = 'text-amber-500';
  }
  
  return (
    <div className="relative my-6 w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-slate-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={`${colorClass} transition-all duration-1000 linear`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center font-bold text-4xl ${colorClass}`}>
        {timeLeft}
      </div>
    </div>
  );
};

export default Timer;
