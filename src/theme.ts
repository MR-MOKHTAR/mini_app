import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  preflight: false,
  globalCss: {
    "*": {
      margin: "revert",
      padding: "revert",
      boxSizing: "border-box",
    },
    "html, body": {
      lineHeight: "revert",
      fontSize: "revert",
      fontFamily: "revert",
    },
  },
});

export default createSystem(defaultConfig, config);
