// --- Voice Upload Page ---
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Upload, FileAudio, Clipboard } from "lucide-react";

export function VoiceUploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioFile(file);
  }

  async function sendToGemini() {
    if (!audioFile) return;
    setLoading(true);

    // بعداً API Call را اضافه می‌کنیم
    setTimeout(() => {
      setResult("نمونه متن تبدیل‌شده از صوت...");
      setLoading(false);
    }, 1500);
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
          <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-xl cursor-pointer hover:bg-muted/30 transition">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">برای انتخاب فایل صوتی کلیک کنید</span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </label>

          {audioFile && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <FileAudio className="w-4 h-4" />
              {audioFile.name}
            </div>
          )}

          <Button
            className="w-full mt-4"
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
            <Button className="w-full" variant="secondary" onClick={copyText}>
              <Clipboard className="w-4 h-4 mr-2" /> کپی متن
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
