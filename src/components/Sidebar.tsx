import { useNavigation } from "@/context/NavigationContext";
import { Button } from "@/components/ui/button";
import { Home, History, Settings, X } from "lucide-react";

export function Sidebar() {
  const { currentPage, navigateTo, isMenuOpen, closeMenu } = useNavigation();

  if (!isMenuOpen) return null;

  const menuItems = [
    { id: "home" as const, label: "صفحه اصلی", icon: Home },
    { id: "history" as const, label: "سابقه", icon: History },
    { id: "settings" as const, label: "تنظیمات", icon: Settings },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={closeMenu}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-background border-l border-border/20 shadow-2xl z-50 animate-in slide-in-from-right-8 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <h2 className="text-xl font-bold gradient-text">منو</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={closeMenu}
            className="hover:bg-muted/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Button
                key={item.id}
                variant={isActive ? "gradient" : "ghost"}
                className={`w-full justify-start gap-3 h-12 text-base font-medium transition-all duration-300 ${
                  isActive
                    ? "shadow-lg"
                    : "hover:bg-muted/50 hover:scale-[1.02]"
                }`}
                onClick={() => navigateTo(item.id)}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/20">
          <p className="text-xs text-muted-foreground text-center">
            تبدیل صدا به متن با هوش مصنوعی
          </p>
        </div>
      </div>
    </>
  );
}
