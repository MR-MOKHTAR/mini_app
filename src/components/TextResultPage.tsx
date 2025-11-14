// --- Result Page (with Rewrite & Copy) ---
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, Wand2 } from "lucide-react";

export function TextResultPage({ text }: { text: string }) {
  const [rewriting, setRewriting] = useState(false);
  const [rewritten, setRewritten] = useState("");

  function copyAll() {
    navigator.clipboard.writeText(text);
  }

  async function rewriteText() {
    setRewriting(true);
    setTimeout(() => {
      setRewritten("نسخه بازنویسی شده متن با هوش مصنوعی...");
      setRewriting(false);
    }, 1200);
  }

  return (
    <div className="p-4 space-y-4">
      <Card className="border shadow-sm">
        <CardHeader className="font-semibold">متن استخراج‌شده</CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-md bg-muted whitespace-pre-wrap text-sm">
            {text}
          </div>

          <Button className="w-full" variant="secondary" onClick={copyAll}>
            <Clipboard className="w-4 h-4 mr-2" /> کپی متن کامل
          </Button>

          <Button className="w-full" onClick={rewriteText} disabled={rewriting}>
            <Wand2 className="w-4 h-4 mr-2" />
            {rewriting ? "در حال بازنویسی..." : "بازنویسی با هوش مصنوعی"}
          </Button>

          {rewritten && (
            <div className="p-3 rounded-md bg-muted whitespace-pre-wrap text-sm mt-3">
              {rewritten}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
