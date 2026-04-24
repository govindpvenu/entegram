import * as React from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { DEFAULT_FILTERS, type Filters } from "@/src/types/filters";

const FILTER_STORAGE_KEY = "entegram.filters.v1";

type FilterContextValue = {
  filters: Filters;
  isHydrated: boolean;
  replaceFilters: (nextFilters: Filters) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
};

const FilterContext = React.createContext<FilterContextValue | null>(null);

function mergeStoredFilters(value: unknown): Filters | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<Record<keyof Filters, unknown>>;

  return {
    hideExplore:
      typeof candidate.hideExplore === "boolean"
        ? candidate.hideExplore
        : DEFAULT_FILTERS.hideExplore,
    hideHomeFeed:
      typeof candidate.hideHomeFeed === "boolean"
        ? candidate.hideHomeFeed
        : DEFAULT_FILTERS.hideHomeFeed,
    hideReels:
      typeof candidate.hideReels === "boolean"
        ? candidate.hideReels
        : DEFAULT_FILTERS.hideReels,
    hideStories:
      typeof candidate.hideStories === "boolean"
        ? candidate.hideStories
        : DEFAULT_FILTERS.hideStories,
    hideSuggestions:
      typeof candidate.hideSuggestions === "boolean"
        ? candidate.hideSuggestions
        : DEFAULT_FILTERS.hideSuggestions,
  };
}

export function FilterProvider({ children }: React.PropsWithChildren) {
  const [filters, setFilters] = React.useState(DEFAULT_FILTERS);
  const [isHydrated, setIsHydrated] = React.useState(false);

  async function persistFilters(nextFilters: Filters) {
    try {
      await AsyncStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify(nextFilters)
      );
    } catch (error) {
      console.warn("Failed to persist Entegram filters.", error);
    }
  }

  React.useEffect(() => {
    let isMounted = true;

    async function hydrateFilters() {
      try {
        const storedFilters = await AsyncStorage.getItem(FILTER_STORAGE_KEY);

        if (!storedFilters) {
          return;
        }

        const parsedFilters = mergeStoredFilters(JSON.parse(storedFilters));

        if (parsedFilters && isMounted) {
          setFilters(parsedFilters);
        }
      } catch (error) {
        console.warn("Failed to hydrate Entegram filters.", error);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    void hydrateFilters();

    return () => {
      isMounted = false;
    };
  }, []);

  function replaceFilters(nextFilters: Filters) {
    setFilters(nextFilters);
    void persistFilters(nextFilters);
  }

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((currentFilters) => {
      const nextFilters = {
        ...currentFilters,
        [key]: value,
      };

      void persistFilters(nextFilters);

      return nextFilters;
    });
  }

  return (
    <FilterContext
      value={{
        filters,
        isHydrated,
        replaceFilters,
        setFilter,
      }}
    >
      {children}
    </FilterContext>
  );
}

export function useFilters() {
  const context = React.use(FilterContext);

  if (!context) {
    throw new Error("useFilters must be used inside a FilterProvider.");
  }

  return context;
}
