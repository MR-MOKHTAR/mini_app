import { useEffect, useState } from "react";
import { useModel } from "@/context/ModelContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type PropType = {
  prompt: string;
  isRewrite: boolean;
};

export function TextRewrite({ prompt, isRewrite }: PropType) {
  const { model } = useModel();

  const [fullText, setFullText] = useState<string>("");
  const [visibleText, setVisibleText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showCount, setShowCount] = useState<number>(700);

  async function rewrite() {
    setLoading(true);

    const baseCorrectionPrompt = `
         You are a linguistic corrector and an academic editor specialized in Islamic seminary texts,
          including Fiqh, Usul, Kalam, and Rijal. You are fully proficient in both Arabic and Persian.

          Your task is to transform the provided transcript — which may contain improvised or spoken language —
          into a fully edited academic text while preserving *all* meaning.

          ### Fundamental Rules:
          1. **No summarization whatsoever.** Every idea and meaning in the original must remain.
          2. **No adding new information.** Do not introduce content that is not present in the transcript.
          3. **Output must be in the *same language as the input* (Arabic or Persian).**
          4. **Preserve seminary terminology**, such as: الإشكال، المناط، التنقيح، الوجوه، الاحتمالات, and similar.
          5. **Do not alter the scientific intention.** Only improve clarity, structure, and expression.

          ### Your tasks:
          1. Understand the meaning completely before editing.
          2. Convert spoken-style text into formal academic written language.
          3. Organize the output into coherent, well-structured paragraphs.
          4. Correct linguistic and grammatical errors.
          5. Remove unnecessary filler phrases and repetitions.
          6. Improve clarity and style while preserving *every* meaning.

          If the input is in Persian, the output MUST be in Persian.
          If the input is in Arabic, the output MUST be in Arabic.
          You are strictly forbidden from translating the text into another language.

          ### Very important:
          Return the corrected text **only**, with no explanations or comments.

          ### Transcript:
          ${prompt}

          ### Output:
          The corrected text only.`;

    const apiKey = localStorage.getItem("GEMINI_API_KEY");
    if (!apiKey) {
      setFullText("❌ API Key وارد نشده است.");
      setVisibleText("❌ API Key وارد نشده است.");
      setLoading(false);
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;

    async function attemptRequest(): Promise<void> {
      try {
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
                parts: [{ text: baseCorrectionPrompt }],
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
              const message = `⏳ سرور مشغول است. تلاش ${retryCount} از ${maxRetries}...\nتلاش مجدد در ${
                delay / 1000
              } ثانیه...`;
              setFullText(message);
              setVisibleText(message);
              await new Promise((resolve) => setTimeout(resolve, delay));
              return attemptRequest();
            } else {
              const message =
                "❌ سرور Gemini در حال حاضر بسیار شلوغ است.\n\n💡 لطفاً چند دقیقه بعد مجدداً تلاش کنید.";
              setFullText(message);
              setVisibleText(message);
              return;
            }
          }

          // Handle 429 - Quota Exceeded
          if (status === 429) {
            const message =
              "❌ محدودیت استفاده از API به پایان رسیده است.\n\n💡 لطفاً بعداً تلاش کنید یا API Key دیگری استفاده نمایید.";
            setFullText(message);
            setVisibleText(message);
            return;
          }

          // Handle 400 - Invalid Argument
          if (status === 400) {
            const message = `❌ خطا در درخواست:\n${errorMessage}\n\n💡 لطفاً از صحت تنظیمات مدل اطمینان حاصل کنید.`;
            setFullText(message);
            setVisibleText(message);
            return;
          }

          // Handle 403 - Permission Denied
          if (status === 403) {
            const message =
              "❌ دسترسی رد شد. API Key معتبر نیست.\n\n💡 لطفاً API Key خود را بررسی کنید.";
            setFullText(message);
            setVisibleText(message);
            return;
          }

          // Other errors
          throw new Error(`خطا ${status}: ${errorMessage}`);
        }

        const data = await response.json();
        console.log("Gemini rewrite response:", data);

        const output =
          data?.candidates?.[0]?.content?.parts
            ?.map((p: any) => p.text)
            ?.join("") || "❌ بازنویسی معتبر نبود.";

        setFullText(output);
        setVisibleText(output.slice(0, showCount));
        localStorage.setItem("REWRITE_TEXT", output);
      } catch (err) {
        console.error(err);
        const message = `❌ خطا در بازنویسی متن:\n${
          err instanceof Error ? err.message : "خطای ناشناخته"
        }`;
        setFullText(message);
        setVisibleText(message);
      }
    }

    try {
      await attemptRequest();
    } finally {
      setLoading(false);
    }
  }

  // اجرای خودکار
  useEffect(() => {
    if (isRewrite) rewrite();
  }, [isRewrite]);

  // لود از localStorage
  useEffect(() => {
    const saved = localStorage.getItem("REWRITE_TEXT");
    if (saved) {
      setFullText(saved);
      setVisibleText(saved.slice(0, showCount));
    }
  }, []);

  function loadMore() {
    const newCount = showCount + 700;
    setShowCount(newCount);
    setVisibleText(fullText.slice(0, newCount));
  }

  function copyText() {
    navigator.clipboard.writeText(fullText);
  }

  return (
    <div className="mt-6 shadow-lg border border-border/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="pb-4 px-6 pt-6 border-b border-border/30">
        <h3 className="text-lg font-semibold">بازنویسی متن</h3>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-4">
        {/* متن */}
        <AnimatePresence>
          {loading ? (
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="h-4 w-3/5 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          ) : (
            visibleText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap p-4 rounded-xl bg-muted/50 text-sm leading-relaxed border border-border/30 shadow-inner"
              >
                {visibleText}
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* دکمه نمایش بیشتر */}
        {!loading && fullText.length > visibleText.length && (
          <Button
            className="w-full h-12 rounded-2xl border-2 border-primary/20 hover:border-primary/50 bg-background hover:bg-accent/30 text-primary font-medium transition-all duration-300 shadow-sm hover:shadow-md"
            variant="outline"
            onClick={loadMore}
          >
            نمایش بیشتر ({fullText.length - visibleText.length} کاراکتر مانده)
          </Button>
        )}

        {/* دکمه کپی */}
        {!loading && fullText.length > 0 && (
          <Button
            className="w-full h-12 rounded-2xl shadow-md hover:shadow-sm hover:scale-[0.98] transition-all duration-300 font-bold text-base border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50"
            onClick={copyText}
          >
            📋 کپی تمام متن
          </Button>
        )}
      </div>
    </div>
  );
}
