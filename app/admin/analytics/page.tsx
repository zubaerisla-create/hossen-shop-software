'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Activity,
  Clock,
  TrendingUp,
  Globe,
  Monitor,
  Compass,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/app/utils/api';

interface OverviewData {
  totalVisitors: number;
  uniqueVisitors: number;
  returningVisitors: number;
  activeVisitors: number;
  totalSessions: number;
  pageViewsToday: number;
  pageViewsThisWeek: number;
  pageViewsThisMonth: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface VisitorSessionItem {
  sessionId: string;
  visitorId: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  device: string;
  landingPage: string;
  referrer: string;
  startedAt: string;
  lastActivity: string;
  pageViews: number;
}

interface ChartsData {
  visitorsByDay: { date: string; visitors: number; sessions: number; pageViews: number }[];
  visitorsByMonth: { month: string; count: number }[];
  topPages: { route: string; count: number }[];
  topLandingPages: { landingPage: string; count: number }[];
  topReferrers: { name: string; count: number }[];
  browserDistribution: { name: string; value: number }[];
  deviceDistribution: { name: string; value: number }[];
  countryDistribution: { name: string; value: number }[];
}

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#84cc16'];

export default function VisitorAnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [visitors, setVisitors] = useState<VisitorSessionItem[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeActiveCount, setRealtimeActiveCount] = useState<number | null>(null);

  const getHeaders = () => {
    const token = localStorage.getItem('apex_user_token');
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics/overview`, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        setOverview(json.data);
        if (realtimeActiveCount === null) {
          setRealtimeActiveCount(json.data.activeVisitors);
        }
      }
    } catch (e) {
      console.error('Failed to fetch overview metrics', e);
    }
  };

  const fetchCharts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics/charts`, { headers: getHeaders() });
      if (res.ok) {
        const json = await res.json();
        setCharts(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch charts data', e);
    }
  };

  const fetchVisitors = async (pageNum: number = 1) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/analytics/visitors?page=${pageNum}&limit=10`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const json = await res.json();
        setVisitors(json.data.visitors);
        setPagination({
          page: json.data.pagination.page,
          totalPages: json.data.pagination.totalPages,
          total: json.data.pagination.total,
        });
      }
    } catch (e) {
      console.error('Failed to fetch visitors list', e);
    }
  };

  const fetchAllData = async () => {
    setRefreshing(true);
    await Promise.all([fetchOverview(), fetchCharts(), fetchVisitors(pagination.page)]);
    setRefreshing(false);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();

    // Socket.io Realtime Listener
    let socket: any;
    try {
      socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });
      socket.on('analytics_realtime_update', () => {
        // Fetch realtime status quietly
        fetch(`${API_BASE_URL}/api/admin/analytics/realtime`, { headers: getHeaders() })
          .then((res) => res.json())
          .then((json) => {
            if (json.data?.activeVisitors !== undefined) {
              setRealtimeActiveCount(json.data.activeVisitors);
            }
          })
          .catch(() => {});
      });
    } catch (err) {
      // Socket fallback handled by interval polling
    }

    // Auto Refresh Interval every 15s for metrics
    const interval = setInterval(() => {
      fetchOverview();
    }, 15000);

    return () => {
      if (socket) socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (_) {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-zinc-500 animate-pulse">Loading Visitor Analytics & Metrics...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 space-y-8 text-zinc-900 dark:text-zinc-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Visitor & Realtime Analytics</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>LIVE TRACKING</span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Privacy-focused, lightweight, self-hosted website visitor telemetry & performance dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (10 Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Active Visitors (Live) */}
        <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Visitors</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Zap className="w-4 h-4 animate-bounce" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {realtimeActiveCount !== null ? realtimeActiveCount : overview?.activeVisitors || 0}
            </div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Active in last 5 mins
            </p>
          </div>
        </div>

        {/* Card 2: Total Visitors */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Visitors</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.totalVisitors.toLocaleString() || 0}</div>
            <p className="text-[11px] text-zinc-500 mt-1">All-time tracked visitors</p>
          </div>
        </div>

        {/* Card 3: Unique Visitors */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Unique (30d)</span>
            <Activity className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.uniqueVisitors.toLocaleString() || 0}</div>
            <p className="text-[11px] text-zinc-500 mt-1">New visitors last 30 days</p>
          </div>
        </div>

        {/* Card 4: Returning Visitors */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Returning</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.returningVisitors.toLocaleString() || 0}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Visitors with &gt;1 session</p>
          </div>
        </div>

        {/* Card 5: Total Sessions */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sessions</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.totalSessions.toLocaleString() || 0}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Completed browsing sessions</p>
          </div>
        </div>

        {/* Card 6: Page Views Today */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Views Today</span>
            <Eye className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.pageViewsToday.toLocaleString() || 0}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Page hits since midnight</p>
          </div>
        </div>

        {/* Card 7: Views This Week */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Views Week</span>
            <BarChart2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.pageViewsThisWeek.toLocaleString() || 0}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Page hits last 7 days</p>
          </div>
        </div>

        {/* Card 8: Views This Month */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Views Month</span>
            <PieIcon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.pageViewsThisMonth.toLocaleString() || 0}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Page hits last 30 days</p>
          </div>
        </div>

        {/* Card 9: Bounce Rate */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Bounce Rate</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{overview?.bounceRate || 0}%</div>
            <p className="text-[11px] text-zinc-500 mt-1">Single page view sessions</p>
          </div>
        </div>

        {/* Card 10: Avg Duration */}
        <div className="p-5 bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Duration</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-black">{formatDuration(overview?.avgSessionDuration || 0)}</div>
            <p className="text-[11px] text-zinc-500 mt-1">Time per session</p>
          </div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Trend Chart (Area Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base">Visitors & Sessions Trend (14 Days)</h3>
              <p className="text-xs text-zinc-500">Daily unique visitors, total sessions, and page view traffic</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Visitors
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Sessions
              </span>
            </div>
          </div>

          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.visitorsByDay || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisitors)" name="Visitors" />
                <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" name="Sessions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend (Bar Chart) */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base">Monthly Visitors</h3>
            <p className="text-xs text-zinc-500">6-month visitor acquisition history</p>
          </div>
          <div className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.visitorsByMonth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Visitors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Breakdown Charts Grid: Top Pages, Landing Pages, Referrers, Devices, Browsers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Top Pages */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-500" />
              Top Visited Pages
            </h3>
            <span className="text-xs text-zinc-500">Views</span>
          </div>
          <div className="space-y-3 pt-2">
            {charts?.topPages && charts.topPages.length > 0 ? (
              charts.topPages.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="truncate max-w-[200px] text-zinc-800 dark:text-zinc-200 font-mono">{item.route}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / (charts.topPages[0]?.count || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">No page views recorded yet</p>
            )}
          </div>
        </div>

        {/* Top Landing Pages */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              Top Landing Pages
            </h3>
            <span className="text-xs text-zinc-500">Sessions</span>
          </div>
          <div className="space-y-3 pt-2">
            {charts?.topLandingPages && charts.topLandingPages.length > 0 ? (
              charts.topLandingPages.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="truncate max-w-[200px] text-zinc-800 dark:text-zinc-200 font-mono">{item.landingPage}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / (charts.topLandingPages[0]?.count || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">No landing sessions recorded yet</p>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Top Referrers
            </h3>
            <span className="text-xs text-zinc-500">Sources</span>
          </div>
          <div className="space-y-3 pt-2">
            {charts?.topReferrers && charts.topReferrers.length > 0 ? (
              charts.topReferrers.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="truncate max-w-[200px] text-zinc-800 dark:text-zinc-200">{item.name}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{item.count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / (charts.topReferrers[0]?.count || 1)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">No referrers recorded yet</p>
            )}
          </div>
        </div>

        {/* Browser Distribution */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Monitor className="w-4 h-4 text-emerald-500" />
            Browser Distribution
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.browserDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.browserDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#fff', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Monitor className="w-4 h-4 text-amber-500" />
            Device Breakdown
          </h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.deviceDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.deviceDistribution || []).map((_, index) => (
                    <Cell key={`cell-device-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid #27272a', color: '#fff', fontSize: '11px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-rose-500" />
            Geographic Country Breakdown
          </h3>
          <div className="space-y-3 pt-2">
            {charts?.countryDistribution && charts.countryDistribution.length > 0 ? (
              charts.countryDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <span className="font-bold text-zinc-500">{item.value} visitors</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">No location data captured yet</p>
            )}
          </div>
        </div>

      </div>

      {/* Latest Visitors Table */}
      <div className="bg-white dark:bg-zinc-900/80 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-lg">Latest Visitors & Sessions</h3>
            <p className="text-xs text-zinc-500">Real-time session records, device details, and landing pages</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">Total sessions: {pagination.total}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 uppercase font-bold text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Visitor ID</th>
                <th className="p-3">Session ID</th>
                <th className="p-3">Country / City</th>
                <th className="p-3">Browser / OS</th>
                <th className="p-3">Device</th>
                <th className="p-3">Landing Page</th>
                <th className="p-3">Page Views</th>
                <th className="p-3">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
              {visitors.length > 0 ? (
                visitors.map((v) => (
                  <tr key={v.sessionId} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                    <td className="p-3 font-mono text-purple-600 dark:text-purple-400 font-bold truncate max-w-[110px]" title={v.visitorId}>
                      {v.visitorId.substring(0, 8)}...
                    </td>
                    <td className="p-3 font-mono text-zinc-500 truncate max-w-[110px]" title={v.sessionId}>
                      {v.sessionId.substring(0, 8)}...
                    </td>
                    <td className="p-3">
                      <span className="font-semibold">{v.country}</span>
                      {v.city && v.city !== 'Unknown City' && <span className="text-[10px] text-zinc-400 block">{v.city}</span>}
                    </td>
                    <td className="p-3">
                      <span>{v.browser}</span>
                      <span className="text-[10px] text-zinc-400 block">{v.os}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {v.device}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-zinc-600 dark:text-zinc-300 truncate max-w-[150px]" title={v.landingPage}>
                      {v.landingPage}
                    </td>
                    <td className="p-3 font-bold text-indigo-500">{v.pageViews}</td>
                    <td className="p-3 text-zinc-400 font-mono text-[11px]">{formatDate(v.lastActivity)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-zinc-400 italic">
                    No visitor sessions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchVisitors(pagination.page - 1)}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg disabled:opacity-40 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchVisitors(pagination.page + 1)}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg disabled:opacity-40 font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
