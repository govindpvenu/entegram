import type { Filters } from "@/src/types/filters";

export function buildInstagramFilterScript(filters: Filters): string {
  return `
    (function() {
      const filterConfig = ${JSON.stringify(filters)};
      const STYLE_ID = "entegram-style";
      const OBSERVER_KEY = "__entegramObserver";
      const TIMER_KEY = "__entegramObserverTimer";
      const SUGGESTION_TEXTS = ["Suggested for you", "Suggestions for you"];

      function normalizeText(value) {
        return (value || "").replace(/\\s+/g, " ").trim();
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
      installObserver();
      true;
    })();
  `;
}
