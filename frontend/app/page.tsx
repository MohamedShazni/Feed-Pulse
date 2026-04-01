import FeedbackForm from "@/components/FeedbackForm";

export default function Home() {
  return (
    <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-24 bg-background">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-12 text-center animate-in">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary mb-2">
             ✨ AI-Powered Product Feedback
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 transition-all">
            Build with clarity <br />
            Driven by AI.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Collect, prioritize, and summarize product feedback effortlessly using Google Gemini AI. 
            Get instant insights into what your users truly want.
          </p>
        </header>

        <section className="w-full flex justify-center mt-4">
          <FeedbackForm />
        </section>

        <footer className="w-full flex justify-between items-center text-xs text-muted-foreground py-10 border-t border-white/5 opacity-50">
          <p>&copy; 2026 FeedPulse AI Platform. Built with Next.js and Gemini.</p>
          <div className="flex gap-4 underline underline-offset-4">
            <a href="/dashboard">Admin Dashboard</a>
            <a href="https://ai.google.dev" target="_blank">Google AI Studio</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
