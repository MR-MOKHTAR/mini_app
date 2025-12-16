"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { ModelSelector } from "./ModelSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function HeaderWithSettings() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function saveKey() {
    if (!apiKey || apiKey.trim().length < 10) {
      setError("لطفاً یک API Key صحیح وارد کنید.");
      setSuccess(false);
      return;
    }
    localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
    setError("");
    setSuccess(true);

    // Show success message then close
    setTimeout(() => {
      setOpen(false);
      setApiKey("");
      setSuccess(false);
    }, 1000);
  }

  return (
    <header className="glass border-b border-border/20 shadow-md sticky top-0 z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-3 max-w-5xl mx-auto">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(true)}
          className="group hover:border-primary/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Settings
            size={18}
            className="group-hover:rotate-90 transition-transform duration-500"
          />
        </Button>
        <ModelSelector />
      </div>

      {/* Settings Dialog/Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl gradient-text font-bold mb-2">
              تنظیمات
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              لطفاً کلید API خود را وارد کنید تا بتوانید از سرویس استفاده
              نمایید.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                کلید API Gemini
              </label>
              <Input
                type="text"
                placeholder="کلید Gemini..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setError("");
                  setSuccess(false);
                }}
                className="text-right"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive text-center animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-sm text-success text-center font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                ✓ کلید با موفقیت ذخیره شد
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              onClick={saveKey}
              className="w-full"
            >
              ذخیره کلید
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
