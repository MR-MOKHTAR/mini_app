import HeaderWithSettings from "./components/HeaderWithSettings";
import { VoiceUploadPage } from "./components/VoiceUploadPage";
import { ModelProvider } from "./context/ModelContext";

function App() {
  return (
    <ModelProvider>
      <HeaderWithSettings />
      <VoiceUploadPage />
    </ModelProvider>
  );
}

export default App;
