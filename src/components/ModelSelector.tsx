import { useState, useRef, useEffect } from "react";
import { useModel, AI_MODELS } from "@/context/ModelContext";
import { ChevronDown, Check } from "lucide-react";

export function ModelSelector() {
  const { model, changeModel } = useModel();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="relative min-w-[140px] md:min-w-[180px] max-w-[160px] md:max-w-[220px]"
      ref={dropdownRef}
    >
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background border border-border rounded-lg px-2 h-9 md:h-10 flex items-center justify-between text-foreground hover:bg-accent/50 transition-colors"
      >
        <span className="text-sm truncate">{model.label}</span>
        <ChevronDown
          size={16}
          className={`ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-border rounded-xl shadow-xl overflow-hidden min-w-[180px] p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {AI_MODELS.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                changeModel(item);
                setIsOpen(false);
              }}
              className="w-full p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between text-foreground text-left"
            >
              <span className="text-sm">{item.label}</span>
              {model.value === item.value && (
                <Check size={16} className="text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
