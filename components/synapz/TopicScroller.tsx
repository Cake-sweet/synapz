'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TOPICS = [
  'All',
  'Space',
  'Science',
  'Technology',
  'History',
  'Animals',
  'Nature',
  'Human Body',
  'Health',
  'Art',
  'Music',
  'Literature',
  'Movies',
  'Sports',
  'Food',
  'Geography',
  'Architecture',
  'Business',
  'Psychology',
  'Philosophy',
  'Mathematics',
  'Environment',
  'Fashion',
  'Gaming',
  'Travel',
];

interface TopicScrollerProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export function TopicScroller({ selectedTopic, onTopicChange }: TopicScrollerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showFade, setShowFade] = useState(true);

  // Check if we need to show the fade indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      // Show fade if there's more content to scroll
      setShowFade(scrollLeft < scrollWidth - clientWidth - 10);
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleTopicClick = (topic: string) => {
    onTopicChange(topic);
    // Scroll the clicked topic into view
    const container = scrollContainerRef.current;
    if (container) {
      const buttons = container.querySelectorAll('button');
      const index = TOPICS.indexOf(topic);
      if (buttons[index]) {
        buttons[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto whitespace-nowrap px-4 py-3 scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {TOPICS.map((topic) => {
          const isActive = selectedTopic === topic || (topic === 'All' && selectedTopic === 'All');
          
          return (
            <motion.button
              key={topic}
              onClick={() => handleTopicClick(topic)}
              whileTap={{ scale: 0.95 }}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                border transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600'
                }
              `}
            >
              {topic === 'All' ? '🌐 All' : topic}
            </motion.button>
          );
        })}
      </div>

      {/* Fade gradient on the right */}
      {showFade && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgb(15, 23, 42) 0%, transparent 100%)',
          }}
        />
      )}

      {/* Custom CSS to hide scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
