"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  PieChart, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    total: 0,
    open: 0,
    resolved: 0,
    avgPriority: 0,
    sentiment: { positive: 0, neutral: 0, negative: 0 }
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.meta) {
          setStats(data.meta.stats);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Deep dive into user feedback trends and priority distributions.</p>
      </header>

      {/* Grid of basic stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Feedback Growth", value: "+12.5%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Active Reviewers", value: "8 Authors", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Resolution Rate", value: "78%", icon: PieChart, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Avg. Response", value: "1.2 Days", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass border-white/5 hover:bg-white/5 transition-colors group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="text-primary" size={18} />
              Priority Distribution
            </CardTitle>
            <CardDescription>A statistical view of priority scores assigned by Gemini AI.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center border-t border-white/5 bg-white/[0.02]">
            <div className="text-center text-muted-foreground group">
              <div className="flex justify-center mb-4 gap-2">
                 <div className="w-4 h-24 bg-red-500/40 rounded-t-sm" />
                 <div className="w-4 h-16 bg-amber-500/40 rounded-t-sm" />
                 <div className="w-4 h-32 bg-blue-500/40 rounded-t-sm" />
                 <div className="w-4 h-20 bg-emerald-500/40 rounded-t-sm" />
                 <div className="w-4 h-28 bg-primary/40 rounded-t-sm" />
              </div>
              <p className="text-sm italic">"Advanced Charts integration coming soon..."</p>
              <p className="text-[10px] mt-1">Average priority score: {stats.avgPriority || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="text-primary" size={18} />
              Recent Sentiment
            </CardTitle>
            <CardDescription>Overall sentiment analysis across all processed feedback.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col justify-center gap-6 border-t border-white/5 bg-white/[0.02] p-8">
            {[
              { label: 'Positive', width: '65%', color: 'bg-emerald-500' },
              { label: 'Neutral', width: '20%', color: 'bg-amber-500' },
              { label: 'Negative', width: '15%', color: 'bg-red-500' },
            ].map((bar, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{bar.label}</span>
                  <span>{bar.width}</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${bar.color} rounded-full`} style={{ width: bar.width }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-white/5 border-dashed bg-transparent p-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold mb-2">More Insights Pending</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          As you collect more feedback, our AI will generate detailed category distributions and time-series analysis here.
        </p>
      </Card>
    </div>
  );
}
