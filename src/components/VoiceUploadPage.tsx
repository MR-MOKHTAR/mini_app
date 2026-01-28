import { useEffect, useState } from "react";
import { Upload, FileAudio, Clipboard } from "lucide-react";
import { useModel } from "@/context/ModelContext";
import { Button } from "@/components/ui/button";

const transcriptionPrompt = `
      You are an expert multilingual transcriber for ARABIC and PERSIAN audio.

          **CRITICAL MISSION**: Preserve the EXACT ORIGINAL LANGUAGE of each sentence/phrase based on CONTEXT, not individual letters.

          **THE PROBLEM YOU MUST AVOID**:
          Many words are identical or similar in both languages (الله، کتاب، مدرسه، etc.)
          DO NOT decide language based on individual words.
          Instead, detect language from SENTENCE CONTEXT, ACCENT, and GRAMMAR PATTERNS.

          **CONTEXT-BASED DETECTION**:
          1. Listen to the SPEAKER'S ACCENT and pronunciation style
          2. Observe SENTENCE STRUCTURE and grammar
          3. Notice connecting words and particles:
            - Arabic uses: في، من، إلى، أن، الذي، التي، هذا، هذه
            - Persian uses: در، از، به، که، این، آن، را، برای
          4. Pay attention to VERB CONJUGATIONS (Arabic vs Persian patterns)

          **TRANSCRIPTION STRATEGY**:
          - If a sentence sounds like ARABIC speech → write it in ARABIC script
            (use: ك ي ة for Arabic-specific letters)
          - If a sentence sounds like PERSIAN speech → write it in PERSIAN script
            (use: ک ی for Persian-specific letters)
          - For SHARED WORDS (like الله، محمد): follow the language of the sentence context

          **GOLDEN RULE**: 
          Write each sentence in the language it was SPOKEN in, not the language individual words "look like".

          **CLEAN VERBATIM RULES**:
          1. Remove fillers: اومم، ااه، يعني، مثلاً، خب
          2. Remove stutters and false starts
          3. Fix obvious mistakes based on context
          4. Natural punctuation
          5. Keep ALL meaningful content
          6. Preserve religious terms, names, technical words as spoken
          7. NEVER translate - NEVER change language

          **OUTPUT**: 
          Return ONLY the transcript in plain text. NO explanations, NO language labels, NO formatting.
      `;

interface HistoryItem {
  id: string;
  text: string;
  timestamp: number;
}

export function VoiceUploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const { model } = useModel();

  // Load current result from localStorage on mount
  useEffect(() => {
    const getMainText = localStorage.getItem("MAIN_TEXT");
    if (getMainText) {
      setResult(getMainText);
    }
  }, []);

  // Save to history when result changes
  useEffect(() => {
    if (result && result.trim()) {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        text: result,
        timestamp: Date.now(),
      };

      // Get existing history
      const savedHistory = localStorage.getItem("TRANSCRIPTION_HISTORY");
      let history: HistoryItem[] = [];
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error("Error loading history:", e);
        }
      }

      // Add new item and keep only last 10
      const updated = [newItem, ...history].slice(0, 10);
      localStorage.setItem("TRANSCRIPTION_HISTORY", JSON.stringify(updated));
    }
  }, [result]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      alert("فقط فایل صوتی مجاز است.");
      return;
    }

    setAudioFile(file);
  }

  async function sendToGemini() {
    if (!audioFile) return;

    setLoading(true);
    setShowFull(false);
    setResult("");

    localStorage.removeItem("MAIN_TEXT");

    const maxRetries = 3;
    let retryCount = 0;

    async function attemptRequest(): Promise<void> {
      try {
        if (!audioFile) {
          setResult("❌ فایل صوتی انتخاب نشده است.");
          return;
        }

        const apiKey = localStorage.getItem("GEMINI_API_KEY");
        if (!apiKey) {
          setResult("❌ ابتدا API Key را وارد کنید.");
          return;
        }

        // تبدیل فایل صوتی به base64 (بدون تغییر)
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(audioFile);
        });

        // ⬅️ URL صحیح Gemini (مهم‌ترین تغییر)
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model.value}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: audioFile.type,
                      data: fileBase64,
                    },
                  },
                  { text: transcriptionPrompt },
                ],
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            throw new Error(errorText);
          }

          const status = response.status;
          const errorMessage = errorData?.error?.message || "خطای ناشناخته";

          // Handle 503 - Model Overloaded
          if (status === 503) {
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
              setResult(
                `⏳ سرور مشغول است. تلاش ${retryCount} از ${maxRetries}...\nتلاش مجدد در ${
                  delay / 1000
                } ثانیه...`,
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
              return attemptRequest();
            } else {
              setResult(
                "❌ سرور Gemini در حال حاضر بسیار شلوغ است.\n\n💡 لطفاً چند دقیقه بعد مجدداً تلاش کنید.",
              );
              return;
            }
          }

          // Handle 429 - Quota Exceeded
          if (status === 429) {
            setResult(
              "❌ محدودیت استفاده از API به پایان رسیده است.\n\n💡 لطفاً بعداً تلاش کنید یا API Key دیگری استفاده نمایید.",
            );
            return;
          }

          // Handle 400 - Invalid Argument
          if (status === 400) {
            setResult(
              `❌ خطا در درخواست:\n${errorMessage}\n\n💡 لطفاً از صحت تنظیمات مدل اطمینان حاصل کنید.`,
            );
            return;
          }

          // Handle 403 - Permission Denied
          if (status === 403) {
            setResult(
              "❌ دسترسی رد شد. API Key معتبر نیست.\n\n💡 لطفاً API Key خود را بررسی کنید.",
            );
            return;
          }

          // Other errors
          throw new Error(`خطا ${status}: ${errorMessage}`);
        }

        const data = await response.json();
        console.log("Gemini response:", data);

        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text)
            ?.join("") || "";

        setResult(text || "❌ پاسخ معتبر نبود.");

        if (text) {
          localStorage.setItem("MAIN_TEXT", text);
        }
      } catch (err) {
        console.error(err);
        setResult(
          `❌ خطا در ارسال به Gemini:\n${
            err instanceof Error ? err.message : "خطای ناشناخته"
          }`,
        );
      }
    }

    try {
      await attemptRequest();
    } finally {
      setLoading(false);
    }
  }

  const preview =
    result.length > 500 && !showFull ? result.slice(0, 500) + "..." : result;

  function copyText() {
    navigator.clipboard.writeText(result);
  }

  return (
    <div className="p-2 sm:p-4 pb-8 space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto">
      {/* فایل ورودی */}
      <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

        <div className="relative p-3 sm:p-6 md:p-8">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-36 sm:h-48 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-500 relative overflow-hidden group ${
              audioFile
                ? "border-2 border-success bg-linear-to-br from-success/5 to-success/10 shadow-success"
                : "border-2 border-dashed border-border hover:border-primary/70 hover:bg-linear-to-br hover:from-primary/5 hover:to-accent/5 hover:shadow-lg"
            }`}
          >
            {/* Animated background */}
            {!audioFile && (
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 animate-shimmer"></div>
            )}

            {audioFile ? (
              <div className="relative z-10 text-center space-y-3 sm:space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-success"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-sm sm:text-base font-bold text-success block">
                  ✓ فایل با موفقیت انتخاب شد
                </span>
                <span className="text-xs sm:text-sm text-success/70">
                  آماده برای ارسال
                </span>
              </div>
            ) : (
              <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                <div className="relative">
                  <Upload className="w-10 h-10 sm:w-14 sm:h-14 text-primary/70 mx-auto group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <span className="text-sm sm:text-base font-semibold text-foreground block">
                    انتخاب فایل صوتی
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    فایل خود را اینجا بکشید یا کلیک کنید
                  </span>
                </div>
              </div>
            )}
          </label>

          <input
            id="file-upload"
            type="file"
            accept=".mp3,.wav,.ogg,.m4a"
            className="hidden"
            onChange={handleFileSelect}
          />

          {audioFile && (
            <div className="mt-4 sm:mt-6 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm bg-linear-to-r from-muted/30 to-muted/50 p-3 sm:p-4 rounded-xl border border-border/30 shadow-sm animate-in slide-in-from-top-2 duration-300">
              <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                <FileAudio className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-foreground block truncate">
                  {audioFile.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full mt-4 sm:mt-8 h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl relative overflow-hidden group"
            variant="gradient"
            size="lg"
            onClick={sendToGemini}
            disabled={!audioFile || loading}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                در حال پردازش...
              </span>
            ) : (
              <span className="relative z-10">🚀 ارسال به Gemini</span>
            )}
          </Button>
        </div>
      </div>

      {/* نتیجه */}
      {result && (
        <div className="relative shadow-premium border border-border/30 rounded-xl sm:rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>

          <div className="relative pb-4 sm:pb-6 px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 border-b border-border/30 bg-linear-to-r from-background/50 to-background">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">
                متن تبدیل شده
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
                نتیجه رونویسی صوتی
              </p>
            </div>
          </div>

          <div className="relative p-3 sm:p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                <div className="relative whitespace-pre-wrap p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-linear-to-br from-muted/40 to-muted/60 text-sm sm:text-base leading-relaxed sm:leading-loose border border-border/40 shadow-inner font-medium">
                  {preview}
                </div>
              </div>

              {/* Load More */}
              {result.length > 500 && (
                <Button
                  className="w-full h-10 sm:h-12 rounded-xl font-semibold text-sm sm:text-base"
                  variant="outline"
                  onClick={() => setShowFull(!showFull)}
                >
                  {showFull ? "🔼 نمایش کمتر" : "🔽 نمایش بیشتر"}
                </Button>
              )}

              {/* Copy */}
              <Button
                variant="success"
                size="lg"
                className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold"
                onClick={() => {
                  copyText();

                  const toast = document.createElement("div");
                  toast.textContent = "✓ متن با موفقیت کپی شد";
                  toast.className =
                    "fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 gradient-success text-white px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-glow font-bold text-sm sm:text-lg animate-in fade-in slide-in-from-bottom-8 duration-500 z-50";
                  document.body.appendChild(toast);
                  setTimeout(() => {
                    toast.classList.add(
                      "animate-out",
                      "fade-out",
                      "slide-out-to-bottom-8",
                    );
                    setTimeout(() => toast.remove(), 300);
                  }, 2000);
                }}
              >
                <Clipboard className="w-5 h-5 sm:w-6 sm:h-6 mr-2" /> کپی متن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
