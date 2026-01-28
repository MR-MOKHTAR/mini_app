import { Provider } from "./components/ui/provider";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { VoiceUploadPage } from "./components/VoiceUploadPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ModelProvider } from "./context/ModelContext";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";

function AppContent() {
  const { currentPage } = useNavigation();

  return (
    <>
      <Header />
      <Sidebar />
      <main className="min-h-screen bg-background">
        {currentPage === "home" && <VoiceUploadPage />}
        {currentPage === "history" && <HistoryPage />}
        {currentPage === "settings" && <SettingsPage />}
      </main>
    </>
  );
}

function App() {
  return (
    <Provider>
      <ModelProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </ModelProvider>
    </Provider>
  );
}

export default App;
