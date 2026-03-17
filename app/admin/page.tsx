'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock admin data
const ADMIN_STATS = {
  totalUsers: 1250,
  activeToday: 342,
  completedQuizzes: 3847,
  avgAccuracy: 87.5,
};

const USER_GROWTH = [
  { month: 'Jan', users: 120, quizzes: 145 },
  { month: 'Feb', users: 289, quizzes: 312 },
  { month: 'Mar', users: 456, quizzes: 521 },
  { month: 'Apr', users: 678, quizzes: 789 },
  { month: 'May', users: 892, quizzes: 1045 },
  { month: 'Jun', users: 1250, quizzes: 1456 },
];

const TRAIT_DISTRIBUTION = [
  { name: 'High Risk', value: 28, color: '#00d9ff' },
  { name: 'Moderate', value: 42, color: '#3b5bdb' },
  { name: 'Conservative', value: 30, color: '#6c8ff2' },
];

const RECENT_USERS = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', quizzesCompleted: 3, joined: '2 hours ago' },
  { id: 2, name: 'Jordan Smith', email: 'jordan@example.com', quizzesCompleted: 1, joined: '5 hours ago' },
  { id: 3, name: 'Casey Brown', email: 'casey@example.com', quizzesCompleted: 2, joined: '1 day ago' },
  { id: 4, name: 'Morgan Davis', email: 'morgan@example.com', quizzesCompleted: 4, joined: '2 days ago' },
  { id: 5, name: 'Riley Wilson', email: 'riley@example.com', quizzesCompleted: 1, joined: '3 days ago' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          TwinMind Admin
        </Link>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          Logout
        </Button>
      </nav>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-foreground-secondary">
              Manage users, analyze trends, and monitor system performance
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border">
            {(['overview', 'users', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium transition capitalize border-b-2 ${
                  activeTab === tab
                    ? 'border-accent text-accent'
                    : 'border-transparent text-foreground-secondary hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-foreground-secondary text-sm font-medium mb-2">Total Users</p>
                  <p className="text-3xl font-bold text-accent">{ADMIN_STATS.totalUsers}</p>
                  <p className="text-xs text-foreground-tertiary mt-2">+12% from last month</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-foreground-secondary text-sm font-medium mb-2">Active Today</p>
                  <p className="text-3xl font-bold text-accent">{ADMIN_STATS.activeToday}</p>
                  <p className="text-xs text-foreground-tertiary mt-2">Currently online</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-foreground-secondary text-sm font-medium mb-2">Completed Quizzes</p>
                  <p className="text-3xl font-bold text-accent">{ADMIN_STATS.completedQuizzes}</p>
                  <p className="text-xs text-foreground-tertiary mt-2">+8% this week</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="text-foreground-secondary text-sm font-medium mb-2">Avg Accuracy</p>
                  <p className="text-3xl font-bold text-accent">{ADMIN_STATS.avgAccuracy}%</p>
                  <p className="text-xs text-foreground-tertiary mt-2">Model confidence</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">User Growth Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={USER_GROWTH}>
                      <CartesianGrid stroke="#252552" />
                      <XAxis dataKey="month" stroke="#b0b9d4" />
                      <YAxis stroke="#b0b9d4" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#16213e',
                          border: '1px solid #252552',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#00d9ff" name="New Users" strokeWidth={2} />
                      <Line type="monotone" dataKey="quizzes" stroke="#3b5bdb" name="Quizzes Completed" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Distribution Chart */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Risk Tolerance Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={TRAIT_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {TRAIT_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#16213e',
                          border: '1px solid #252552',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-background/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-foreground-secondary font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-foreground-secondary font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-foreground-secondary font-semibold">Quizzes</th>
                    <th className="px-6 py-4 text-left text-foreground-secondary font-semibold">Joined</th>
                    <th className="px-6 py-4 text-left text-foreground-secondary font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_USERS.map((user, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-background/50 transition">
                      <td className="px-6 py-4 text-foreground">{user.name}</td>
                      <td className="px-6 py-4 text-foreground-secondary">{user.email}</td>
                      <td className="px-6 py-4 text-foreground">{user.quizzesCompleted}</td>
                      <td className="px-6 py-4 text-foreground-secondary">{user.joined}</td>
                      <td className="px-6 py-4">
                        <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Daily Quiz Completions</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={USER_GROWTH}>
                    <CartesianGrid stroke="#252552" />
                    <XAxis dataKey="month" stroke="#b0b9d4" />
                    <YAxis stroke="#b0b9d4" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#16213e',
                        border: '1px solid #252552',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="quizzes" fill="#00d9ff" name="Completions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Top Scenarios</h3>
                  <div className="space-y-2">
                    {['Career Risk', 'Social Event', 'Leadership Decision', 'Major Purchase'].map((scenario) => (
                      <div key={scenario} className="flex justify-between text-sm">
                        <span className="text-foreground-secondary">{scenario}</span>
                        <span className="text-accent font-medium">{Math.floor(Math.random() * 50 + 30)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Model Performance</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Prediction Accuracy</p>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: '87.5%' }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Average Confidence</p>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: '82%' }} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary mb-1">Response Time</p>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: '95%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
