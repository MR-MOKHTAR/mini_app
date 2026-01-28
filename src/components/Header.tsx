import { useNavigation } from "@/context/NavigationContext";
import { Button } from "@/components/ui/button";
import { Menu, Mic } from "lucide-react";

export function Header() {
  const { currentPage, toggleMenu } = useNavigation();

  const getPageTitle = () => {
    switch (currentPage) {
      case "home":
        return "تبدیل صدا به متن";
      case "history":
        return "سابقه";
      case "settings":
        return "تنظیمات";
      default:
        return "تبدیل صدا به متن";
    }
  };

  return (
    <header className="glass border-b border-border/20 shadow-md sticky top-0 z-40">
      <div className="flex items-center justify-between p-3 max-w-5xl mx-auto">
        {/* Hamburger Menu Button */}
        <Button
          size="icon"
          variant="outline"
          onClick={toggleMenu}
          className="group hover:border-primary/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Menu
            size={20}
            className="group-hover:rotate-180 transition-transform duration-500"
          />
        </Button>

        {/* Page Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <h1 className="text-base sm:text-lg md:text-xl font-bold gradient-text">
            {getPageTitle()}
          </h1>
        </div>

        {/* Spacer for balance */}
        <div className="w-9 sm:w-10" />
      </div>
    </header>
  );
}
