"use client";

import { useState } from "react";
import { Settings, Menu as MenuIcon } from "lucide-react";
import {
  Button,
  Dialog,
  Input,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";

import { ModelSelector } from "./ModelSelector";
import MenuBar from "./menubar/Menu";

export default function HeaderWithSettings() {
  const [open, setOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  function saveKey() {
    if (!apiKey || apiKey.trim().length < 10) {
      setError("لطفاً یک API Key صحیح وارد کنید.");
      return;
    }
    localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
    setError("");
    setOpen(false);
  }

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-50 backdrop-blur">
        <IconButton
          variant="surface"
          colorPalette={"blue"}
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MenuIcon className="size-5" />
        </IconButton>

        <div className="flex items-center gap-2">
          <ModelSelector />
          <IconButton
            variant="surface"
            colorPalette={"blue"}
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Settings className="size-5" />
          </IconButton>
        </div>
      </header>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Backdrop bg="blackAlpha.700" />

        <Dialog.Positioner zIndex={"popover"}>
          <Dialog.Content
            maxW={{ base: "xs", md: "sm" }}
            p={{ base: "5", md: "6" }}
            borderRadius="2xl"
            boxShadow="2xl"
            bg={{ base: "white", _dark: "gray.600" }}
            zIndex="popover"
            dir="rtl"
          >
            <Dialog.Header pb="2"></Dialog.Header>

            <Dialog.Body pt="4" pb="6">
              <Stack gap="3">
                <Input
                  placeholder="کلید Gemini..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  size="md"
                  variant="flushed"
                  borderRadius="lg"
                />
                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer pt="0">
              <Button
                colorScheme="blue"
                variant="solid"
                onClick={saveKey}
                w="full"
                size="lg"
                borderRadius="lg"
              >
                ذخیره کلید
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <MenuBar open={isMenuOpen} setOpen={setIsMenuOpen} />
    </>
  );
}
