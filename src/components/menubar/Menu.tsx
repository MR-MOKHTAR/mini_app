import { CloseButton } from "@chakra-ui/react";

interface PropType {
  setIsMenuOpen: (open: boolean) => void;
}

export default function MenuBar({ setIsMenuOpen }: PropType) {
  return (
    <div className="z-[999] size-full bg-gray-100/40 blur-in-sm fixed top-0 right-0">
      <div className="h-full w-[50%] bg-white">
        <div className="flex items-center justify-between p-2!">
          <p className="text-2xl">Menu</p>
          <CloseButton
            size="xs"
            variant={"outline"}
            onClick={() => setIsMenuOpen(false)}
            colorPalette={"cyan"}
          />
        </div>
      </div>
    </div>
  );
}
