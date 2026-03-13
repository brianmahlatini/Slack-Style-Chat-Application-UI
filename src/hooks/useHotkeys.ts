import { useEffect } from "react";

type KeyMap = Record<string, (event: KeyboardEvent) => void>;

export const useHotkeys = (keyMap: KeyMap) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const combo = [
        event.ctrlKey ? "ctrl" : "",
        event.metaKey ? "meta" : "",
        event.altKey ? "alt" : "",
        event.shiftKey ? "shift" : "",
        key
      ]
        .filter(Boolean)
        .join("+");

      const direct = keyMap[key];
      const comboHandler = keyMap[combo];

      if (comboHandler) comboHandler(event);
      else if (direct) direct(event);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyMap]);
};
