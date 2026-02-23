'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Database, 
  Bookmark, 
  ChevronRight, 
  ChevronDown,
  BookOpen,
  ExternalLink,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { linkifyText } from '@/lib/linkifyText';

interface SavedFact {
  id: string;
  title: string;
  text: string;
  category: string;
  source?: string | null;
  keywords?: string | null;
  createdAt: string;
}

interface MemoryBoxProps {
  onClose?: () => void;
}

const categoryColors: Record<string, string> = {
  Science: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  History: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  Nature: 'bg-green-500/20 text-green-400 border-green-500/30',
  Architecture: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Food: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  default: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function MemoryBox({ onClose }: MemoryBoxProps) {
  const [facts, setFacts] = useState<SavedFact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  // Fetch saved facts
  const fetchSavedFacts = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search?.trim()) {
        params.set('search', search.trim());
      }
      
      const response = await fetch(`/api/users/saved?${params}`);
      if (response.ok) {
        const data = await response.json();
        // Parse keywords for each fact
        const parsedFacts = data.facts.map((fact: SavedFact & { keywords?: string }) => ({
          ...fact,
          keywords: fact.keywords ? (typeof fact.keywords === 'string' ? JSON.parse(fact.keywords) : fact.keywords) : null,
        }));
        setFacts(parsedFacts);
      }
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedFacts();
  }, [fetchSavedFacts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSavedFacts(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSavedFacts]);

  // Handle unsave
  const handleUnsave = async (factId: string) => {
    try {
      const response = await fetch(`/api/facts/${factId}/save`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setFacts(prev => prev.filter(f => f.id !== factId));
        if (expandedId === factId) {
          setExpandedId(null);
        }
      }
    } catch {
      // Ignore errors
    }
  };

  // Text to speech
  const speak = (fact: SavedFact) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking === fact.id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const plainText = `${fact.title}. ${fact.text}`;
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(fact.id);
  };

  // Filter facts client-side for instant feedback
  const filteredFacts = useMemo(() => {
    if (!searchQuery.trim()) return facts;
    const query = searchQuery.toLowerCase();
    return facts.filter(fact => 
      fact.title.toLowerCase().includes(query) ||
      fact.text.toLowerCase().includes(query) ||
      fact.category.toLowerCase().includes(query)
    );
  }, [facts, searchQuery]);

  return (
    <div className="relative">
      {/* Futuristic Data Cube Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-violet-500/30 shadow-2xl shadow-violet-500/10 overflow-hidden"
      >
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/20 via-emerald-500/20 to-violet-500/20 blur-xl opacity-50 -z-10" />
        
        {/* Terminal Header */}
        <div className="bg-slate-800/80 border-b border-violet-500/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Terminal dots */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-400" />
              <span className="text-violet-300 font-mono text-sm font-semibold">
                SYNAPZ_MEMORY_BOX
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-violet-500/30 text-violet-400 font-mono">
              {facts.length} ITEMS
            </Badge>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search your memory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-700 focus:border-violet-500 focus:ring-violet-500/20 text-white placeholder:text-slate-500 font-mono"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Facts List */}
        <ScrollArea className="h-96">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Sparkles className="w-8 h-8 animate-pulse mb-2" />
                <span className="font-mono text-sm">Loading memories...</span>
              </div>
            ) : filteredFacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Bookmark className="w-12 h-12 mb-3 opacity-50" />
                <span className="font-mono text-sm">
                  {searchQuery ? 'No matching memories found' : 'Your Memory Box is empty'}
                </span>
                <span className="text-xs mt-1 text-slate-600">
                  Save facts to recall them later
                </span>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredFacts.map((fact, index) => (
                  <motion.div
                    key={fact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className={`bg-slate-800/50 border-slate-700 hover:border-violet-500/50 cursor-pointer transition-all duration-200 ${
                        expandedId === fact.id ? 'border-violet-500/50' : ''
                      }`}
                    >
                      <CardContent className="p-0">
                        {/* Compact View */}
                        <div
                          className="p-3 flex items-center gap-3"
                          onClick={() => setExpandedId(expandedId === fact.id ? null : fact.id)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium truncate">
                              {fact.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${categoryColors[fact.category] || categoryColors.default}`}
                              >
                                {fact.category}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {new Date(fact.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnsave(fact.id);
                              }}
                              className="w-8 h-8 text-slate-500 hover:text-rose-400"
                              title="Remove from Memory Box"
                            >
                              <Trash2 size={16} />
                            </Button>
                            {expandedId === fact.id ? (
                              <ChevronDown className="w-5 h-5 text-violet-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                        </div>

                        {/* Expanded View - "Recall" Mode */}
                        <AnimatePresence>
                          {expandedId === fact.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
                                {/* Action buttons */}
                                <div className="flex justify-end gap-2 mb-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speak(fact);
                                    }}
                                    className={`text-slate-400 hover:text-violet-400 ${isSpeaking === fact.id ? 'text-violet-400' : ''}`}
                                  >
                                    {isSpeaking === fact.id ? (
                                      <>
                                        <VolumeX size={16} className="mr-1" />
                                        Stop
                                      </>
                                    ) : (
                                      <>
                                        <Volume2 size={16} className="mr-1" />
                                        Read Aloud
                                      </>
                                    )}
                                  </Button>
                                </div>

                                {/* Fact text with wiki links */}
                                <div 
                                  className="text-slate-300 text-sm leading-relaxed mb-4"
                                  dangerouslySetInnerHTML={{ 
                                    __html: linkifyText(fact.text, fact.keywords || undefined) 
                                  }}
                                />

                                {/* Source */}
                                {fact.source && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <ExternalLink size={12} />
                                    <span>via {fact.source}</span>
                                  </div>
                                )}

                                {/* Memory saved indicator */}
                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50">
                                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                                    <Bookmark size={12} fill="currentColor" />
                                    <span>Saved to Memory Box</span>
                                  </div>
                                  <span className="text-xs text-slate-600 font-mono">
                                    ID: {fact.id.slice(0, 8)}...
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="bg-slate-800/50 border-t border-slate-700/50 px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            SYNAPZ v1.0 | MEMORY_BOX_MODULE
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-mono">ACTIVE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
