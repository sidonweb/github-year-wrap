'use client';
import React, { useState, useRef } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {
  Github,
  Star,
  GitFork,
  Code,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Award,
} from 'lucide-react';
import html2canvas from 'html2canvas';

const GitHubYearWrap = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'wave' | 'calendar'>('wave');
  const cardRef = useRef<HTMLDivElement | null>(null);

  const COLORS = [
    '#FF6B35',
    '#F7931E',
    '#FDC830',
    '#37FF8B',
    '#00D9FF',
    '#A259FF',
  ];

  const fetchGitHubData = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch(
        `/api/github-stats?username=${encodeURIComponent(username)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const stats = await response.json();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (username.trim()) {
      fetchGitHubData();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;

    try {
      const element = cardRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${username || 'github'}-wrap-2025.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading card:', error);
      setError('Failed to download card. Please try again.');
    }
  };

  const formatStatValue = (value: any) => {
    if (typeof value === 'number') return value.toLocaleString();
    if (value) return String(value);
    return '-';
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-yellow-300 border-4 border-black p-8 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tight">
            GitHub Wrap 2025
          </h1>
          <p className="text-xl font-bold">Your year in code, visualized.</p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="bg-cyan-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter GitHub username"
                className="flex-1 px-6 py-4 text-xl font-bold border-4 border-black focus:outline-none focus:ring-0"
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xl px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Wrap It!'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-400 border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xl font-bold">❌ {error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {/* Download card button */}
            <div className="flex justify-end">
              <button
                onClick={handleDownloadCard}
                className="bg-black text-white font-black px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all uppercase"
              >
                Download Wrap Card
              </button>
            </div>

            {/* Card content for PNG */}
            <div
              ref={cardRef}
              className="bg-white border-4 border-black p-4 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8"
            >
              {/* User Info */}
              <div className="bg-purple-300 border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-6">
                  <img
                    src={data.user.avatar_url}
                    alt={data.user.name || data.user.login}
                    className="w-32 h-32 border-4 border-black"
                    crossOrigin="anonymous"
                  />
                  <div>
                    <h2 className="text-4xl font-black mb-2">
                      {data.user.name || data.user.login}
                    </h2>
                    <p className="text-xl font-bold text-gray-800">
                      @{data.user.login}
                    </p>
                    {data.user.bio && (
                      <p className="text-lg font-bold mt-2">{data.user.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Badges Section */}
              <div className="bg-linear-to-r from-purple-400 to-pink-400 border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8" />
                  <h3 className="text-3xl font-black uppercase">
                    Developer Badges
                  </h3>
                </div>
                <div className="space-y-4">
                  {data.badges.map((badge: string, index: number) => (
                    <div
                      key={index}
                      className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <p className="text-lg font-black">{badge}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: Code,
                    label: 'Repositories',
                    value: data.repos,
                    color: 'bg-red-400',
                  },
                  {
                    icon: Activity,
                    label: 'Commits',
                    value: data.totalCommits,
                    color: 'bg-green-400',
                  },
                  {
                    icon: Star,
                    label: 'Stars Earned',
                    value: data.totalStars,
                    color: 'bg-yellow-400',
                  },
                  {
                    icon: GitFork,
                    label: 'Forks',
                    value: data.totalForks,
                    color: 'bg-blue-400',
                  },
                  {
                    icon: TrendingUp,
                    label: 'Pull Requests',
                    value: data.totalPRs,
                    color: 'bg-pink-400',
                  },
                  {
                    icon: Calendar,
                    label: 'Issues',
                    value: data.totalIssues,
                    color: 'bg-purple-400',
                  },
                  {
                    icon: Users,
                    label: 'Followers',
                    value: data.user.followers,
                    color: 'bg-orange-400',
                  },
                  {
                    icon: Github,
                    label: 'Contributions',
                    value: data.contributions,
                    color: 'bg-cyan-400',
                  },
                  {
                    icon: Calendar,
                    label: 'Peak Day',
                    value: `${data.mostActiveDay} (${data.peakCommitsInDay})`,
                    color: 'bg-indigo-400',
                  },
                  {
                    icon: Calendar,
                    label: 'Peak Week',
                    value: data.mostActiveWeek,
                    color: 'bg-teal-400',
                  },
                  {
                    icon: Calendar,
                    label: 'Peak Month',
                    value: data.mostActiveMonth,
                    color: 'bg-rose-400',
                  },
                  {
                    icon: Calendar,
                    label: 'Most Active On',
                    value: `${data.mostActiveDayOfWeek}s`,
                    color: 'bg-lime-400',
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={`${stat.color} border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all`}
                  >
                    <stat.icon className="w-10 h-10 mb-3" />
                    <div className="text-3xl font-black mb-2">
                      {formatStatValue(stat.value)}
                    </div>
                    <div className="text-sm font-bold uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Activity Toggle */}
              <div className="bg-pink-300 border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-black uppercase">
                    Weekly Activity 2025
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('wave')}
                      className={`px-4 py-2 font-black border-4 border-black transition-all ${
                        viewMode === 'wave'
                          ? 'bg-black text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      WAVE
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-4 py-2 font-black border-4 border-black transition-all ${
                        viewMode === 'calendar'
                          ? 'bg-black text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      CALENDAR
                    </button>
                  </div>
                </div>

                {viewMode === 'wave' ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={data.weeklyCommits}>
                      <CartesianGrid strokeWidth={3} stroke="#000" />
                      <XAxis
                        dataKey="week"
                        stroke="#000"
                        strokeWidth={2}
                        style={{ fontWeight: 'bold' }}
                        interval={3}
                      />
                      <YAxis
                        stroke="#000"
                        strokeWidth={2}
                        style={{ fontWeight: 'bold' }}
                      />
                      <Tooltip
                        contentStyle={{
                          border: '2px solid black',
                          fontWeight: 'bold',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="commits"
                        stroke="#000"
                        strokeWidth={3}
                        fill="#FF6B35"
                        fillOpacity={0.5}
                        activeDot={{
                          r: 6,
                          fill: '#000',
                          stroke: '#000',
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="p-4 border-4 border-black">
                    <CalendarHeatmap
                      startDate={new Date('2025-01-01')}
                      endDate={new Date('2025-12-31')}
                      values={data.dailyCommits}
                      classForValue={(value) => {
                        if (!value || value.count === 0) {
                          return 'color-empty';
                        }
                        if (value.count < 3) return 'color-scale-1';
                        if (value.count < 6) return 'color-scale-2';
                        if (value.count < 10) return 'color-scale-3';
                        return 'color-scale-4';
                      }}
                      tooltipDataAttrs={(value: any) => {
                        return {
                          'data-tip': `${value.date}: ${value.count || 0} commits`,
                        };
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Language Pie */}
              <div className="bg-cyan-300 border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-3xl font-black mb-6 uppercase">
                  Language Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={data.languages}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => entry.name}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="count"
                      stroke="#000"
                      strokeWidth={3}
                    >
                      {data.languages.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        border: '4px solid black',
                        fontWeight: 'bold',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white text-center">
              <p className="text-2xl font-black uppercase">
                Made by{' '}
                <a
                  href="https://www.sidonweb.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  sidonweb
                </a>
                , ⭐ this project on{' '}
                <a
                  href="https://github.com/sidonweb/github-year-wrap"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  GitHub
                </a>
                !
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubYearWrap;
