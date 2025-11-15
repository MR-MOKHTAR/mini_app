import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function TextRewrite({ text }: { text: string }) {
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text },
                  {
                    text: "این متن را بازنویسی کن، تمیز کن، غلط‌ها را اصلاح کن، پاراگراف‌بندی کن و خوانایی را بهتر کن.",
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
