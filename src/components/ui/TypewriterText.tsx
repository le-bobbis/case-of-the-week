'use client';

import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({ 
  text, 
  speed = 30, 
  className = '',
  onComplete 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  console.log('TypewriterText rendering with text:', text);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start typing
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev < text.length) {
          setDisplayedText(text.slice(0, prev + 1));
          return prev + 1;
        } else {
          setIsTyping(false);
          if (onComplete) onComplete();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return prev;
        }
      });
    }, speed);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <span className={className} style={{ 
      fontFamily: "'Courier New', Courier, monospace",
      letterSpacing: '0.05em'
    }}>
      {displayedText}
      {isTyping && (
        <span style={{ 
          animation: 'blink 1s infinite',
          fontWeight: 'normal',
          opacity: 1
        }}>|</span>
      )}
    </span>
  );
}