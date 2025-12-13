import { useEffect, useState } from "react";
import { Button, Card, Box, VStack } from "@chakra-ui/react";
import { Upload, FileAudio, Clipboard, Check } from "lucide-react";
import { TextRewrite } from "./TextRewrite";
import { useModel } from "@/context/ModelContext";

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
        `/api/gemini?model=${model.value}&key=${apiKey}`,
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
                  { text: transcriptionPrompt },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      console.log(data);
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
    <div className="p-4 space-y-6 w-full max-w-5xl mx-auto">
      {/* فایل ورودی */}
      <Card.Root variant="outline" className="shadow-lg border-border/50">
        <Card.Body className="p-6">
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
              audioFile
                ? "border-green-400 bg-green-50/50 dark:bg-green-950/20 shadow-inner"
                : "border-dashed border-border active:border-primary/50 active:bg-accent/20 active:shadow-md"
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
            className="w-full mt-6 h-12 text-base font-medium rounded-xl shadow-lg active:shadow-sm active:scale-[0.98] transition-all duration-200 bg-primary"
            onClick={sendToGemini}
            disabled={!audioFile || loading}
          >
            {loading ? "در حال ارسال..." : "ارسال به Gemini"}
          </Button>
        </Card.Body>
      </Card.Root>

      {/* نتیجه */}
      {result && (
        <Card.Root variant="outline" className="shadow-lg border-border/50">
          <Card.Header className="pb-4">
            <Card.Title className="text-lg font-semibold">
              متن تبدیل شده
            </Card.Title>
          </Card.Header>
          <Card.Body className="pt-2">
            <VStack gap="4" align="stretch">
              <Box className="whitespace-pre-wrap p-4 rounded-xl bg-muted/50 text-sm leading-relaxed border border-border/30 shadow-inner">
                {preview}
              </Box>

              {/* Load More */}
              {result.length > 500 && (
                <Button
                  className="w-full h-11 rounded-xl border-2 active:bg-accent/50 transition-colors"
                  variant="outline"
                  onClick={() => setShowFull(!showFull)}
                >
                  {showFull ? "نمایش کمتر" : "نمایش بیشتر"}
                </Button>
              )}

              {/* Copy */}
              <Button
                className="w-full h-11 rounded-xl shadow-md active:shadow-sm active:scale-[0.98] transition-all duration-200 bg-secondary"
                variant="subtle"
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
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* بازنویسی خودکار */}
      {result.trim() && <TextRewrite prompt={result} isRewrite={isRewrite} />}
    </div>
  );
}
