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

export default function HeaderWithSettings() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Mic className="w-5 h-5" />
          <span>Gemini Voice</span>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      {/* Settings Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تنظیم API Key</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <label className="text-sm">API Key شما:</label>
            <Input
              placeholder="کلید Gemini..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
