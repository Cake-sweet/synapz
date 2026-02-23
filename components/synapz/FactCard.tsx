'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, VolumeX, BookOpen, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Fact } from '@/stores/factsStore';
import { linkifyText } from '@/lib/linkifyText';
import { useAuthStore } from '@/stores/authStore';

interface FactCardProps {
  fact: Fact;
  onRead?: () => void;
  isSaved?: boolean;
  onToggleSave?: (factId: string, isSaved: boolean) => void;
}

const categoryColors: Record<string, string> = {
  Science: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  History: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  Nature: 'bg-green-500/20 text-green-400 border-green-500/30',
  Architecture: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Food: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function FactCard({ fact, onRead, isSaved: initialIsSaved = false, onToggleSave }: FactCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasRead, setHasRead] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { isAuthenticated } = useAuthStore();

  // Memoize the linkified text to avoid recalculating on every render
  const linkedText = useMemo(() => {
    return linkifyText(fact.text, fact.keywords || undefined);
  }, [fact.text, fact.keywords]);

  // Also linkify the title
  const linkedTitle = useMemo(() => {
    return linkifyText(fact.title, fact.keywords || undefined);
  }, [fact.title, fact.keywords]);

  useEffect(() => {
    // Mark as read after 3 seconds of viewing
    const timer = setTimeout(() => {
      if (!hasRead && onRead) {
        setHasRead(true);
        onRead();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasRead, onRead]);

  const speak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Use plain text for speech (remove HTML tags)
    const plainText = `${fact.title}. ${fact.text}`;
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated || isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/facts/${fact.id}/save`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
        onToggleSave?.(fact.id, data.isSaved);
      }
    } catch (error) {
      console.error('Failed to save fact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const categoryClass = categoryColors[fact.category] || categoryColors.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <CardTitle 
              className="text-lg text-white leading-tight"
              dangerouslySetInnerHTML={{ __html: linkedTitle }}
            />
            <div className="flex items-center gap-1 shrink-0">
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className={`${isSaved ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-emerald-400'} transition-colors`}
                  title={isSaved ? 'Remove from Memory Box' : 'Save to Memory Box'}
                >
                  <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={speak}
                className={`${isSpeaking ? 'text-violet-400 animate-pulse' : 'text-slate-400 hover:text-violet-400'}`}
              >
                {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p 
            className="text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: linkedText }}
          />
        </CardContent>
        <CardFooter className="pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={categoryClass}>
                <BookOpen size={12} className="mr-1" />
                {fact.category}
              </Badge>
              {fact.source && (
                <span className="text-xs text-slate-500">
                  via {fact.source}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isSaved && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-emerald-400 text-xs"
                >
                  <Bookmark size={12} fill="currentColor" />
                  <span>Saved</span>
                </motion.div>
              )}
              {hasRead && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-violet-400 text-xs"
                >
                  <BookOpen size={12} />
                  <span>+5 pts</span>
                </motion.div>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
