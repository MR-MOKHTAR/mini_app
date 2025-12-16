import { useEffect, useState } from "react";
import { Upload, FileAudio, Clipboard, Check } from "lucide-react";
import { TextRewrite } from "./TextRewrite";
import { useModel } from "@/context/ModelContext";
import { Button } from "@/components/ui/button";

const transcriptionPrompt = `
      You are an expert transcriber specializing in accurate speech-to-text conversion.

      Your task is to transcribe the audio in its ORIGINAL LANGUAGE with "Clean Verbatim" rules:

      ### RULES:
      1. Transcribe exactly what is said in the ORIGINAL LANGUAGE
      2. Remove filler words (e.g., "umm", "uh", "like", "you know") unless essential to meaning
      3. Remove immediate repetitions and stutters (e.g., "I I went to to..." → "I went to...")
      4. Correct obvious slips of the tongue based on context
      5. Keep punctuation natural and accurate
      6. Do NOT change sentence structure
      7. Do NOT summarize or omit any meaningful content
      8. Do NOT add information that wasn't spoken
      9. Preserve all religious terminology, proper nouns, and technical terms exactly as spoken

      ### OUTPUT:
      Return ONLY the clean verbatim transcript as plain text. Do NOT add any commentary, explanations, or formatting.
      `;

export function VoiceUploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const [showFull, setShowFull] = useState(false);
  const [isRewrite, setIsRewrite] = useState(false);

  const { model } = useModel();

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
    setIsRewrite(false);
    setResult("");

    localStorage.removeItem("MAIN_TEXT");
    localStorage.removeItem("REWRITE_TEXT");

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
                } ثانیه...`
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
              return attemptRequest();
            } else {
              setResult(
                "❌ سرور Gemini در حال حاضر بسیار شلوغ است.\n\n💡 لطفاً چند دقیقه بعد مجدداً تلاش کنید."
              );
              return;
            }
          }

          // Handle 429 - Quota Exceeded
          if (status === 429) {
            setResult(
              "❌ محدودیت استفاده از API به پایان رسیده است.\n\n💡 لطفاً بعداً تلاش کنید یا API Key دیگری استفاده نمایید."
            );
            return;
          }

          // Handle 400 - Invalid Argument
          if (status === 400) {
            setResult(
              `❌ خطا در درخواست:\n${errorMessage}\n\n💡 لطفاً از صحت تنظیمات مدل اطمینان حاصل کنید.`
            );
            return;
          }

          // Handle 403 - Permission Denied
          if (status === 403) {
            setResult(
              "❌ دسترسی رد شد. API Key معتبر نیست.\n\n💡 لطفاً API Key خود را بررسی کنید."
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
          setIsRewrite(true);
        }
      } catch (err) {
        console.error(err);
        setResult(
          `❌ خطا در ارسال به Gemini:\n${
            err instanceof Error ? err.message : "خطای ناشناخته"
          }`
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

  useEffect(() => {
    const getManiText = localStorage.getItem("MAIN_TEXT");
    if (getManiText) {
      setResult(getManiText);
    }
  });

  return (
    <div className="p-4 pb-8 space-y-6 w-full max-w-5xl mx-auto">
      {/* فایل ورودی */}
      <div className="relative shadow-premium border border-border/30 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>

        <div className="relative p-8">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-48 rounded-2xl cursor-pointer transition-all duration-500 relative overflow-hidden group ${
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
              <div className="relative z-10 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                  <Check className="w-16 h-16 text-success mx-auto animate-pulse" />
                  <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-success/20 animate-ping"></div>
                </div>
                <span className="text-base font-bold text-success block">
                  ✓ فایل با موفقیت انتخاب شد
                </span>
                <span className="text-sm text-success/70">
                  آماده برای ارسال
                </span>
              </div>
            ) : (
              <div className="relative z-10 text-center space-y-4">
                <div className="relative">
                  <Upload className="w-14 h-14 text-primary/70 mx-auto group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="space-y-2">
                  <span className="text-base font-semibold text-foreground block">
                    انتخاب فایل صوتی
                  </span>
                  <span className="text-sm text-muted-foreground">
                    فایل خود را اینجا بکشید یا کلیک کنید
                  </span>
                </div>
              </div>
            )}
          </label>

          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />

          {audioFile && (
            <div className="mt-6 flex items-center gap-4 text-sm bg-linear-to-r from-muted/30 to-muted/50 p-4 rounded-xl border border-border/30 shadow-sm animate-in slide-in-from-top-2 duration-300">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileAudio className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-foreground block">
                  {audioFile.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full mt-8 h-14 text-lg font-bold rounded-2xl relative overflow-hidden group"
            variant="gradient"
            size="lg"
            onClick={sendToGemini}
            disabled={!audioFile || loading}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
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
        <div className="relative shadow-premium border border-border/30 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-primary/5 pointer-events-none"></div>

          <div className="relative pb-6 px-8 pt-8 border-b border-border/30 bg-linear-to-r from-background/50 to-background">
            <h3 className="text-2xl font-bold gradient-text">متن تبدیل شده</h3>
            <p className="text-sm text-muted-foreground mt-1">
              نتیجه رونویسی صوتی
            </p>
          </div>

          <div className="relative p-8">
            <div className="flex flex-col gap-5">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
                <div className="relative whitespace-pre-wrap p-6 rounded-2xl bg-linear-to-br from-muted/40 to-muted/60 text-base leading-loose border border-border/40 shadow-inner font-medium">
                  {preview}
                </div>
              </div>

              {/* Load More */}
              {result.length > 500 && (
                <Button
                  className="w-full h-12 rounded-xl font-semibold"
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
                className="w-full h-14 rounded-2xl text-lg font-bold"
                onClick={() => {
                  copyText();

                  const toast = document.createElement("div");
                  toast.textContent = "✓ متن با موفقیت کپی شد";
                  toast.className =
                    "fixed bottom-8 left-1/2 -translate-x-1/2 gradient-success text-white px-8 py-4 rounded-2xl shadow-glow font-bold text-lg animate-in fade-in slide-in-from-bottom-8 duration-500 z-50";
                  document.body.appendChild(toast);
                  setTimeout(() => {
                    toast.classList.add(
                      "animate-out",
                      "fade-out",
                      "slide-out-to-bottom-8"
                    );
                    setTimeout(() => toast.remove(), 300);
                  }, 2000);
                }}
              >
                <Clipboard className="w-6 h-6 mr-2" /> کپی متن
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* بازنویسی خودکار */}
      {result.trim() && <TextRewrite prompt={result} isRewrite={isRewrite} />}
    </div>
  );
}
