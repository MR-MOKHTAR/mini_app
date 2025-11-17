// Full TypeScript + shadcn/ui + clean structure + animations version
// Includes: Load More, Copy, auto rewrite, saved state
// Ready for Vite + React + TS + shadcn

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useModel } from "@/context/ModelContext";
import { motion, AnimatePresence } from "framer-motion";

const instruction = `
Rewrite the input text strictly in the same language as provided.
Do not translate the text.
Output only the rewritten text.
Correct spelling, grammar, formatting, readability, and paragraphs.
Do not add new information.
`;

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
                parts: [{ text: instruction }, { text: prompt }],
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
    <Card className="border shadow-sm mt-4">
      <CardHeader className="font-semibold text-lg">بازنویسی متن</CardHeader>

      <CardContent className="space-y-4">
        {/* متن */}
        <AnimatePresence>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          ) : (
            visibleText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-pre-wrap p-3 rounded-md bg-muted text-sm leading-relaxed"
              >
                {visibleText}
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* دکمه نمایش بیشتر */}
        {!loading && fullText.length > visibleText.length && (
          <Button className="w-full" onClick={loadMore}>
            نمایش بیشتر
          </Button>
        )}

        {/* دکمه کپی */}
        {!loading && fullText.length > 0 && (
          <Button variant="secondary" className="w-full" onClick={copyText}>
            کپی متن
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
