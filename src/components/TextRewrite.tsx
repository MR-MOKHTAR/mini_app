import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useModel } from "@/context/ModelContext";

const text = `
    Rewrite the input text strictly in the same language as provided.
    Do not translate the text.
    Produce output only — no greetings, no explanations, no confirmations.
    Rewrite the text with corrected spelling, fixed grammar, cleaned formatting, improved readability, proper paragraphing, and removal of redundant repeated words.
    Do not add new information, and do not remove any information except correcting mistakes.
    Output only the corrected rewritten text.
    `;

export function TextRewrite({ prompt }: { prompt: string }) {
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);

  const { model } = useModel();

  async function rewrite() {
    setLoading(true);

    const apiKey = localStorage.getItem("GEMINI_API_KEY");
    if (!apiKey) {
      setRewritten("❌ API Key وارد نشده است.");
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
                parts: [
                  { text },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const fixed = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      setRewritten(fixed || "❌ بازنویسی معتبر نبود.");
    } catch {
      setRewritten("❌ خطا در بازنویسی متن.");
    }

    setLoading(false);
  }

  // اجرای خودکار بعد از دریافت متن
  useEffect(() => {
    if (text.trim().length > 0) rewrite();
  }, [text]);

  return (
    <Card className="border shadow-sm mt-4">
      <CardHeader className="font-semibold">بازنویسی متن</CardHeader>

      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm opacity-70">⏳ در حال بازنویسی...</div>
        ) : rewritten ? (
          <div className="whitespace-pre-wrap p-3 rounded-md bg-muted text-sm">
            {rewritten}
          </div>
        ) : null}

        <Button
          className="w-full"
          variant="secondary"
          onClick={rewrite}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> بازنویسی دوباره
        </Button>
      </CardContent>
    </Card>
  );
}
