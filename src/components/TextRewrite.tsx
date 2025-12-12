import { useEffect, useState } from "react";
import { Card, Button, Skeleton, Box } from "@chakra-ui/react";
import { useModel } from "@/context/ModelContext";
import { motion, AnimatePresence } from "framer-motion";

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

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: baseCorrectionPrompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const output: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "❌ بازنویسی معتبر نبود.";

      setFullText(output);
      setVisibleText(output.slice(0, showCount));
      localStorage.setItem("REWRITE_TEXT", output);
    } catch {
      setFullText("❌ خطا در بازنویسی متن.");
      setVisibleText("❌ خطا در بازنویسی متن.");
    }

    setLoading(false);
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
    <Card.Root variant="outline" className="mt-6 shadow-lg border-border/50">
      <Card.Header className="pb-4">
        <Card.Title className="text-lg font-semibold">بازنویسی متن</Card.Title>
      </Card.Header>

      <Card.Body gap="4" className="pt-2">
        {/* متن */}
        <AnimatePresence>
          {loading ? (
            <Box className="space-y-3">
              <Skeleton height="4" width="full" className="rounded-lg" />
              <Skeleton height="4" width="4/5" className="rounded-lg" />
              <Skeleton height="4" width="3/5" className="rounded-lg" />
            </Box>
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
            className="w-full h-11 rounded-xl border-2 hover:bg-accent/50 transition-colors"
            variant="outline"
            onClick={loadMore}
          >
            نمایش بیشتر
          </Button>
        )}

        {/* دکمه کپی */}
        {!loading && fullText.length > 0 && (
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-secondary hover:bg-secondary/80"
            onClick={copyText}
          >
            کپی متن
          </Button>
        )}
      </Card.Body>
    </Card.Root>
  );
}
