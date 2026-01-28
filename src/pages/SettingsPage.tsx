import { useState, useEffect } from "react";
import { Settings, Key, Brain, Check, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModelSelector } from "@/components/ModelSelector";

export function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Load existing API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("GEMINI_API_KEY");
    if (savedKey) {
      setApiKey(savedKey);
      setHasApiKey(true);
    }
  }, []);

  function saveKey() {
    if (!apiKey || apiKey.trim().length < 10) {
      setError("لطفاً یک API Key صحیح وارد کنید.");
      setSuccess(false);
      return;
    }
    localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
    setError("");
    setSuccess(true);
    setHasApiKey(true);

    // Show success message then reset
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }

  function clearKey() {
    if (confirm("آیا مطمئن هستید که می‌خواهید API Key را پاک کنید؟")) {
      localStorage.removeItem("GEMINI_API_KEY");
      setApiKey("");
      setHasApiKey(false);
      setError("");
      setSuccess(false);
    }
  }

  return (
    <div className="p-2 sm:p-4 pb-8 space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
              <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
                تنظیمات
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                تنظیمات برنامه را مدیریت کنید
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-muted/10 via-transparent to-muted/10 pointer-events-none"></div>

        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Key className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">کلید API Gemini</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                برای استفاده از سرویس نیاز به کلید API دارید
              </p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                کلید API
              </label>
              <Input
                type="password"
                placeholder="کلید Gemini را وارد کنید..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError("");
                  setSuccess(false);
                }}
                className="text-right"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 sm:p-4 text-sm text-destructive flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-3 sm:p-4 text-sm text-success flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Check className="w-5 h-5 shrink-0" />
                <span className="font-medium">کلید با موفقیت ذخیره شد</span>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="gradient"
                size="lg"
                onClick={saveKey}
                className="flex-1"
              >
                ذخیره کلید
              </Button>
              {hasApiKey && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={clearKey}
                  className="flex-1"
                >
                  پاک کردن
                </Button>
              )}
            </div>

            {hasApiKey && (
              <div className="bg-success/5 border border-success/20 rounded-lg p-3 sm:p-4 text-sm text-success/80 flex items-start gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                <span>کلید API ذخیره شده است</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Selection Section */}
      <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>

        <div className="relative p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                انتخاب مدل هوش مصنوعی
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                مدل مورد نظر برای تبدیل صدا به متن را انتخاب کنید
              </p>
            </div>
          </div>

          <ModelSelector />

          <div className="mt-4 sm:mt-6 bg-muted/30 border border-border/30 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
            <p>
              مدل‌های مختلف سرعت و دقت متفاوتی دارند. مدل Flash سریع‌تر اما
              مدل‌های دیگر دقیق‌تر هستند.
            </p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

        <div className="relative p-4 sm:p-6 md:p-8">
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
            راهنمای دریافت API Key
          </h3>

          <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                1
              </div>
              <p className="flex-1">
                به سایت{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>{" "}
                بروید
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                2
              </div>
              <p className="flex-1">
                با حساب Google خود وارد شوید یا یک حساب جدید بسازید
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                3
              </div>
              <p className="flex-1">
                روی دکمه "Create API Key" کلیک کنید و کلید را کپی کنید
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm">
                4
              </div>
              <p className="flex-1">
                کلید را در بخش بالا وارد کرده و دکمه "ذخیره کلید" را بزنید
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
