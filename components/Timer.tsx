import React from 'react';

interface TimerProps {
  timeLeft: number;
  timeLimit: number;
  isRunning?: boolean;
  isCountingDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Timer: React.FC<TimerProps> = ({ 
  timeLeft, 
  timeLimit, 
  isRunning = true, 
  isCountingDown = false, 
  size = 'md',
  onClick
}) => {
  const sizes = {
    sm: { box: 80, radius: 34, stroke: 6, font: 'text-xl', iconSize: 'w-4 h-4' },
    md: { box: 128, radius: 54, stroke: 8, font: 'text-4xl', iconSize: 'w-6 h-6' },
    lg: { box: 180, radius: 78, stroke: 10, font: 'text-6xl', iconSize: 'w-8 h-8' },
  };
  
  const { box, radius, stroke, font, iconSize } = sizes[size];
  const center = box / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / timeLimit;
  const offset = circumference * (1 - progress);

  let colorClass = 'text-sky-500';
  
  if (timeLeft <= 10) {
    colorClass = 'text-rose-500';
  } else if (timeLeft <= 30) {
    colorClass = 'text-amber-500';
  }

  if (!isRunning && !isCountingDown) {
    colorClass = 'text-slate-400';
  }

  if (isCountingDown) {
    colorClass = 'text-amber-500';
  }
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return s.toString();
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`relative flex items-center justify-center transition-all duration-300 cursor-pointer group ${!isRunning && !isCountingDown ? 'opacity-80 scale-95' : 'scale-100'} ${isCountingDown ? 'animate-bounce' : ''}`} 
      style={{ width: box, height: box }}
      onClick={onClick}
    >
      {/* Background Glow */}
      {(isRunning || isCountingDown) && (
        <div 
          className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-500 ${
            timeLeft <= 10 && isRunning ? 'animate-pulse-fast bg-rose-500 opacity-30' : 
            isCountingDown ? 'bg-amber-400' : 
            colorClass.replace('text', 'bg')
          }`}
        />
      )}
      
      <svg className="w-full h-full drop-shadow-md" viewBox={`0 0 ${box} ${box}`}>
        {/* Background Track */}
        <circle
          className="text-slate-100"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        {/* Progress Circle */}
        <circle
          className={`${colorClass} transition-all duration-1000 linear`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={isCountingDown ? 0 : offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          transform={`rotate(-90 ${center} ${center})`}
        />
        
        {/* Play/Pause indicator when hovered or paused */}
        {(!isRunning || timeLeft === 0) && !isCountingDown && (
          <circle
            cx={center}
            cy={center}
            r={radius - stroke}
            className="fill-slate-50 opacity-40 group-hover:opacity-60 transition-opacity"
          />
        )}
      </svg>
      
      {/* Time Text and Icons */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center font-black transition-colors duration-500 ${font} ${isCountingDown ? 'text-amber-600' : colorClass} ${timeLeft <= 10 && isRunning ? 'animate-pulse' : ''}`}>
        <div className="flex flex-col items-center">
          {isCountingDown ? timeLeft : formatTime(timeLeft)}
          {size !== 'sm' && (
            <span className="text-[10px] uppercase tracking-widest opacity-40 -mt-1 font-bold">
              {isCountingDown ? 'Ready?' : isRunning ? 'remaining' : 'paused'}
            </span>
          )}
        </div>
        
        {/* Status Icon */}
        {!isCountingDown && !isRunning && timeLeft > 0 && (
          <div className={`mt-1 ${colorClass} opacity-60`}>
            <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>

      {/* Critical time pulse ring */}
      {timeLeft <= 10 && isRunning && (
        <div className="absolute inset-0 border-4 border-rose-500 rounded-full animate-ping opacity-20 pointer-events-none" />
      )}
    </div>
  );
};

export default Timer;
