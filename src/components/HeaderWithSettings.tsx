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
      <header className="flex items-center justify-between p-4 border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <IconButton
          variant="ghost"
          colorPalette="blue"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="hover:bg-accent/50 transition-colors"
        >
          <MenuIcon className="size-5" />
        </IconButton>

        <div className="flex items-center gap-3">
          <ModelSelector />
          <IconButton
            variant="ghost"
            colorPalette="blue"
            size="sm"
            onClick={() => setOpen(true)}
            className="hover:bg-accent/50 transition-colors"
          >
            <Settings className="size-5" />
          </IconButton>
        </div>
      </header>

      <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Dialog.Backdrop bg="blackAlpha.600" className="backdrop-blur-sm" />

        <Dialog.Positioner zIndex="popover">
          <Dialog.Content
            maxW={{ base: "90vw", sm: "xs", md: "sm" }}
            p={{ base: "6", md: "8" }}
            borderRadius="3xl"
            boxShadow="2xl"
            bg="bg"
            border="1px solid"
            borderColor="border"
            zIndex="popover"
            dir="rtl"
            className="mx-4"
          >
            <Dialog.Header pb="4">
              <Dialog.Title className="text-lg font-semibold text-center">
                تنظیمات API
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pt="2" pb="8">
              <Stack gap="4">
                <Input
                  placeholder="کلید Gemini..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  size="lg"
                  variant="outline"
                  borderRadius="xl"
                  className="focus:ring-2 focus:ring-primary/20"
                />
                {error && (
                  <Text
                    color="destructive"
                    fontSize="sm"
                    className="text-center"
                  >
                    {error}
                  </Text>
                )}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer pt="0">
              <Button
                colorPalette="blue"
                variant="solid"
                onClick={saveKey}
                w="full"
                size="lg"
                borderRadius="xl"
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                ذخیره کلید
              </Button>
            </Dialog.Footer>

            <Dialog.CloseTrigger className="absolute top-4 left-4" />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}
