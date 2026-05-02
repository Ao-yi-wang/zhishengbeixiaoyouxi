import { Side } from '../types';

export const Jiaobei = ({ side, flipX }: { side: Side; flipX: boolean }) => {
  return (
    <svg 
      viewBox="0 0 100 200" 
      className="w-24 h-48 drop-shadow-2xl" 
      style={{ transform: flipX ? 'scaleX(-1)' : 'none' }}
    >
      <defs>
        <radialGradient id="convex-grad" cx="65%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#c42c27" />
          <stop offset="70%" stopColor="#8a1714" />
          <stop offset="100%" stopColor="#4a0806" />
        </radialGradient>
        <linearGradient id="flat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e84c46" />
          <stop offset="50%" stopColor="#db352e" />
          <stop offset="100%" stopColor="#b3241f" />
        </linearGradient>
      </defs>
      
      {side === 'flat' ? (
        <g>
          {/* Main flat body */}
          <path d="M 40 30 C 120 70, 120 130, 40 170 C 66 130, 66 70, 40 30 Z" fill="url(#flat-grad)" stroke="#8a1714" strokeWidth="2" strokeLinejoin="round" />
          {/* Inner line to imply flatness/rim */}
          <path d="M 48 45 C 105 80, 105 120, 48 155 C 68 120, 68 80, 48 45 Z" fill="none" stroke="#f0625d" strokeWidth="1" opacity="0.8" />
        </g>
      ) : (
        <g>
          {/* Main convex body */}
          <path d="M 40 30 C 120 70, 120 130, 40 170 C 66 130, 66 70, 40 30 Z" fill="url(#convex-grad)" stroke="#300302" strokeWidth="2" strokeLinejoin="round" />
          {/* Highlight for convexity */}
          <path d="M 68 65 C 105 90, 105 110, 68 135" fill="none" stroke="#f26966" strokeWidth="6" strokeLinecap="round" filter="blur(4px)" opacity="0.6" />
          <path d="M 52 42 C 70 55, 70 65, 52 80" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" filter="blur(2px)" opacity="0.3" />
        </g>
      )}
    </svg>
  );
};
