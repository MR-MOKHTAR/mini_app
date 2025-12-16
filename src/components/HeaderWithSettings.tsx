"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";

import { ModelSelector } from "./ModelSelector";
import { Button } from "@/components/ui/button";

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
    <header className="shadow-sm p-1.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          className="bg-gray-200/50 rounded-lg flex items-center justify-center p-2 hover:bg-gray-200/70 transition-colors"
          onClick={() => setOpen(true)}
        >
          <Settings size={18} />
        </button>
        <ModelSelector />
      </div>

      {/* Settings Dialog/Modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl"
              dir="rtl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                <h2 className="text-xl font-semibold text-center">
                  تنظیمات API
                </h2>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="کلید Gemini..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6">
                <Button onClick={saveKey} className="w-full rounded-lg">
                  ذخیره کلید
                </Button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
