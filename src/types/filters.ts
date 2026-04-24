export type Filters = {
  hideReels: boolean;
  hideExplore: boolean;
  hideHomeFeed: boolean;
  hideSuggestions: boolean;
  hideStories: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  hideReels: true,
  hideExplore: true,
  hideHomeFeed: true,
  hideSuggestions: true,
  hideStories: false,
};
