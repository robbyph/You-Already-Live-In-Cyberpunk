"use client";

import { useEffect, useRef } from "react";

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageModal({ src, alt, onClose }: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    // The viewer is portaled directly into body; keep its siblings out of both
    // the keyboard tab order and the accessibility tree while it is open.
    const background = Array.from(document.body.children)
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element !== modal)
      .map((element) => ({ element, wasInert: element.inert }));

    background.forEach(({ element }) => { element.inert = true; });
    closeRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "Tab") {
        const controls = modal.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        const first = controls[0];
        const last = controls[controls.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || !modal.contains(active))) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (active === last || !modal.contains(active))) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      background.forEach(({ element, wasInert }) => { element.inert = wasInert; });
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      className="image-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      <a
        className="image-modal-original"
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        Open original ↗
      </a>
      <button
        ref={closeRef}
        type="button"
        className="image-modal-close"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
      >
        ✕
      </button>
      <img
        src={src}
        alt={alt}
        className="image-modal-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
