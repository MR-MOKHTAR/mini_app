import {
  Drawer,
  VStack,
  Button,
  Text,
  Separator,
  HStack,
} from "@chakra-ui/react";
import {
  Mic,
  History,
  Settings,
  HelpCircle,
  LogOut,
  FileText,
} from "lucide-react";

interface PropType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function MenuBar({ open, setOpen }: PropType) {
  return (
    <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content dir="rtl">
          <Drawer.Header
            borderBottomWidth="1px"
            borderColor="gray.100"
            _dark={{ borderColor: "gray.700" }}
            p={0}
          >
            <div className="bg-linear-to-r from-blue-500 to-cyan-500 p-6 text-white w-full">
              <HStack justify="space-between" align="center">
                <VStack align="flex-start" gap={0}>
                  <Drawer.Title className="text-xl font-bold">
                    دستیار صوتی
                  </Drawer.Title>
                  <Text fontSize="sm" opacity={0.9}>
                    تبدیل صوت به متن
                  </Text>
                </VStack>
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Mic size={24} />
                </div>
              </HStack>
            </div>
          </Drawer.Header>
          <Drawer.Body>
            <VStack gap={4} align="stretch" mt={4}>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                onClick={() => setOpen(false)}
              >
                <HStack gap={3}>
                  <Mic size={20} />
                  <Text>تبدیل جدید</Text>
                </HStack>
              </Button>

              <Button
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                onClick={() => setOpen(false)}
              >
                <HStack gap={3}>
                  <History size={20} />
                  <Text>تاریخچه</Text>
                </HStack>
              </Button>

              <Button
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                onClick={() => setOpen(false)}
              >
                <HStack gap={3}>
                  <FileText size={20} />
                  <Text>پیش‌نویس‌ها</Text>
                </HStack>
              </Button>

              <Separator />

              <Button
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                onClick={() => setOpen(false)}
              >
                <HStack gap={3}>
                  <Settings size={20} />
                  <Text>تنظیمات</Text>
                </HStack>
              </Button>

              <Button
                variant="ghost"
                justifyContent="flex-start"
                size="lg"
                onClick={() => setOpen(false)}
              >
                <HStack gap={3}>
                  <HelpCircle size={20} />
                  <Text>راهنما و پشتیبانی</Text>
                </HStack>
              </Button>
            </VStack>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              variant="surface"
              colorPalette="red"
              w="full"
              onClick={() => setOpen(false)}
            >
              <HStack gap={2}>
                <LogOut size={18} />
                <Text>خروج</Text>
              </HStack>
            </Button>
          </Drawer.Footer>
          <Drawer.CloseTrigger />
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
}
