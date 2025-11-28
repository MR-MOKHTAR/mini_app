import HeaderWithSettings from "./components/HeaderWithSettings";
import { Provider } from "./components/ui/provider";
import { VoiceUploadPage } from "./components/VoiceUploadPage";
import { ModelProvider } from "./context/ModelContext";

function App() {
  return (
    <Provider>
      <ModelProvider>
        <HeaderWithSettings />
        <VoiceUploadPage />
      </ModelProvider>
    </Provider>
  );
}

export default App;
