// --- Voice Upload Page ---
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Upload, FileAudio, Clipboard, Check } from "lucide-react";

export function VoiceUploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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

    try {
      const apiKey = localStorage.getItem("GEMINI_API_KEY");
      if (!apiKey) {
        setResult("❌ ابتدا API Key را در تنظیمات وارد کنید.");
        setLoading(false);
        return;
      }

      // تبدیل فایل صوتی به Base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(audioFile);
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
                  { text: "لطفاً این فایل صوتی را به متن تبدیل کن." },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      setResult(text || "❌ پاسخ معتبری از Gemini دریافت نشد.");
    } catch (err) {
      setResult("❌ خطا در ارسال به Gemini");
    }

    setLoading(false);
  }

  function copyText() {
    navigator.clipboard.writeText(result);
  }

  return (
    <div className="p-4 space-y-4">
      {/* فایل ورودی */}
      <Card className="border shadow-sm">
        <CardHeader className="font-semibold">آپلود فایل صوتی</CardHeader>
        <CardContent>
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border rounded-xl cursor-pointer transition
            ${
              audioFile
                ? "border-green-500 bg-green-50"
                : "border-dashed hover:bg-muted/30"
            }`}
          >
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-xl cursor-pointer hover:bg-muted/30 transition"
            >
              {audioFile ? (
                <>
                  <Check className="w-8 h-8 mb-2 text-green-600" />
                  <span className="text-sm text-green-700">فایل انتخاب شد</span>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm">
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
          </label>

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
          <CardHeader className="font-semibold">نتیجه تبدیل</CardHeader>
          <CardContent className="space-y-3">
            <div className="whitespace-pre-wrap p-3 rounded-md bg-muted text-sm">
              {result}
            </div>

            <Button
              className="w-full relative overflow-hidden group"
              variant="secondary"
              onClick={() => {
                copyText();
                const toast = document.createElement("div");
                toast.textContent = "✔️ کپی شد";
                toast.className =
                  "fixed bottom-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeOut";
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 1500);
              }}
            >
              <span className="flex items-center justify-center">
                <Clipboard className="w-4 h-4 mr-2" /> کپی متن
              </span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
