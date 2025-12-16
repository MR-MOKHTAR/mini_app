"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function HeaderWithSettings() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  function saveKey() {
    if (!apiKey || apiKey.trim().length < 10) {
      setError("لطفاً یک API Key صحیح وارد کنید.");
      return;
    }
    localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
    setError("");
    setOpen(false);
    setApiKey("");
  }

  return (
    <header className="shadow-sm p-2">
      {/* Header */}
      <div className="flex items-center justify-between ">
        <Button size="icon" variant={"outline"} onClick={() => setOpen(true)}>
          <Settings size={18} />
        </Button>
        <ModelSelector />
      </div>

      {/* Settings Dialog/Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogDescription className="text-center">
              لطفاً کلید API خود را وارد کنید.
            </DialogDescription>
          </DialogHeader>

          <div className="flex w-full max-w-sm items-center gap-2">
            <Input
              type="text"
              placeholder="کلید Gemini..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button type="submit" variant="outline" onClick={saveKey}>
              ذخیره کلید
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </DialogContent>
      </Dialog>
    </header>
  );
}
