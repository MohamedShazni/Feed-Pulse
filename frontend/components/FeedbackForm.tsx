"use client";

import { useState } from "react";
import { toast } from "sonner";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/Card";
import { Loader2, MessageSquare, User, Mail, Tag } from "lucide-react";

export default function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Improvement",
    submitterName: "",
    submitterEmail: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title || formData.title.length > 120) {
      toast.error("Title is required and must be under 120 characters.");
      return;
    }
    if (formData.description.length < 20) {
      toast.error("Description must be at least 20 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Feedback submitted! Our AI is analyzing it now.");
        setFormData({
          title: "",
          description: "",
          category: "Improvement",
          submitterName: "",
          submitterEmail: "",
        });
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch (error) {
      toast.error("Failed to connect to the server.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card animate-in w-full max-w-2xl border-white/10">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <MessageSquare size={20} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Feedback Submission</span>
        </div>
        <CardTitle className="text-3xl font-bold">What's on your mind?</CardTitle>
        <CardDescription className="text-muted-foreground text-base">
          Help us build the future of our product. Your feedback is automatically analyzed by Gemini AI to ensure it gets the attention it deserves.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag size={14} /> Title
            </label>
            <Input
              name="title"
              placeholder="A short, descriptive title..."
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={120}
              autoFocus
            />
            <p className="text-[10px] text-muted-foreground text-right">{formData.title.length}/120</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="Bug">Bug</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Improvement">Improvement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare size={14} /> Description
            </label>
            <Textarea
              name="description"
              placeholder="Tell us more about your feedback... (min 20 characters)"
              value={formData.description}
              onChange={handleChange}
              required
            />
            <div className="flex justify-between items-center text-[12px]">
              <p className={formData.description.length < 20 ? "text-destructive" : "text-muted-foreground"}>
                {formData.description.length < 20 ? `Need ${20 - formData.description.length} more characters` : "Minimum length met"}
              </p>
              <p className="text-muted-foreground">{formData.description.length} characters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User size={14} /> Name (Optional)
              </label>
              <Input
                name="submitterName"
                placeholder="Mohamed Shazni"
                value={formData.submitterName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail size={14} /> Email (Optional)
              </label>
              <Input
                name="submitterEmail"
                type="email"
                placeholder="shazni07@gmail.com"
                value={formData.submitterEmail}
                onChange={handleChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
