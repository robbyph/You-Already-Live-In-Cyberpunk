"use client";

import { useEffect, useRef, useState } from "react";
import SiteInfo from "./SiteInfo";

export default function MobileAbout() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropPressRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;

    // Fix the page in place so touch scrolling stays inside the panel on iOS.
    const { scrollX, scrollY } = window;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    Object.assign(body.style, {
      position: "fixed",
      top: `-${scrollY}px`,
      left: `-${scrollX}px`,
      width: `calc(100% - ${scrollbarWidth}px)`,
      overflow: "hidden",
    });

    // Native modal behavior keeps focus inside and makes the feed inert.
    dialog.showModal();
    if (contentRef.current) contentRef.current.scrollTop = 0;

    const desktop = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    closeOnDesktop();
    desktop.addEventListener("change", closeOnDesktop);

    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
      dialog.close();
      Object.assign(body.style, previous);
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  function isBackdrop(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return false;
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="mobile-about-trigger"
        aria-haspopup="dialog"
        aria-controls="mobile-about"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        [about]
      </button>
      <dialog
        ref={dialogRef}
        id="mobile-about"
        className="about-dialog"
        aria-labelledby="mobile-about-title"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onPointerDown={(event) => { backdropPressRef.current = isBackdrop(event); }}
        onClick={(event) => {
          if (backdropPressRef.current && isBackdrop(event)) setOpen(false);
          backdropPressRef.current = false;
        }}
      >
        <div className="about-dialog-header">
          <h2 id="mobile-about-title">about</h2>
          <button type="button" className="about-dialog-close" onClick={() => setOpen(false)}>
            [close]
          </button>
        </div>
        <div ref={contentRef} className="about-dialog-content">
          <SiteInfo />
        </div>
      </dialog>
    </>
  );
}
