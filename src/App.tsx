import HeaderWithSettings from "./components/HeaderWithSettings";
import { TextResultPage } from "./components/TextResultPage";
import { VoiceUploadPage } from "./components/VoiceUploadPage";

function App() {
  return (
    <div>
      <HeaderWithSettings />;
      <VoiceUploadPage />
      <TextResultPage text="Hello World!!!" />
    </div>
  );
}

export default App;
