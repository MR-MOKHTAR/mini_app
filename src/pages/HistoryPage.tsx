import { useEffect, useState } from "react";
import {
  History,
  Trash2,
  Clock,
  Clipboard,
  Check,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("TRANSCRIPTION_HISTORY");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error loading history:", e);
      }
    }
  }, []);

  function deleteFromHistory(id: string) {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("TRANSCRIPTION_HISTORY", JSON.stringify(updated));
      return updated;
    });
  }

  function clearHistory() {
    if (confirm("آیا مطمئن هستید که می‌خواهید تمام سابقه را پاک کنید؟")) {
      setHistory([]);
      localStorage.removeItem("TRANSCRIPTION_HISTORY");
    }
  }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "همین الان";
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString("fa-IR");
  }

  return (
    <div className="p-2 sm:p-4 pb-8 space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
              <History className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
                سابقه تبدیل‌ها
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                {history.length} مورد ذخیره شده
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={clearHistory}
              className="mt-4 sm:mt-6"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              پاک کردن همه
            </Button>
          )}
        </div>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-muted/20 via-transparent to-muted/20 pointer-events-none"></div>

          <div className="relative p-8 sm:p-12 md:p-16 text-center">
            <div className="p-4 sm:p-6 rounded-full bg-muted/30 w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
              <History className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
              سابقه خالی است
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              هنوز هیچ تبدیلی انجام نشده است
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-[1.01]"
            >
              <div className="absolute inset-0 bg-linear-to-br from-muted/10 via-transparent to-muted/10 pointer-events-none"></div>

              <div className="relative p-4 sm:p-5 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      {formatDate(item.timestamp)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-primary/10"
                      onClick={() => copyText(item.text, item.id)}
                      title="کپی متن"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                      ) : (
                        <Clipboard className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/10 text-destructive"
                      onClick={() => deleteFromHistory(item.id)}
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-linear-to-r from-primary/10 to-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                  <div className="relative whitespace-pre-wrap p-3 sm:p-4 rounded-lg bg-muted/30 text-sm sm:text-base leading-relaxed border border-border/30">
                    {item.text.length > 300
                      ? item.text.slice(0, 300) + "..."
                      : item.text}
                  </div>
                </div>

                {item.text.length > 300 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    ({item.text.length} کاراکتر)
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
