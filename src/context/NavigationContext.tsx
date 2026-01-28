import { createContext, useContext, useState, type ReactNode } from "react";

export type PageType = "home" | "history" | "settings";

type NavigationContextValue = {
  currentPage: PageType;
  navigateTo: (page: PageType) => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
};

const NavigationContext = createContext<NavigationContextValue | undefined>(
  undefined,
);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function navigateTo(page: PageType) {
    setCurrentPage(page);
    closeMenu();
  }

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <NavigationContext.Provider
      value={{ currentPage, navigateTo, isMenuOpen, toggleMenu, closeMenu }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return ctx;
}
