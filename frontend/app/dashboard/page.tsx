"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart3,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  Clock,
  Sparkles,
  Trash2,
  ExternalLink,
  Loader2
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [summary, setSummary] = useState("");
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, pages: 1, stats: {} });
  const [filters, setFilters] = useState<any>({
    page: 1,
    limit: 10,
    category: "",
    status: "",
    sort: "date",
    search: "",
  });

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    // Construct query string
    const query = new URLSearchParams(Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    ) as Record<string, string>).toString();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback?${query}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFeedbacks(data.data);
        setMeta(data.meta);
      } else {
        toast.error(data.error || "Failed to fetch feedbacks.");
      }
    } catch (error) {
      toast.error("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback/summary`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSummary(data.data.summary);
      }
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    fetchSummary();
  }, [fetchFeedbacks]);

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Status updated to ${status}`);
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Feedback deleted successfully.");
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error("Failed to delete feedback.");
    }
  };

  const handleReanalyze = async (id: string) => {
    const token = localStorage.getItem("token");
    toast.info("AI Analysis started...");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback/${id}/reanalyze`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("AI Re-analysis complete!");
        fetchFeedbacks();
      }
    } catch (error) {
      toast.error("Failed to re-analyze.");
    }
  };

  const statsCards = useMemo(() => [
    { label: "Total Feedback", value: meta.stats?.total || 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Open Items", value: meta.stats?.open || 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Avg. Priority", value: meta.stats?.avgPriority || "0.0", icon: BarChart3, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Most Common Tag", value: meta.stats?.mostCommonTag || "N/A", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ], [meta.stats]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Main Stats */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">Monitor and manage all incoming user feedback.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { fetchFeedbacks(); fetchSummary(); }} className="gap-2 border-white/5 bg-white/5 cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Link href="/" target="_blank">
            <Button variant="primary" size="sm" className="gap-2 cursor-pointer">
              <ExternalLink size={14} />
              Public Form
            </Button>
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in cursor-pointer" style={{ animationDelay: "0.1s" }}>
        {statsCards.map((stat, i) => (
          <Card key={i} className="glass border-white/5 hover:bg-white/5 transition-colors group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Trend Summary */}
      <Card className="glass-card border-white/10 animate-in" style={{ animationDelay: "0.2s" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="text-primary" size={18} />
              AI-Generated Trend Summary
            </CardTitle>
            {summaryLoading && <Loader2 className="animate-spin text-primary" size={16} />}
          </div>
          <CardDescription>Top themes extracted from recent feedback using Gemini 3 Flash.</CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading && !summary ? (
            <div className="h-10 w-full animate-pulse bg-white/5 rounded" />
          ) : (
            <p className="text-md leading-relaxed text-foreground/90 italic">
              "{summary || "Submit more feedback for Gemini to identify trends."}"
            </p>
          )}
        </CardContent>
      </Card>

      {/* Feedback Table Section */}
      <Card className="glass border-white/5 overflow-hidden animate-in" style={{ animationDelay: "0.3s" }}>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription className="mt-1">Filtering through {meta.total} submissions.</CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-[200px] bg-white/5 border-white/5 h-9 text-xs"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                />
              </div>

              <select
                className="h-9 rounded-md border border-white/5 bg-black px-3 py-1 text-xs focus:outline-none"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              >
                <option value="">All Categories</option>
                <option value="Bug">Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Improvement">Improvement</option>
                <option value="Other">Other</option>
              </select>

              <select
                className="h-9 rounded-md border border-white/5 bg-black px-3 py-1 text-xs focus:outline-none"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>

              <select
                className="h-9 rounded-md border border-white/5 bg-black px-3 py-1 text-xs focus:outline-none"
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              >
                <option value="date">Newest</option>
                <option value="priority">Top Priority</option>
                <option value="sentiment">Sentiment</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-t border-white/5">
              <thead className="bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Feedback</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">AI Insight</th>
                  <th className="px-6 py-4 font-medium text-center">Score</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No feedback found matching your criteria.
                    </td>
                  </tr>
                ) : feedbacks.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 max-w-md">
                        <span className="font-semibold truncate">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })} • {item.submitterName || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${item.category === 'Bug' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        item.category === 'Feature Request' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {item.ai_processed ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${item.ai_sentiment === 'Positive' ? 'bg-emerald-500' :
                                item.ai_sentiment === 'Negative' ? 'bg-red-500' : 'bg-amber-500'
                                }`} />
                              <span className="text-xs font-medium">{item.ai_sentiment}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.ai_tags?.slice(0, 2).map((tag, idx) => (
                                <span key={idx} className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">#{tag}</span>
                              ))}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin" /> Processing...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center h-8 w-8 rounded-full border-2 font-bold text-xs ${item.ai_priority >= 8 ? 'border-red-500/50 text-red-500' :
                        item.ai_priority >= 5 ? 'border-amber-500/50 text-amber-500' : 'border-emerald-500/50 text-emerald-500'
                        }`}>
                        {item.ai_priority || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`text-xs h-7 rounded px-2 bg-transparent border border-white/10 ${item.status === 'Resolved' ? 'text-emerald-400' :
                          item.status === 'In Review' ? 'text-blue-400' : 'text-amber-400'
                          }`}
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                      >
                        <option value="New">New</option>
                        <option value="In Review">In Review</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" title="AI Re-analyze" onClick={() => handleReanalyze(item._id)}>
                          <RefreshCw size={14} className="cursor-pointer" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" title="Delete" onClick={() => handleDelete(item._id)}>
                          <Trash2 size={14} className="cursor-pointer" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="py-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {feedbacks.length} of {meta.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 border-white/5"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs">Page {filters.page} of {meta.pages}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2 border-white/5"
              disabled={filters.page === meta.pages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Minimal Link component proxy if not fully available in scope
function Link({ href, children, ...props }: any) {
  const router = useRouter();
  return (
    <a href={href}
      onClick={(e) => { e.preventDefault(); router.push(href); }}
      {...props}
    >
      {children}
    </a>
  );
}
