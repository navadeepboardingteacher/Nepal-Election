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
  Award
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
import { motion, AnimatePresence } from "motion/react";
import { electionApi, Province, District, Candidate, SearchResponse } from "./services/electionApi";

const App: React.FC = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [electionData, setElectionData] = useState<SearchResponse | null>(null);
  const [nationalSummary, setNationalSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
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

    init();
    fetchSummary();
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

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provNum = e.target.value;
    setSelectedProvince(provNum);
    const firstDist = districts.find(d => d.province_number === provNum);
    if (firstDist) {
      setSelectedDistrict(firstDist.disrict_number);
      fetchResults(firstDist.disrict_number);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distNum = e.target.value;
    setSelectedDistrict(distNum);
    fetchResults(distNum);
  };

  // Prepare chart data from national summary
  const chartData = useMemo(() => {
    if (!nationalSummary || nationalSummary.length === 0) return [];
    
    return nationalSummary
      .map(stat => ({ name: stat.party, value: stat.total_votes }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [nationalSummary]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-emerald-500 font-mono tracking-widest uppercase">Initializing OSINT Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">NEPAL ELECTION <span className="text-emerald-500">OSINT</span></h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Real-time Election Intelligence Terminal</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full text-xs">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-zinc-400">Live Data Stream Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 tracking-widest">Province Sector</label>
            <div className="relative">
              <select 
                value={selectedProvince}
                onChange={handleProvinceChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
              >
                {provinces.map(p => (
                  <option key={p.id} value={p.province_number}>{p.province_en}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 rotate-90" />
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl">
            <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-2 tracking-widest">District Node</label>
            <div className="relative">
              <select 
                value={selectedDistrict}
                onChange={handleDistrictChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-emerald-500/50 transition-colors text-white"
              >
                {filteredDistricts.map(d => (
                  <option key={d.id} value={d.disrict_number}>{d.disrict_name}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 rotate-90" />
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-emerald-500/70 mb-1 tracking-widest">Election Status</p>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">2082 General</h3>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500/50" />
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {searchLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-sm text-zinc-500 font-mono">Decrypting District Data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Data Grid */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-emerald-500" />
                  Constituency Intelligence
                </h2>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                  {Object.keys(electionData?.data || {}).length} SECTORS IDENTIFIED
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {electionData && (Object.entries(electionData.data) as [string, Candidate[]][]).map(([area, candidates], idx) => {
                    const sorted = [...candidates].sort((a, b) => (Number(b.vote) || 0) - (Number(a.vote) || 0));
                    const winner = sorted[0];
                    const runnerUp = sorted[1];
                    
                    return (
                      <motion.div 
                        key={area}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300"
                      >
                        <div className="p-4 border-b border-zinc-800/50 bg-zinc-900/20 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-zinc-200">{area}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              {sorted.reduce((acc, c) => acc + (Number(c.vote) || 0), 0).toLocaleString()} TOTAL VOTES
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6 flex flex-col gap-4">
                          {sorted.length > 0 ? (
                            sorted.slice(0, 2).map((candidate, i) => (
                              <div key={candidate.id} className={`relative flex items-center gap-4 p-3 rounded-xl border transition-colors ${i === 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700'}`}>
                                {i === 0 && <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-emerald-500 text-[10px] font-bold text-black rounded uppercase tracking-tighter z-10">Leading</div>}
                                {i === 1 && <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-zinc-700 text-[10px] font-bold text-white rounded uppercase tracking-tighter z-10">Runner Up</div>}
                                <div className="relative shrink-0">
                                  <img 
                                    src={candidate.candidate_picture} 
                                    alt={candidate.name_en}
                                    className={`w-14 h-14 rounded-xl object-cover ${i === 0 ? 'border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border border-zinc-700'}`}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${candidate.id}/200/200`;
                                    }}
                                  />
                                  <img 
                                    src={candidate.party_logo} 
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-zinc-900 bg-white p-0.5"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-bold ${i === 0 ? 'text-white' : 'text-zinc-300'} text-sm leading-tight truncate`}>{candidate.name_en}</h4>
                                  <p className="text-[10px] text-zinc-500 truncate">{candidate.party}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className={`text-lg font-mono font-bold ${i === 0 ? 'text-emerald-500' : 'text-zinc-400'}`}>{(Number(candidate.vote) || 0).toLocaleString()}</span>
                                  </div>
                                  <span className="text-[9px] text-zinc-600 font-mono block">VOTES</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-center h-16 text-zinc-600 text-xs font-mono uppercase">No Data Available</div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Analytics & AI */}
            <div className="lg:col-span-4 space-y-8">
              {/* Party Distribution Chart */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Party Distribution
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        tick={{ fill: '#71717a', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: '#18181b' }}
                        contentStyle={{ 
                          backgroundColor: '#09090b', 
                          border: '1px solid #27272a',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3f3f46'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Party Overview */}
              <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                  <Award className="w-4 h-4 text-emerald-500" />
                  National Party Overview
                </h3>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {summaryLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    </div>
                  ) : nationalSummary.length > 0 ? (
                    nationalSummary.map((stat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl hover:border-emerald-500/20 transition-colors">
                        <div className="flex-1 min-w-0 pr-4">
                          <h4 className="text-sm font-bold text-zinc-200 truncate">{stat.party}</h4>
                          <p className="text-[10px] font-mono text-zinc-500 uppercase">{stat.total_votes.toLocaleString()} Total Votes</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-center min-w-[40px]">
                            <span className="block text-lg font-mono font-bold text-emerald-500">{stat.leads}</span>
                            <span className="block text-[9px] font-mono text-zinc-600 uppercase">Lead</span>
                          </div>
                          <div className="text-center min-w-[40px]">
                            <span className="block text-lg font-mono font-bold text-white">{stat.wins}</span>
                            <span className="block text-[9px] font-mono text-zinc-600 uppercase">Win</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-zinc-600 text-xs font-mono uppercase">
                      No National Data Available
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Total Sectors</p>
                  <p className="text-xl font-bold text-white">{Object.keys(electionData?.data || {}).length}</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
                  <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">Leading Party</p>
                  <p className="text-xl font-bold text-emerald-500 truncate">
                    {chartData[0]?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 mt-12 py-8 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Election Data Source: Election Commission of Nepal (via PSBNepal)</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-600 uppercase">Terminal Version 2.0.82-BETA</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
