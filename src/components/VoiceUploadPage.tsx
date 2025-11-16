import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Upload, FileAudio, Clipboard, Check } from "lucide-react";
import { TextRewrite } from "./TextRewrite";
import { useModel } from "@/context/ModelContext";

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

    try {
      const apiKey = localStorage.getItem("GEMINI_API_KEY");
      if (!apiKey) {
        setResult("❌ ابتدا API Key را وارد کنید.");
        setLoading(false);
        return;
      }

      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: audioFile.type,
                      data: fileBase64,
                    },
                  },
                  { text: "لطفاً این فایل صوتی را به متن تبدیل کن." },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      setResult(text || "❌ پاسخ معتبر نبود.");

      if (text) {
        localStorage.setItem("MAIN_TEXT", text);
        setIsRewrite(true);
      }
    } catch {
      setResult("❌ خطا در ارسال به Gemini");
    }

    setLoading(false);
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
    <div className="p-4 space-y-4">
      {/* فایل ورودی */}
      <Card className="border shadow-sm">
        <CardContent>
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border rounded-xl cursor-pointer transition ${
              audioFile
                ? "border-green-500 bg-green-50"
                : "border-dashed hover:bg-muted/30"
            }`}
          >
            {audioFile ? (
              <>
                <Check className="w-8 h-8 mb-2 text-green-600" />
                <span className="text-sm text-green-700">فایل انتخاب شد</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">برای انتخاب فایل صوتی کلیک کنید</span>
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
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
              <FileAudio className="w-4 h-4" />
              {audioFile.name}
            </div>
          )}

          <Button
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={sendToGemini}
            disabled={!audioFile || loading}
          >
            {loading ? "در حال ارسال..." : "ارسال به Gemini"}
          </Button>
        </CardContent>
      </Card>

      {/* نتیجه */}
      {result && (
        <Card className="border shadow-sm">
          <CardHeader className="font-semibold">متن تبدیل شده</CardHeader>
          <CardContent className="space-y-3">
            <div className="whitespace-pre-wrap p-3 rounded-md bg-muted text-sm">
              {preview}
            </div>

            {/* Load More */}
            {result.length > 500 && (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowFull(!showFull)}
              >
                {showFull ? "نمایش کمتر" : "نمایش بیشتر"}
              </Button>
            )}

            {/* Copy */}
            <Button
              className="w-full relative overflow-hidden"
              variant="secondary"
              onClick={() => {
                copyText();

                const toast = document.createElement("div");
                toast.textContent = "✔️ کپی شد";
                toast.className =
                  "fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg";
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 1500);
              }}
            >
              <Clipboard className="w-4 h-4 mr-2" /> کپی متن
            </Button>
          </CardContent>
        </Card>
      )}

      {/* بازنویسی خودکار */}
      {result.trim() && <TextRewrite prompt={result} isRewrite={isRewrite} />}
    </div>
  );
}
