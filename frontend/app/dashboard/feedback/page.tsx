"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  MessageSquare, 
  Search, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatDistanceToNow } from "date-fns";

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    page: 1,
    limit: 50
  });

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const query = new URLSearchParams(Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    ) as Record<string, string>).toString();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback?${query}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch feedbacks.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFeedbacks();
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

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground">Detailed view and management of all user submissions.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchFeedbacks} className="gap-2 border-white/5 bg-white/5">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </header>

      <Card className="glass border-white/5">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search feedback..."
                className="pl-10 bg-white/5 border-white/5"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="bg-black border border-white/5 rounded-lg px-3 py-2 text-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="New">New</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <RefreshCw size={24} className="animate-spin text-primary" />
              </div>
            ) : feedbacks.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No feedback found.</p>
            ) : (
              <div className="grid gap-4">
                {feedbacks.map((item) => (
                  <Card key={item._id} className="bg-white/5 border-white/5 hover:border-primary/20 transition-colors">
                    <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            item.ai_sentiment === 'Positive' ? 'bg-emerald-500' : 
                            item.ai_sentiment === 'Negative' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full border border-white/10">{item.category}</span>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{item.content}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock size={10} /> {formatDistanceToNow(new Date(item.createdAt))} ago</span>
                          <span>•</span>
                          <span>By {item.submitterName || "Anonymous"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <select 
                            className={`text-xs h-8 rounded px-2 bg-black border border-white/10 ${
                              item.status === 'Resolved' ? 'text-emerald-400' : 
                              item.status === 'In Review' ? 'text-blue-400' : 'text-amber-400'
                            }`}
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                          >
                            <option value="New">New</option>
                            <option value="In Review">In Review</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <div className="flex items-center gap-2 justify-center">
                            <span className="text-[10px] text-muted-foreground">PRIORITY: {item.ai_priority || 0}/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
