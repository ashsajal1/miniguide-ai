"use client";

import { AnalyticsData } from "@/lib/analytics-service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['var(--color-accent)', 'var(--color-accent-deep)', 'var(--color-thu)', 'var(--color-wed)', 'var(--color-fri)'];

interface AdminDashboardProps {
  analyticsData: AnalyticsData;
}

export default function AdminDashboard({ analyticsData }: AdminDashboardProps) {
  const statsCards = [
    {
      title: "Total Users",
      value: analyticsData.totalUsers,
      description: "Registered users on the platform",
    },
    {
      title: "Total Courses",
      value: analyticsData.totalCourses,
      description: "Courses created by instructors",
    },
    {
      title: "Total Enrollments",
      value: analyticsData.totalEnrollments,
      description: "Students enrolled in courses",
    },
    {
      title: "Total Modules",
      value: analyticsData.totalModules,
      description: "Learning modules across all courses",
    },
    {
      title: "Average Rating",
      value: analyticsData.averageRating.toFixed(1),
      description: "Average course rating out of 5",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => (
          <div key={stat.title} className="rounded-[14px] border border-rule bg-card p-5">
            <div className="space-y-1.5">
              <h3 className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </h3>
            </div>
            <div className="pt-2">
              <div className="font-mono text-2xl font-medium text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[14px] border border-rule bg-card p-5">
          <div className="mb-4 space-y-1.5">
            <h3 className="text-lg text-foreground">Course Creation Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly course creation over the last 12 months</p>
          </div>
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.courseCreationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[14px] border border-rule bg-card p-5">
          <div className="mb-4 space-y-1.5">
            <h3 className="text-lg text-foreground">Enrollment Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly enrollments over the last 12 months</p>
          </div>
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.enrollmentTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="var(--color-accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[14px] border border-rule bg-card p-5">
          <div className="mb-4 space-y-1.5">
            <h3 className="text-lg text-foreground">Category Distribution</h3>
            <p className="text-sm text-muted-foreground">Courses by category</p>
          </div>
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="var(--color-accent)"
                  dataKey="count"
                >
                  {analyticsData.categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[14px] border border-rule bg-card p-5">
          <div className="mb-4 space-y-1.5">
            <h3 className="text-lg text-foreground">User Level Distribution</h3>
            <p className="text-sm text-muted-foreground">User skill levels across the platform</p>
          </div>
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.userLevelDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-accent-soft)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
