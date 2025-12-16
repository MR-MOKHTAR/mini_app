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
    <div className="p-4 space-y-6 w-full max-w-5xl mx-auto">
      {/* فایل ورودی */}
      <div className="shadow-lg border border-border/50 rounded-xl overflow-hidden">
        <div className="p-6">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
              audioFile
                ? "border-green-400 bg-green-50/50 dark:bg-green-950/20 shadow-inner"
                : "border-dashed border-border hover:border-primary/50 hover:bg-accent/20 hover:shadow-md"
            }`}
          >
            {audioFile ? (
              <>
                <Check className="w-10 h-10 mb-3 text-green-500 animate-in fade-in duration-300" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  فایل انتخاب شد
                </span>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                <span className="text-sm font-medium text-center px-4">
                  برای انتخاب فایل صوتی کلیک کنید
                </span>
              </>
            )}
          </label>

          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />

          {audioFile && (
            <div className="mt-4 flex items-center gap-3 text-sm bg-muted/50 p-3 rounded-xl">
              <FileAudio className="w-5 h-5 text-primary" />
              <span className="font-medium truncate">{audioFile.name}</span>
            </div>
          )}

          <Button
            className="w-full mt-6 h-12 text-base font-medium rounded-xl shadow-lg hover:shadow-sm hover:scale-[0.98] transition-all duration-200 bg-primary"
            onClick={sendToGemini}
            disabled={!audioFile || loading}
          >
            {loading ? "در حال ارسال..." : "ارسال به Gemini"}
          </Button>
        </div>
      </div>

      {/* نتیجه */}
      {result && (
        <div className="shadow-lg border border-border/50 rounded-xl overflow-hidden">
          <div className="pb-4 px-6 pt-6 border-b border-border/30">
            <h3 className="text-lg font-semibold">متن تبدیل شده</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="whitespace-pre-wrap p-4 rounded-xl bg-muted/50 text-sm leading-relaxed border border-border/30 shadow-inner">
                {preview}
              </div>

              {/* Load More */}
              {result.length > 500 && (
                <Button
                  className="w-full h-11 rounded-xl border-2 hover:bg-accent/50 transition-colors"
                  variant="outline"
                  onClick={() => setShowFull(!showFull)}
                >
                  {showFull ? "نمایش کمتر" : "نمایش بیشتر"}
                </Button>
              )}

              {/* Copy */}
              <Button
                className="w-full h-11 rounded-xl shadow-md hover:shadow-sm hover:scale-[0.98] transition-all duration-200 bg-secondary"
                onClick={() => {
                  copyText();

                  const toast = document.createElement("div");
                  toast.textContent = "✔️ کپی شد";
                  toast.className =
                    "fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl font-medium animate-in fade-in slide-in-from-bottom-4 duration-300";
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2000);
                }}
              >
                <Clipboard className="w-5 h-5 mr-2" /> کپی متن
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
