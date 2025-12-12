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
  uniqueCardNodes: true,
  showCardNamesOnGraph: false,
  cardNodeContent: 'color-category',

  groupUnconnectedCards: false,
  showSearchTextOnGraph: false,

  scaleSearchNodeSize: true,
  searchNodeScalingFactor: 'connected-count',
}

export const GraphUserSettingsContext = createContext<GraphUserSettings>(DEFAULT_GRAPH_USER_SETTINGS)