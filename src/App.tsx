import HeaderWithSettings from "./components/HeaderWithSettings";
import { VoiceUploadPage } from "./components/VoiceUploadPage";
import { ModelProvider } from "./context/ModelContext";
import type React from "react";

type PropsType = {
  children: React.ReactNode;
};

function App({ children }: PropsType) {
  return (
    <div>
      <ModelProvider>
        <HeaderWithSettings />
        <VoiceUploadPage />
        {children}
      </ModelProvider>
    </div>
  );
}

export default App;
