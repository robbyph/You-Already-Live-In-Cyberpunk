"use client";

import { makePage } from "@keystatic/next/ui/app";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import config from "../../../keystatic.config";

const KeystaticPage = makePage(config);
const scrollStorageKey = "keystatic-entry-navigation-scroll";
const scrollQueryKey = "keystaticScroll";
const entryNameCollator = new Intl.Collator(undefined, {
  sensitivity: "base",
});

type ToolbarDetails = {
  buttonClassName: string;
  iconClassName: string;
  labelClassName: string;
  portalTarget: HTMLElement;
};

function getEditorScroller() {
  return document.querySelector<HTMLElement>("#item-edit-form > div");
}

function EntryNavigation() {
  const pathname = usePathname();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [toolbarDetails, setToolbarDetails] =
    useState<ToolbarDetails | null>(null);

  const route = useMemo(() => {
    const match = pathname.match(
      /^(.*\/collection\/entries\/item\/)([^/]+)\/?$/
    );

    if (!match) return null;

    return {
      itemBasePath: match[1],
      slug: decodeURIComponent(match[2]),
    };
  }, [pathname]);

  useEffect(() => {
    if (!route) return;

    const controller = new AbortController();

    fetch("/api/keystatic-entry-navigation", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load entry navigation");
        return response.json() as Promise<{ slugs: string[] }>;
      })
      .then((data) =>
        setSlugs([...data.slugs].sort(entryNameCollator.compare))
      )
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error(error);
        }
      });

    return () => controller.abort();
  }, [route]);

  useEffect(() => {
    if (!route) {
      setToolbarDetails(null);
      return;
    }

    const findToolbar = () => {
      const toolbar = document.querySelector<HTMLElement>(
        '#keystatic-main-panel [role="toolbar"]'
      );
      const existingButton =
        toolbar?.querySelector<HTMLElement>(":scope > button");
      const icon = existingButton?.querySelector<HTMLElement>("svg");
      const label = existingButton?.querySelector<HTMLElement>("span");

      if (toolbar && existingButton && icon && label) {
        let portalTarget = toolbar.querySelector<HTMLElement>(
          ":scope > [data-entry-navigation]"
        );

        if (!portalTarget) {
          portalTarget = document.createElement("span");
          portalTarget.dataset.entryNavigation = "";
          portalTarget.style.display = "contents";
          toolbar.prepend(portalTarget);
        }

        setToolbarDetails((current) =>
          current?.portalTarget === portalTarget
            ? current
            : {
                buttonClassName: existingButton.className,
                iconClassName: icon.getAttribute("class") ?? "",
                labelClassName: label.className,
                portalTarget,
              }
        );
      }
    };

    findToolbar();
    const observer = new MutationObserver(findToolbar);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [route]);

  useEffect(() => {
    const storedScroll = sessionStorage.getItem(scrollStorageKey);
    const searchParams = new URLSearchParams(window.location.search);
    const requestedScroll = searchParams.get(scrollQueryKey) ?? storedScroll;
    if (requestedScroll === null || !route) return;

    const scrollTop = Number(requestedScroll);
    if (!Number.isFinite(scrollTop)) {
      sessionStorage.removeItem(scrollStorageKey);
      return;
    }

    let restoreTimer = 0;
    const restoreWhenEntryIsReady = () => {
      const form = document.querySelector<HTMLFormElement>("#item-edit-form");
      const scroller = getEditorScroller();
      const loadedSlug = Array.from(
        form?.querySelectorAll<HTMLInputElement>("input") ?? []
      ).some((input) => input.value === route.slug);

      if (!scroller || !loadedSlug) return;
      observer.disconnect();

      // Keystatic performs one more form layout after populating the inputs.
      // Restore after that pass so it cannot reset the pane back to the top.
      restoreTimer = window.setTimeout(() => {
        getEditorScroller()?.scrollTo({ top: scrollTop });
        sessionStorage.removeItem(scrollStorageKey);

        if (searchParams.has(scrollQueryKey)) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete(scrollQueryKey);
          window.history.replaceState(
            window.history.state,
            "",
            `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
          );
        }
      }, 500);
    };

    const observer = new MutationObserver(restoreWhenEntryIsReady);
    observer.observe(document.body, { childList: true, subtree: true });
    restoreWhenEntryIsReady();
    const cleanup = window.setTimeout(() => {
      observer.disconnect();
      sessionStorage.removeItem(scrollStorageKey);
    }, 5000);

    return () => {
      observer.disconnect();
      window.clearTimeout(restoreTimer);
      window.clearTimeout(cleanup);
    };
  }, [pathname, route]);

  if (!route || !toolbarDetails?.portalTarget.isConnected) return null;

  const currentIndex = slugs.indexOf(route.slug);
  const previousSlug = currentIndex > 0 ? slugs[currentIndex - 1] : null;
  const nextSlug =
    currentIndex >= 0 && currentIndex < slugs.length - 1
      ? slugs[currentIndex + 1]
      : null;

  const navigate = (slug: string | null) => {
    if (!slug) return;

    sessionStorage.setItem(
      scrollStorageKey,
      String(getEditorScroller()?.scrollTop ?? 0)
    );
    // Keystatic owns its routing state. Navigating through Next's app router
    // changes the URL without updating that state, leaving the old entry on
    // screen. A document navigation keeps Keystatic and the URL in sync; the
    // scroll position is restored from sessionStorage after it mounts again.
    const destination = new URL(
      `${route.itemBasePath}${encodeURIComponent(slug)}`,
      window.location.origin
    );
    destination.searchParams.set(
      scrollQueryKey,
      String(getEditorScroller()?.scrollTop ?? 0)
    );
    window.location.assign(`${destination.pathname}${destination.search}`);
  };

  const button = (direction: "previous" | "next", slug: string | null) => {
    const label = direction === "previous" ? "Previous entry" : "Next entry";
    const points =
      direction === "previous" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";

    return (
      <button
        aria-label={label}
        className={toolbarDetails.buttonClassName}
        disabled={!slug}
        key={direction}
        onClick={() => navigate(slug)}
        title={slug ? `${label}: ${slug}` : `No ${direction} entry`}
        type="button"
      >
        <svg
          aria-hidden="true"
          className={toolbarDetails.iconClassName}
          fill="none"
          focusable="false"
          height="1em"
          role="img"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          style={{
            display: "block",
            flexShrink: 0,
            height: "1em",
            stroke: "currentColor",
            width: "1em",
          }}
          viewBox="0 0 24 24"
        >
          <polyline points={points} />
        </svg>
        <span className={toolbarDetails.labelClassName}>{label}</span>
      </button>
    );
  };

  return createPortal(
    <>
      {button("previous", previousSlug)}
      {button("next", nextSlug)}
    </>,
    toolbarDetails.portalTarget
  );
}

export default function KeystaticApp() {
  return (
    <>
      <KeystaticPage />
      <EntryNavigation />
    </>
  );
}
