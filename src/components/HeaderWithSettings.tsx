import { useState } from "react";
import { Mic, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ModelSelector } from "./ModelSelector";

export default function HeaderWithSettings() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  function saveKey() {
    if (!apiKey || apiKey.trim().length < 10) {
      setError("کلید معتبر نیست. لطفاً یک API Key صحیح وارد کنید.");
      return;
    }
    localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
    setError("");
    setOpen(false);
  }

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Mic className="w-5 h-5" />
        </div>

        <div className="flex items-center gap-x-3">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Settings className="w-5 h-5" />
          </Button>
          <ModelSelector />
        </div>
      </header>

      {/* Settings Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              <span>تنظیم </span>
              <span>API Key</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label className="text-sm">API Key:</label>
            <Input
              placeholder="کلید Gemini..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <DialogFooter>
            <Button onClick={saveKey}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
