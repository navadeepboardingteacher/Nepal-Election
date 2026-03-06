import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Info, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Globe,
  Award,
  Newspaper,
  Map as MapIcon,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { electionApi, Province, District, Candidate, SearchResponse } from "./services/electionApi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const App: React.FC = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [provincesMap, setProvincesMap] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [electionData, setElectionData] = useState<SearchResponse | null>(null);
  const [nationalSummary, setNationalSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { provinces, districts } = await electionApi.getInitialData();
        setProvinces(provinces);
        setDistricts(districts);
        
        // Default to first province and its first district
        if (provinces.length > 0) {
          const firstProv = provinces[0];
          setSelectedProvince(firstProv.province_number);
          const firstDist = districts.find(d => d.province_number === firstProv.province_number);
          if (firstDist) {
            setSelectedDistrict(firstDist.disrict_number);
            fetchResults(firstDist.disrict_number);
          }
        }

        // Fetch map data
        const mapData = await electionApi.getProvincesMap();
        setProvincesMap(mapData);
      } catch (err) {
        setError("Failed to load initial election data. Please check your connection.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);
        const summary = await electionApi.getSummary();
        setNationalSummary(summary);
      } catch (err) {
        console.error("Failed to fetch national summary", err);
      } finally {
        setSummaryLoading(false);
      }
    };

    const fetchNews = async () => {
      try {
        setNewsLoading(true);
        const newsData = await electionApi.getNews();
        setNews(newsData);
      } catch (err) {
        console.error("Failed to fetch news", err);
      } finally {
        setNewsLoading(false);
      }
    };

    init();
    fetchSummary();
    fetchNews();
  }, []);

  const fetchResults = async (districtNum: string) => {
    try {
      setSearchLoading(true);
      const results = await electionApi.searchResults(1, districtNum);
      setElectionData(results);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch results for the selected district.");
    } finally {
      setSearchLoading(false);
    }
  };

  const filteredDistricts = useMemo(() => {
    return districts.filter(d => d.province_number === selectedProvince);
  }, [districts, selectedProvince]);

  const handleProvinceChange = (provNum: string) => {
    setSelectedProvince(provNum);
    const firstDist = districts.find(d => d.province_number === provNum);
    if (firstDist) {
      setSelectedDistrict(firstDist.disrict_number);
      fetchResults(firstDist.disrict_number);
    }
  };

  const handleDistrictChange = (distNum: string) => {
    setSelectedDistrict(distNum);
    fetchResults(distNum);
  };

  const chartData = useMemo(() => {
    if (!nationalSummary || nationalSummary.length === 0) return [];
    
    return nationalSummary
      .map(stat => ({ name: stat.party, value: stat.total_votes }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [nationalSummary]);

  const currentProvinceMap = useMemo(() => {
    return provincesMap.find(p => p.id.toString() === selectedProvince);
  }, [provincesMap, selectedProvince]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-t-2 border-emerald-500 border-r-2 border-emerald-500/30 rounded-full mx-auto mb-6"
          />
          <p className="text-emerald-500 font-mono tracking-[0.2em] uppercase text-sm animate-pulse">Initializing OSINT Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-emerald-500/30">
      {/* Top Navigation Bar */}
      <nav className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center group hover:bg-emerald-500/20 transition-all duration-500">
              <Globe className="w-7 h-7 text-emerald-500 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">
                Nepal Election <span className="text-emerald-500">OSINT</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Live Intelligence Feed 2082</p>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">System Status</span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Operational / Secure</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Last Sync</span>
              <span className="text-xs font-bold text-white uppercase tracking-tighter">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Sidebar: Controls & Map */}
          <div className="lg:col-span-3 space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Geospatial Filters</h2>
              </div>
              
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-mono uppercase text-zinc-600 mb-2 tracking-widest group-hover:text-emerald-500 transition-colors">Province Sector</label>
                  <div className="relative">
                    <select 
                      value={selectedProvince}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-4 appearance-none focus:outline-none focus:border-emerald-500/50 transition-all text-white font-bold text-sm hover:bg-zinc-900"
                    >
                      {provinces.map(p => (
                        <option key={p.id} value={p.province_number}>{p.province_en}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-[10px] font-mono uppercase text-zinc-600 mb-2 tracking-widest group-hover:text-emerald-500 transition-colors">District Node</label>
                  <div className="relative">
                    <select 
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-4 appearance-none focus:outline-none focus:border-emerald-500/50 transition-all text-white font-bold text-sm hover:bg-zinc-900"
                    >
                      {filteredDistricts.map(d => (
                        <option key={d.id} value={d.disrict_number}>{d.disrict_name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Province Map</h3>
                <MapIcon className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="aspect-square bg-[#0a0a0a] rounded-2xl border border-white/5 p-4 flex items-center justify-center overflow-hidden group">
                {currentProvinceMap ? (
                  <div 
                    className="w-full h-full transition-transform duration-700 group-hover:scale-110"
                    dangerouslySetInnerHTML={{ __html: currentProvinceMap.map_code }}
                  />
                ) : (
                  <div className="text-zinc-700 font-mono text-[10px] uppercase">No Map Data</div>
                )}
              </div>
              <p className="text-[10px] text-zinc-600 font-mono leading-relaxed">
                Interactive geospatial visualization of the selected province sector. Hover over districts for detailed telemetry.
              </p>
            </section>
          </div>

          {/* Center Content: Main Intelligence Feed */}
          <div className="lg:col-span-6 space-y-10">
            <section className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                  District Intelligence <span className="text-zinc-600">/ {electionData?.district_en || "Sector"}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  {Object.keys(electionData?.data || {}).length} Active Areas
                </span>
              </div>
            </section>

            {searchLoading ? (
              <div className="h-[600px] flex items-center justify-center bg-zinc-900/10 border border-white/5 rounded-3xl border-dashed">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-6 opacity-50" />
                  <p className="text-sm text-zinc-600 font-mono tracking-widest uppercase">Decrypting Intelligence Feed...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {electionData && (Object.entries(electionData.data) as [string, Candidate[]][]).map(([area, candidates], idx) => {
                    const sorted = [...candidates].sort((a, b) => (Number(b.vote) || 0) - (Number(a.vote) || 0));
                    
                    return (
                      <motion.div 
                        key={area}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                        className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 group"
                      >
                        <div className="px-8 py-5 border-b border-white/5 bg-zinc-900/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{area}</h3>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            {sorted.reduce((acc, c) => acc + (Number(c.vote) || 0), 0).toLocaleString()} Total Votes
                          </span>
                        </div>
                        
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                          {sorted.length > 0 ? (
                            sorted.slice(0, 2).map((candidate, i) => (
                              <div 
                                key={candidate.id} 
                                className={cn(
                                  "relative flex flex-col gap-5 p-6 rounded-2xl border transition-all duration-500",
                                  i === 0 
                                    ? "border-emerald-500/30 bg-emerald-500/[0.03] shadow-[0_0_30px_rgba(16,185,129,0.05)]" 
                                    : "border-white/5 bg-zinc-900/40 hover:border-zinc-700"
                                )}
                              >
                                {i === 0 && (
                                  <div className="absolute -top-3 left-6 px-3 py-1 bg-emerald-500 text-[10px] font-black text-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                    Leading
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-5">
                                  <div className="relative shrink-0">
                                    <img 
                                      src={candidate.candidate_picture} 
                                      alt={candidate.name_en}
                                      className={cn(
                                        "w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-700",
                                        i === 0 ? "border-2 border-emerald-500/50" : "border border-white/10"
                                      )}
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${candidate.id}/200/200`;
                                      }}
                                    />
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-2 border-[#0a0a0a] bg-white p-1 shadow-xl">
                                      <img 
                                        src={candidate.party_logo} 
                                        className="w-full h-full object-contain"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className={cn(
                                      "font-black tracking-tight text-lg leading-tight truncate",
                                      i === 0 ? "text-white" : "text-zinc-300"
                                    )}>{candidate.name_en}</h4>
                                    <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1 truncate">{candidate.party}</p>
                                  </div>
                                </div>

                                <div className="mt-auto pt-5 border-t border-white/5 flex items-end justify-between">
                                  <div>
                                    <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest block mb-1">Vote Count</span>
                                    <span className={cn(
                                      "text-2xl font-black font-mono tracking-tighter",
                                      i === 0 ? "text-emerald-500" : "text-zinc-400"
                                    )}>{(Number(candidate.vote) || 0).toLocaleString()}</span>
                                  </div>
                                  <div className="h-10 w-10 rounded-full border border-white/5 flex items-center justify-center group/btn hover:bg-white/5 transition-colors cursor-pointer">
                                    <ExternalLink className="w-4 h-4 text-zinc-600 group-hover/btn:text-white transition-colors" />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 flex flex-col items-center justify-center h-40 text-zinc-700 border border-white/5 border-dashed rounded-2xl">
                              <Info className="w-8 h-8 mb-3 opacity-20" />
                              <span className="text-[10px] font-mono uppercase tracking-[0.2em]">No Intelligence Data Available</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Right Sidebar: Analytics & News */}
          <div className="lg:col-span-3 space-y-10">
            {/* National Summary */}
            <section className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">National Overview</h3>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{ fill: '#52525b', fontSize: 9, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ 
                        backgroundColor: '#0a0a0a', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#27272a'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {summaryLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin opacity-30" />
                  </div>
                ) : nationalSummary.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all duration-300 group">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-xs font-black text-zinc-300 truncate group-hover:text-white transition-colors">{stat.party}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">{stat.total_votes.toLocaleString()} Votes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center min-w-[32px]">
                        <span className="block text-sm font-black font-mono text-emerald-500">{stat.leads}</span>
                        <span className="block text-[8px] font-mono text-zinc-700 uppercase">L</span>
                      </div>
                      <div className="text-center min-w-[32px]">
                        <span className="block text-sm font-black font-mono text-white">{stat.wins}</span>
                        <span className="block text-[8px] font-mono text-zinc-700 uppercase">W</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* News Feed */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Intelligence Feed</h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-600 uppercase">Ratopati News</span>
              </div>

              <div className="space-y-4">
                {newsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-zinc-900/30 border border-white/5 rounded-2xl animate-pulse" />
                  ))
                ) : news.map((item, i) => (
                  <motion.a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 bg-zinc-900/20 border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-zinc-900/40 transition-all duration-500 group"
                  >
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/5">
                      <img 
                        src={item.image} 
                        alt="" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-zinc-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-mono text-zinc-600 uppercase">{item.time}</span>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer Terminal */}
      <footer className="border-t border-white/5 mt-20 py-12 bg-[#0a0a0a]">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Data Source: PSBNepal / Ratopati</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Nepal Election OSINT v2.82.0-STABLE</p>
          </div>
          
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest cursor-help hover:text-white transition-colors">Privacy Protocol</span>
            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest cursor-help hover:text-white transition-colors">API Documentation</span>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-white uppercase tracking-widest">
              Secure Terminal Connection
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.2);
        }
        
        /* Map SVG Styling */
        svg path {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        svg path:hover {
          fill: rgba(16, 185, 129, 0.4) !important;
          stroke: #10b981 !important;
          stroke-width: 1px !important;
        }
        svg text {
          pointer-events: none;
          fill: #71717a !important;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default App;
