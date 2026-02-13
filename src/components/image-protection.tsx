"use client";

import { useEffect } from "react";

const PROTECTED_SELECTOR = "img, picture";

function isProtectedTarget(target: EventTarget | null): target is Element {
  return target instanceof Element && Boolean(target.closest(PROTECTED_SELECTOR));
}

function hardenImageElement(image: HTMLImageElement) {
  image.draggable = false;
  image.setAttribute("draggable", "false");
  image.setAttribute("data-protected-image", "true");
}

export default function ImageProtection() {
  useEffect(() => {
    const blockContextMenu = (event: MouseEvent) => {
      if (isProtectedTarget(event.target)) {
        event.preventDefault();
      }
    };

    const blockDragStart = (event: DragEvent) => {
      if (isProtectedTarget(event.target)) {
        event.preventDefault();
      }
    };

    const blockCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      }

      const fragment = selection.getRangeAt(0).cloneContents();

      if (fragment.querySelector("img, picture")) {
        event.preventDefault();
      }
    };

    const applyImageProtection = () => {
      document.querySelectorAll("img").forEach((node) => {
        if (node instanceof HTMLImageElement) {
          hardenImageElement(node);
        }
      });
    };

    const observer = new MutationObserver(() => {
      applyImageProtection();
    });

    document.body.dataset.imageProtection = "on";
    applyImageProtection();

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("contextmenu", blockContextMenu, true);
    document.addEventListener("dragstart", blockDragStart, true);
    document.addEventListener("copy", blockCopy, true);

    return () => {
      observer.disconnect();
      delete document.body.dataset.imageProtection;
      document.removeEventListener("contextmenu", blockContextMenu, true);
      document.removeEventListener("dragstart", blockDragStart, true);
      document.removeEventListener("copy", blockCopy, true);
    };
  }, []);

  return null;
}
