/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Upload, 
  FileText, 
  Loader2, 
  Files,
  ArrowRight
} from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  score: number;
  snippet: string;
}

interface AppDoc {
  id: string;
  name: string;
  type: string;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [docs, setDocs] = useState<AppDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (err) {
      console.error('Failed to fetch docs:', err);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }
      await fetchDocs();
    } catch (err: any) {
      setError(err.message || 'Failed to upload files.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResults([]);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30">
      <div className="aurora-bg" />
      
      {/* Header */}
      <header className="h-20 border-b border-white/10 bg-black/20 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Search size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter uppercase text-white block leading-none">AURA_SEARCH</span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase opacity-70">Neural Index V1.2</span>
            </div>
          </div>
          <div className="hidden md:flex gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              <span>Engine_Live</span>
            </div>
            <span>Status: {isSearching ? 'Processing...' : 'Standby'}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row gap-8 items-stretch h-[calc(100vh-80px)]">
        {/* Left Side: Upload & Library */}
        <aside className="w-full md:w-80 flex flex-col gap-6 flex-none">
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 rounded-3xl group relative overflow-hidden transition-all hover:bg-white/[0.05]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 underline decoration-indigo-500/30 underline-offset-8">Data_Ingestion</h2>
            
            <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center group-hover:border-indigo-500/50 transition-all cursor-pointer">
              <input 
                type="file" 
                multiple 
                onChange={(e) => handleFileUpload(e.target.files)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                accept=".pdf,.txt"
              />
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/40 group-hover:text-indigo-400 group-hover:scale-110 transition-all">
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Target_Documents</p>
              <p className="text-[9px] font-mono opacity-40 mt-1 uppercase">PDF_TEXT_SUPPORT</p>
            </div>
          </div>

          <div className="flex-1 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-6 overflow-hidden flex flex-col shadow-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center justify-between">
              Active_Library
              <span className="font-mono text-white/40">{docs.length.toString().padStart(2, '0')}</span>
            </h3>
            
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {docs.length === 0 ? (
                <div className="text-center py-20 opacity-20 italic text-xs">Library_Empty</div>
              ) : (
                docs.map(doc => (
                  <div key={doc.id} className="group flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={14} className="text-indigo-400 opacity-60" />
                      <span className="text-[11px] font-medium tracking-wide truncate opacity-60 group-hover:opacity-100">{doc.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {error && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-[10px] font-mono text-red-400 uppercase tracking-tight">
              Error_Signal: {error}
            </motion.div>
          )}
        </aside>

        {/* Main Content: Search & Results */}
        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl flex-none">
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto group">
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all px-6">
                <Search size={22} className="text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Query_Matrix_Index..." 
                  className="flex-1 bg-transparent py-5 px-6 font-medium text-lg focus:outline-none placeholder:text-white/10 placeholder:uppercase placeholder:text-sm tracking-wide text-white capitalize italic"
                />
                <button 
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-all active:scale-95 disabled:bg-white/5 disabled:text-white/20"
                >
                  {isSearching ? <Loader2 className="animate-spin" size={16} /> : 'Process'}
                </button>
              </div>
              <div className="mt-4 flex gap-4 text-[9px] font-mono tracking-widest uppercase opacity-40 px-2">
                <span>Vector_Space: TF-IDF_L2</span>
                <span className="text-indigo-500 font-bold">Similarity_Match: {results.length > 0 ? (results[0].score * 100).toFixed(1) + '%' : 'N/A'}</span>
              </div>
            </form>
          </div>

          <div className="flex-1 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {results.length > 0 ? (
                  <div className="space-y-4 py-4">
                    {results.map((result, idx) => (
                      <motion.div 
                        key={result.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-6 bg-white/[0.03] border border-white/5 hover:border-white/20 rounded-2xl group transition-all"
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-none w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 opacity-60">
                                <FileText size={16} />
                              </div>
                              <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-indigo-400 transition-colors uppercase italic">{result.name}</h3>
                            </div>
                            <p className="text-[13px] text-slate-400 font-medium leading-relaxed italic line-clamp-2 opacity-60 group-hover:opacity-100">
                              {result.snippet}
                            </p>
                          </div>
                          <div className="text-right flex-none w-24">
                            <div className="text-[9px] font-mono uppercase opacity-30 tracking-[0.2em] mb-1">Rank_Score</div>
                            <div className="text-2xl font-mono text-white font-black">{result.score.toFixed(4)}</div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                           <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(result.score * 100, 100)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                              />
                           </div>
                           <span className="text-[10px] font-mono text-indigo-400">Match_Confidence: {(result.score * 100).toFixed(1)}%</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-20">
                    <div className="w-20 h-20 border border-white/10 rounded-full flex items-center justify-center mb-8 bg-white/[0.02]">
                       <Search size={32} className="text-white/10" strokeWidth={1} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white opacity-20">
                      {query ? 'No_Matches_Stored_In_Neural_Index' : 'Awaiting_Query_Stream'}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <footer className="h-10 bg-black/40 border-t border-white/10 flex items-center px-8 justify-between text-[8px] font-mono tracking-[0.3em] uppercase opacity-40">
        <div className="flex gap-8">
          <span>Neural_Net_Core / 842-10-X</span>
          <span>Security_Token: Encrypted</span>
        </div>
        <div>SCAN_SYSTEM_OPERATIONAL / PORT_3000</div>
      </footer>
    </div>
  );
}

