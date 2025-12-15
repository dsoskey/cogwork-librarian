import { createContext } from 'react'

export type CardNodeContentType = 'color-category' | 'color-identity' | 'image-crop' | 'rarity'
export interface GraphUserSettings {
  uniqueCardNodes: boolean;
  showCardNamesOnGraph: boolean;
  cardNodeContent: CardNodeContentType;

  groupUnconnectedCards: boolean;
  showSearchTextOnGraph: boolean;

  scaleSearchNodeSize: boolean;
  searchNodeScalingFactor: 'full-search-count' | 'connected-count'
}

export const DEFAULT_GRAPH_USER_SETTINGS: GraphUserSettings = {
  uniqueCardNodes: true, // implemented
  showCardNamesOnGraph: false, // v2
  cardNodeContent: 'color-category', // default

  groupUnconnectedCards: false, // default
  showSearchTextOnGraph: false, // v2

  scaleSearchNodeSize: true, // default
  searchNodeScalingFactor: 'connected-count', // default
}

export const GraphUserSettingsContext = createContext<GraphUserSettings>(DEFAULT_GRAPH_USER_SETTINGS)