import type { Filters } from "@/src/types/filters";

export function buildInstagramFilterScript(filters: Filters): string {
  return `
    (function() {
      const filterConfig = ${JSON.stringify(filters)};
      const STYLE_ID = "entegram-style";
      const OBSERVER_KEY = "__entegramObserver";
      const TIMER_KEY = "__entegramObserverTimer";
      const TOUCH_STATE_KEY = "__entegramTouchState";
      const REEL_LOCK_STATE_KEY = "__entegramReelLockState";
      const NAVIGATION_PATCHED_KEY = "__entegramNavigationPatched";
      const SUGGESTION_TEXTS = ["Suggested for you", "Suggestions for you"];
      const SHARED_REEL_MARKER_KEY = "entegram.sharedReelPending";
      const SHARED_REEL_MARKER_VALUE = "1";
      const DIRECT_INTERACTION_MARKER_KEY = "entegram.directInteractionAt";
      const SHARED_REEL_LOCK_MESSAGE = "entegram.sharedReelLock";

      function normalizeText(value) {
        return (value || "").replace(/\\s+/g, " ").trim();
      }

      function getWindowState() {
        return window;
      }

      function isDirectPath(pathname) {
        return pathname.startsWith("/direct/");
      }

      function getPathname(value) {
        try {
          return new URL(value, location.origin).pathname;
        } catch (error) {
          return "";
        }
      }

      function isReelPath(value) {
        const pathname = getPathname(value);

        return pathname.startsWith("/reel/") || pathname.startsWith("/reels/");
      }

      function hideElement(element) {
        if (!(element instanceof HTMLElement)) {
          return;
        }

        if (element.matches("html, body, nav")) {
          return;
        }

        element.style.setProperty("display", "none", "important");
        element.setAttribute("data-entegram-hidden", "true");
      }

      function hasInboxEntryPoint(root) {
        if (!(root instanceof Element)) {
          return false;
        }

        return Boolean(
          root.querySelector('a[href^="/direct/"], a[href*="/direct/"]')
        );
      }

      function isAuthPage() {
        return Boolean(
          document.querySelector('input[name="username"], input[name="password"], form[action*="/accounts/login"]')
        );
      }

      function hasAuthenticatedShell() {
        return (
          !isAuthPage() &&
          Boolean(
            document.querySelector(
              'nav a[href^="/direct/"], nav a[href*="/direct/"], nav a[href="/"], nav a[href^="/reels/"], nav a[href^="/explore/"]'
            )
          )
        );
      }

      function isHomeTimeline() {
        const pathname = location.pathname;

        return pathname === "/" || pathname === "";
      }

      function markNextReelAsShared() {
        try {
          sessionStorage.setItem(
            SHARED_REEL_MARKER_KEY,
            SHARED_REEL_MARKER_VALUE
          );
        } catch (error) {}
      }

      function markDirectInteraction() {
        try {
          sessionStorage.setItem(
            DIRECT_INTERACTION_MARKER_KEY,
            String(Date.now())
          );
        } catch (error) {}
      }

      function clearSharedReelMarker() {
        try {
          sessionStorage.removeItem(SHARED_REEL_MARKER_KEY);
          sessionStorage.removeItem(DIRECT_INTERACTION_MARKER_KEY);
        } catch (error) {}
      }

      function postSharedReelLockState(isLocked) {
        try {
          window.ReactNativeWebView?.postMessage(
            JSON.stringify({
              type: SHARED_REEL_LOCK_MESSAGE,
              isLocked,
            })
          );
        } catch (error) {}
      }

      function hasSharedReelMarker() {
        try {
          return (
            sessionStorage.getItem(SHARED_REEL_MARKER_KEY) ===
            SHARED_REEL_MARKER_VALUE
          );
        } catch (error) {
          return false;
        }
      }

      function hasRecentDirectInteraction() {
        try {
          const value = Number(
            sessionStorage.getItem(DIRECT_INTERACTION_MARKER_KEY)
          );

          return Number.isFinite(value) && Date.now() - value < 15000;
        } catch (error) {
          return false;
        }
      }

      function hasLargeVisibleVideoSurface() {
        if (!document.body) {
          return false;
        }

        const videos = Array.from(document.querySelectorAll("video"));

        return videos.some((video) => {
          if (!(video instanceof HTMLVideoElement)) {
            return false;
          }

          const rect = video.getBoundingClientRect();

          return (
            rect.width >= Math.min(window.innerWidth * 0.45, 280) &&
            rect.height >= Math.min(window.innerHeight * 0.45, 360) &&
            rect.bottom > 0 &&
            rect.right > 0 &&
            rect.top < window.innerHeight &&
            rect.left < window.innerWidth
          );
        });
      }

      function isSharedReelPage() {
        if (!filterConfig.lockSharedReels) {
          return false;
        }

        if (isReelPath(location.href) && hasSharedReelMarker()) {
          return true;
        }

        if (isReelPath(location.href) && document.referrer.includes("/direct/")) {
          return true;
        }

        if (
          isDirectPath(location.pathname) &&
          (hasSharedReelMarker() || hasRecentDirectInteraction()) &&
          hasLargeVisibleVideoSurface()
        ) {
          return true;
        }

        return false;
      }

      function handleSharedReelLinkClick(event) {
        if (!(event.target instanceof Element)) {
          return;
        }

        if (isDirectPath(location.pathname)) {
          markDirectInteraction();
        }

        const link = event.target.closest('a[href]');

        if (!(link instanceof HTMLAnchorElement)) {
          return;
        }

        const href = link.getAttribute("href") || "";

        if (isDirectPath(location.pathname) && isReelPath(href)) {
          markNextReelAsShared();
        }
      }

      function blockSharedReelScrollEvent(event) {
        const windowState = getWindowState();
        const reelLockState = windowState[REEL_LOCK_STATE_KEY];

        if (!reelLockState || !reelLockState.active) {
          return;
        }

        if (event.type === "wheel") {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }

        if (event.type === "keydown") {
          const blockedKeys = [
            "ArrowDown",
            "ArrowUp",
            "PageDown",
            "PageUp",
            " ",
          ];

          if (blockedKeys.includes(event.key)) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }

          return;
        }

        if (event.type === "touchstart" && event.touches && event.touches[0]) {
          windowState[TOUCH_STATE_KEY] = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
          return;
        }

        if (event.type === "pointerdown") {
          windowState[TOUCH_STATE_KEY] = {
            x: event.clientX,
            y: event.clientY,
          };
          return;
        }

        if (
          event.type !== "touchmove" &&
          event.type !== "pointermove"
        ) {
          return;
        }

        const currentPoint =
          event.type === "touchmove" && event.touches && event.touches[0]
            ? {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY,
              }
            : {
                x: event.clientX,
                y: event.clientY,
              };
        const touchState = windowState[TOUCH_STATE_KEY];

        if (!touchState) {
          return;
        }

        const deltaX = Math.abs(currentPoint.x - touchState.x);
        const deltaY = Math.abs(currentPoint.y - touchState.y);

        if (deltaY > deltaX) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }

      function lockScrollableReelContainers() {
        if (!document.body) {
          return;
        }

        const nodes = [
          document.documentElement,
          document.body,
          ...Array.from(document.querySelectorAll("main, main *")),
        ];

        nodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          const style = window.getComputedStyle(node);
          const canScrollVertically =
            node.scrollHeight > node.clientHeight + 4 ||
            style.overflowY === "auto" ||
            style.overflowY === "scroll";

          if (!canScrollVertically) {
            return;
          }

          node.setAttribute("data-entegram-reel-scroll-locked", "true");
          node.style.setProperty("overflow-y", "hidden", "important");
          node.style.setProperty("overscroll-behavior", "none", "important");

          if (node.scrollTop !== 0) {
            node.scrollTop = 0;
          }
        });
      }

      function unlockScrollableReelContainers() {
        const nodes = document.querySelectorAll(
          '[data-entegram-reel-scroll-locked="true"]'
        );

        nodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          node.style.removeProperty("overflow-y");
          node.style.removeProperty("overscroll-behavior");
          node.removeAttribute("data-entegram-reel-scroll-locked");
        });
      }

      function getReelItemForVideo(video) {
        let currentElement = video;
        let fallback = video;

        for (let depth = 0; currentElement && depth < 8; depth += 1) {
          if (!(currentElement instanceof HTMLElement)) {
            break;
          }

          if (currentElement.matches("html, body, main")) {
            break;
          }

          fallback = currentElement;

          const rect = currentElement.getBoundingClientRect();
          const videoCount = currentElement.querySelectorAll("video").length;
          const mediaCount = currentElement.querySelectorAll("video, img, canvas").length;

          if (
            videoCount === 1 &&
            mediaCount <= 4 &&
            rect.height >= Math.min(window.innerHeight * 0.45, 360)
          ) {
            return currentElement;
          }

          currentElement = currentElement.parentElement;
        }

        return fallback;
      }

      function hideExtraLoadedReels() {
        const hiddenNodes = document.querySelectorAll(
          '[data-entegram-extra-reel="true"]'
        );
        hiddenNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            node.style.removeProperty("display");
            node.removeAttribute("data-entegram-extra-reel");
          }
        });

        const videos = Array.from(document.querySelectorAll("video")).filter(
          (video) => {
            if (!(video instanceof HTMLVideoElement)) {
              return false;
            }

            const rect = video.getBoundingClientRect();

            return rect.width > 80 && rect.height > 120;
          }
        );

        if (videos.length < 2) {
          return;
        }

        const reelItems = [];

        videos.forEach((video) => {
          const reelItem = getReelItemForVideo(video);

          if (reelItem instanceof HTMLElement && !reelItems.includes(reelItem)) {
            reelItems.push(reelItem);
          }
        });

        const sortedReelItems = reelItems.sort((first, second) => {
          return (
            Math.abs(first.getBoundingClientRect().top) -
            Math.abs(second.getBoundingClientRect().top)
          );
        });

        sortedReelItems.slice(1).forEach((node) => {
          node.setAttribute("data-entegram-extra-reel", "true");
          node.style.setProperty("display", "none", "important");
        });
      }

      function restoreExtraLoadedReels() {
        const hiddenNodes = document.querySelectorAll(
          '[data-entegram-extra-reel="true"]'
        );

        hiddenNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          node.style.removeProperty("display");
          node.removeAttribute("data-entegram-extra-reel");
        });
      }

      function installSharedReelLock() {
        const windowState = getWindowState();

        if (windowState[REEL_LOCK_STATE_KEY]?.active) {
          lockScrollableReelContainers();
          hideExtraLoadedReels();
          return;
        }

        const lockState = {
          active: true,
          onEvent: blockSharedReelScrollEvent,
          onScroll: function() {
            if (window.scrollY !== 0) {
              window.scrollTo(0, 0);
            }
          },
        };

        windowState[REEL_LOCK_STATE_KEY] = lockState;
        document.documentElement.setAttribute("data-entegram-shared-reel-lock", "true");
        document.documentElement.style.setProperty("overflow", "hidden", "important");
        document.body?.style.setProperty("overflow", "hidden", "important");
        document.body?.style.setProperty("touch-action", "pan-x pinch-zoom", "important");
        lockScrollableReelContainers();
        hideExtraLoadedReels();
        window.addEventListener("wheel", lockState.onEvent, {
          capture: true,
          passive: false,
        });
        window.addEventListener("touchstart", lockState.onEvent, {
          capture: true,
          passive: false,
        });
        window.addEventListener("touchmove", lockState.onEvent, {
          capture: true,
          passive: false,
        });
        window.addEventListener("pointerdown", lockState.onEvent, {
          capture: true,
          passive: false,
        });
        window.addEventListener("pointermove", lockState.onEvent, {
          capture: true,
          passive: false,
        });
        window.addEventListener("keydown", lockState.onEvent, {
          capture: true,
          passive: false,
        });
        window.addEventListener("scroll", lockState.onScroll, { passive: true });
        window.scrollTo(0, 0);
        postSharedReelLockState(true);
      }

      function removeSharedReelLock() {
        const windowState = getWindowState();
        const lockState = windowState[REEL_LOCK_STATE_KEY];

        if (!lockState) {
          return;
        }

        window.removeEventListener("wheel", lockState.onEvent, true);
        window.removeEventListener("touchstart", lockState.onEvent, true);
        window.removeEventListener("touchmove", lockState.onEvent, true);
        window.removeEventListener("pointerdown", lockState.onEvent, true);
        window.removeEventListener("pointermove", lockState.onEvent, true);
        window.removeEventListener("keydown", lockState.onEvent, true);
        window.removeEventListener("scroll", lockState.onScroll);
        document.documentElement.removeAttribute("data-entegram-shared-reel-lock");
        document.documentElement.style.removeProperty("overflow");
        document.body?.style.removeProperty("overflow");
        document.body?.style.removeProperty("touch-action");
        unlockScrollableReelContainers();
        restoreExtraLoadedReels();
        delete windowState[REEL_LOCK_STATE_KEY];
        delete windowState[TOUCH_STATE_KEY];
        postSharedReelLockState(false);
      }

      function syncSharedReelLock() {
        if (isSharedReelPage()) {
          installSharedReelLock();
          return;
        }

        removeSharedReelLock();

        if (!isReelPath(location.href) && !isDirectPath(location.pathname)) {
          clearSharedReelMarker();
        }
      }

      function installNavigationTracking() {
        const windowState = getWindowState();

        if (windowState[NAVIGATION_PATCHED_KEY]) {
          return;
        }

        const scheduleApply = function() {
          clearTimeout(windowState[TIMER_KEY]);
          windowState[TIMER_KEY] = setTimeout(applyFilters, 80);
        };

        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
          const nextPath = arguments.length > 2 ? arguments[2] : "";

          if (isDirectPath(location.pathname) && isReelPath(nextPath)) {
            markNextReelAsShared();
          }

          const result = originalPushState.apply(this, arguments);
          scheduleApply();
          return result;
        };

        history.replaceState = function() {
          const nextPath = arguments.length > 2 ? arguments[2] : "";

          if (isDirectPath(location.pathname) && isReelPath(nextPath)) {
            markNextReelAsShared();
          }

          const result = originalReplaceState.apply(this, arguments);
          scheduleApply();
          return result;
        };

        const routeHandler = function() {
          scheduleApply();
        };

        window.addEventListener("popstate", routeHandler);
        window.addEventListener("hashchange", routeHandler);
        document.addEventListener("click", handleSharedReelLinkClick, true);
        windowState[NAVIGATION_PATCHED_KEY] = true;
      }

      function shouldHideHomeFeed() {
        return Boolean(
          filterConfig.hideHomeFeed && hasAuthenticatedShell() && isHomeTimeline()
        );
      }

      function buildCssRules() {
        const rules = [];

        if (filterConfig.hideReels) {
          rules.push(
            "/* Heuristic selectors: Reels markup changes often, so these targets may need future updates. */",
            'a[href="/reels/"], a[href^="/reels/"], a[href*="/reels/"] { display: none !important; }'
          );
        }

        if (filterConfig.hideExplore) {
          rules.push(
            "/* Heuristic selectors: Explore markup changes often, so these targets may need future updates. */",
            'a[href="/explore/"], a[href^="/explore/"], a[href*="/explore/"] { display: none !important; }'
          );
        }

        if (filterConfig.hideSuggestions) {
          rules.push(
            "/* Suggestion containers are also removed by text matching below. */",
            '[data-entegram-suggestion="true"] { display: none !important; }'
          );
        }

        if (shouldHideHomeFeed()) {
          rules.push(
            "/* Keep Instagram navigation intact but remove the home timeline after the authenticated shell is present. */",
            "main article { display: none !important; }"
          );
        }

        if (filterConfig.hideStories) {
          rules.push(
            "/* Story tray detection is heuristic and intentionally narrow to avoid breaking inbox or login. */",
            '[data-entegram-story-tray="true"] { display: none !important; }'
          );
        }

        return rules.join("\\n");
      }

      function upsertStyle() {
        const styleRoot = document.head || document.documentElement;

        if (!styleRoot) {
          return;
        }

        let styleElement = document.getElementById(STYLE_ID);

        if (!styleElement) {
          styleElement = document.createElement("style");
          styleElement.id = STYLE_ID;
          styleRoot.appendChild(styleElement);
        }

        styleElement.textContent = buildCssRules();
      }

      function hideTextMatches(label) {
        if (!document.body) {
          return;
        }

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const hiddenTargets = new Set();

        while (walker.nextNode()) {
          const currentNode = walker.currentNode;
          const text = normalizeText(currentNode.textContent);

          if (text !== label) {
            continue;
          }

          const parentElement = currentNode.parentElement;

          if (!parentElement) {
            continue;
          }

          const target = parentElement.closest(
            'a, button, [role="button"], [role="link"], li'
          );

          if (!target || hiddenTargets.has(target) || hasInboxEntryPoint(target)) {
            continue;
          }

          hideElement(target);
          hiddenTargets.add(target);
        }
      }

      function findSuggestionTarget(element) {
        let currentElement = element;
        let fallback = element;

        for (let depth = 0; currentElement && depth < 5; depth += 1) {
          if (!(currentElement instanceof HTMLElement)) {
            break;
          }

          if (currentElement.matches("html, body, nav, main")) {
            break;
          }

          if (hasInboxEntryPoint(currentElement)) {
            break;
          }

          fallback = currentElement;

          const interactiveCount = currentElement.querySelectorAll(
            'a, button, [role="button"], [role="link"]'
          ).length;
          const mediaCount = currentElement.querySelectorAll("img, video, canvas").length;

          if (
            interactiveCount > 1 ||
            mediaCount > 0 ||
            currentElement.tagName === "SECTION" ||
            currentElement.tagName === "ARTICLE" ||
            currentElement.tagName === "LI"
          ) {
            return currentElement;
          }

          currentElement = currentElement.parentElement;
        }

        return fallback;
      }

      function hideSuggestionBlocks() {
        if (!filterConfig.hideSuggestions || !document.body) {
          return;
        }

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const hiddenTargets = new Set();

        while (walker.nextNode()) {
          const currentNode = walker.currentNode;
          const text = normalizeText(currentNode.textContent);

          if (!SUGGESTION_TEXTS.includes(text)) {
            continue;
          }

          const parentElement = currentNode.parentElement;

          if (!parentElement) {
            continue;
          }

          const target = findSuggestionTarget(parentElement);

          if (!(target instanceof HTMLElement) || hiddenTargets.has(target)) {
            continue;
          }

          target.setAttribute("data-entegram-suggestion", "true");
          hideElement(target);
          hiddenTargets.add(target);
        }
      }

      function markStoryTray() {
        const markedNodes = document.querySelectorAll('[data-entegram-story-tray="true"]');
        markedNodes.forEach((node) => node.removeAttribute("data-entegram-story-tray"));

        if (
          !filterConfig.hideStories ||
          !document.body ||
          !hasAuthenticatedShell() ||
          !isHomeTimeline()
        ) {
          return;
        }

        const candidates = Array.from(document.querySelectorAll("main section, main div"));
        const storyTray = candidates.find((node) => {
          if (!(node instanceof HTMLElement)) {
            return false;
          }

          if (node.matches("main, article")) {
            return false;
          }

          const rect = node.getBoundingClientRect();

          if (rect.height < 40 || rect.height > 220 || rect.top > window.innerHeight * 0.45) {
            return false;
          }

          const linkCount = node.querySelectorAll('a[href^="/"]').length;
          const avatarCount = node.querySelectorAll("img, canvas").length;
          const style = window.getComputedStyle(node);
          const isHorizontallyScrollable =
            node.scrollWidth > node.clientWidth + 24 ||
            style.overflowX === "auto" ||
            style.overflowX === "scroll";

          return linkCount >= 6 && avatarCount >= 6 && isHorizontallyScrollable;
        });

        if (storyTray) {
          storyTray.setAttribute("data-entegram-story-tray", "true");
        }
      }

      function applyFilters() {
        upsertStyle();

        if (filterConfig.hideReels) {
          hideTextMatches("Reels");
        }

        if (filterConfig.hideExplore) {
          hideTextMatches("Explore");
        }

        hideSuggestionBlocks();
        markStoryTray();
        syncSharedReelLock();
      }

      function installObserver() {
        if (!document.body) {
          requestAnimationFrame(installObserver);
          return;
        }

        const windowWithState = window;

        if (windowWithState[OBSERVER_KEY]) {
          windowWithState[OBSERVER_KEY].disconnect();
        }

        const scheduleApply = function() {
          clearTimeout(windowWithState[TIMER_KEY]);
          windowWithState[TIMER_KEY] = setTimeout(applyFilters, 80);
        };

        const observer = new MutationObserver(scheduleApply);
        observer.observe(document.body, { childList: true, subtree: true });
        windowWithState[OBSERVER_KEY] = observer;
      }

      applyFilters();
      installNavigationTracking();
      installObserver();
      true;
    })();
  `;
}
