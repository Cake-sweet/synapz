'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, RefreshCw, CheckCircle, XCircle, Loader2, Sparkles, BookOpen, Plus,
  Wand2, Terminal, Trash2, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SeedStatus {
  totalFacts: number;
  factsByCategory: Array<{ category: string; count: number }>;
  recentFacts: Array<{ title: string; category: string; createdAt: string }>;
  suggestedTopics: string[];
}

interface SeedResult {
  success: boolean;
  totalFetched: number;
  totalAdded: number;
  duplicatesSkipped: number;
  facts: Array<{ title: string; category: string; added: boolean }>;
  errors: string[];
}

interface AIGenerateResult {
  success: boolean;
  topic: string;
  requested: number;
  generated: number;
  inserted: number;
  duplicates: number;
  facts: Array<{ title: string; category: string }>;
  duplicateTitles?: string[];
  error?: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
  message: string;
}

const QUICK_TOPICS = [
  "Space", "Science", "Technology", "History",
  "Animals", "Nature", "Human Body", "Health",
  "Art", "Music", "Literature", "Movies",
  "Sports", "Food", "Geography", "Architecture",
  "Business", "Psychology", "Philosophy", "Mathematics",
  "Environment", "Fashion", "Gaming", "Travel"
];

export function AdminSeedPanel() {
  const [status, setStatus] = useState<SeedStatus | null>(null);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // AI Generator state
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIGenerateResult | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showAllTopics, setShowAllTopics] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const addLog = (type: 'success' | 'error' | 'info', message: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
    };
    setLogs(prev => [...prev.slice(-50), entry]); // Keep last 50 logs
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/facts/bulk-seed');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      addLog('error', 'Failed to fetch database status');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
    addLog('info', 'Admin panel loaded');
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const seedFacts = async (count: number = 50) => {
    setIsSeeding(true);
    setResult(null);
    addLog('info', `Starting bulk seed for ${count} facts...`);
    try {
      const response = await fetch('/api/facts/bulk-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await response.json();
      setResult(data);
      if (data.success) {
        addLog('success', `✅ Bulk seed complete: ${data.totalAdded} added, ${data.duplicatesSkipped} duplicates skipped`);
      } else {
        addLog('error', 'Bulk seed failed');
      }
      await fetchStatus();
    } catch (error) {
      console.error('Failed to seed facts:', error);
      addLog('error', 'Failed to connect to server');
      setResult({
        success: false,
        totalFetched: 0,
        totalAdded: 0,
        duplicatesSkipped: 0,
        facts: [],
        errors: ['Failed to connect to server'],
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const generateFacts = async () => {
    if (!topic.trim()) {
      addLog('error', 'Please enter a topic');
      return;
    }

    setIsGenerating(true);
    setAiResult(null);
    addLog('info', `🪄 Generating ${count} facts about "${topic}"...`);

    try {
      const response = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': 'synapz-admin-2024-secret-key',
        },
        body: JSON.stringify({ topic: topic.trim(), count }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAiResult(data);
        addLog('success', `✅ Generated ${data.inserted} facts about "${data.topic}"${data.duplicates > 0 ? ` (${data.duplicates} duplicates skipped)` : ''}`);
        
        // Log each fact
        data.facts.forEach((fact: { title: string; category: string }) => {
          addLog('info', `  → "${fact.title}" [${fact.category}]`);
        });
        
        // Refresh status
        await fetchStatus();
        setTopic(''); // Clear input on success
      } else {
        addLog('error', `❌ Generation failed: ${data.error || 'Unknown error'}`);
        setAiResult(data);
      }
    } catch (error) {
      console.error('Failed to generate facts:', error);
      addLog('error', 'Failed to connect to AI generator');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Logs cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Library Manager</h2>
          <p className="text-slate-400">Add more facts to your knowledge base</p>
        </div>
        <Button
          onClick={fetchStatus}
          disabled={isLoading}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Status Card */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-violet-400" />
                Current Library Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-white">{status.totalFacts.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">Total Facts</p>
                </div>
                {status.factsByCategory.slice(0, 3).map(({ category, count }) => (
                  <div key={category} className="bg-slate-900/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-white">{count}</p>
                    <p className="text-sm text-slate-400">{category}</p>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div className="flex flex-wrap gap-2 mb-6">
                {status.factsByCategory.map(({ category, count }) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="border-violet-500/30 text-violet-400"
                  >
                    {category}: {count}
                  </Badge>
                ))}
              </div>

              {/* Recent facts */}
              {status.recentFacts.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Recently Added:</p>
                  <div className="space-y-2">
                    {status.recentFacts.slice(0, 5).map((fact, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {fact.category}
                        </Badge>
                        <span className="text-slate-300 truncate">{fact.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Generator Section */}
      <Card className="bg-gradient-to-br from-violet-900/20 to-slate-800/50 border-violet-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-violet-400" />
            AI Fact Generator
          </CardTitle>
          <CardDescription className="text-slate-400">
            Generate facts about any topic using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="topic" className="text-slate-300">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Ancient Rome, Space Exploration, Marine Biology..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateFacts()}
                className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="count" className="text-slate-300">Count (1-20)</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 5)))}
                className="bg-slate-900/50 border-slate-600 text-white"
              />
            </div>
          </div>
          
          {/* Quick topic suggestions */}
          <div className="flex flex-wrap gap-2 mt-4 mb-2">
            {(showAllTopics ? QUICK_TOPICS : QUICK_TOPICS.slice(0, 8)).map((t) => (
              <Badge
                key={t}
                variant="secondary"
                onClick={() => setTopic(t)}
                className="cursor-pointer bg-slate-800 hover:bg-violet-600 text-slate-300 hover:text-white transition-colors px-3 py-1"
              >
                {t}
              </Badge>
            ))}
          </div>
          <button
            onClick={() => setShowAllTopics(!showAllTopics)}
            className="text-xs text-violet-400 hover:text-violet-300 mb-4 transition-colors"
          >
            {showAllTopics ? 'Show less' : `Show all ${QUICK_TOPICS.length} topics`}
          </button>

          <Button
            onClick={generateFacts}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Facts 🪄
              </>
            )}
          </Button>

          {/* AI Result */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className={`p-4 rounded-lg ${aiResult.success ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-rose-500/10 border border-rose-500/30'}`}>
                  {aiResult.success ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-emerald-400 font-medium">
                          Generated {aiResult.inserted} facts about "{aiResult.topic}"
                        </p>
                        {aiResult.duplicates > 0 && (
                          <p className="text-sm text-amber-400 mt-1">
                            {aiResult.duplicates} duplicates were skipped
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {aiResult.facts.slice(0, 5).map((fact, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {fact.title}
                            </Badge>
                          ))}
                          {aiResult.facts.length > 5 && (
                            <span className="text-xs text-slate-400">+{aiResult.facts.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-rose-400 font-medium">Generation Failed</p>
                        <p className="text-sm text-rose-300 mt-1">{aiResult.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Bulk Seed Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            Bulk Seed (Pre-made Facts)
          </CardTitle>
          <CardDescription className="text-slate-400">
            Add pre-written facts to the library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => seedFacts(10)}
              disabled={isSeeding}
              variant="outline"
              className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
              Quick Seed (10)
            </Button>
            <Button
              onClick={() => seedFacts(20)}
              disabled={isSeeding}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Standard Seed (20)
            </Button>
            <Button
              onClick={() => seedFacts(30)}
              disabled={isSeeding}
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Database className="w-4 h-4 mr-2" />}
              Massive Seed (30)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Log */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Live Log
          </CardTitle>
          <Button
            onClick={clearLogs}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </CardHeader>
        <CardContent>
          <div 
            ref={logContainerRef}
            className="bg-slate-900/80 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm space-y-1"
          >
            {logs.length === 0 ? (
              <p className="text-slate-500">No logs yet. Generate some facts to see activity.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-500 flex-shrink-0">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'error' ? 'text-rose-400' :
                    'text-slate-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seed Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${result.success ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-rose-500/50 bg-rose-500/5'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${result.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Seed Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{result.totalFetched}</p>
                    <p className="text-sm text-slate-400">Processed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">{result.totalAdded}</p>
                    <p className="text-sm text-slate-400">Added</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-400">{result.duplicatesSkipped}</p>
                    <p className="text-sm text-slate-400">Duplicates</p>
                  </div>
                </div>

                {/* Added facts list */}
                {result.facts.filter(f => f.added).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-400 mb-2">New facts added:</p>
                    <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-900/50 rounded-lg p-3">
                      {result.facts.filter(f => f.added).map((fact, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                            {fact.category}
                          </Badge>
                          <span className="text-slate-300 truncate">{fact.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Errors */}
                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-rose-400 mb-2">Errors:</p>
                    <div className="max-h-32 overflow-y-auto space-y-1 bg-rose-500/10 rounded-lg p-3">
                      {result.errors.map((error, i) => (
                        <p key={i} className="text-sm text-rose-300">{error}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
