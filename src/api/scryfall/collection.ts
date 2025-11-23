import { SCRYFALL_BASE_URI } from './constants'
import { Card } from 'mtgql'
import _chunk from 'lodash/chunk'

const COLLECTION_PAGE_SIZE = 75
interface CardIdentifier {
  id?: string;
  mtgo_id?: number;
  multiverse_id?: number;
  oracle_id?: string;
  illustration_id?: string;
  name?: string;
  set?: string;
  collector_number?: string;
}

interface CollectionPage {
  object: string;
  not_found: CardIdentifier[];
  data: Card[];
}

export async function fetchCardCollection(identifiers: CardIdentifier[]): Promise<CollectionPage> {
  const requests = _chunk(identifiers, COLLECTION_PAGE_SIZE);
  const responses = await Promise
    .allSettled(requests.map(async (r, index) => {
      if (index > 0) {
        await new Promise(r => setTimeout(r, index * 50));
      }
      return getCollectionPage(r)
    }));

  const result: CollectionPage = {
    object: 'list',
    not_found: [],
    data: [],
  };

  for (let i = 0; i < responses.length; i++){
    const requestPage = requests[i];
    const responsePage = responses[i];
    if (responsePage.status === 'rejected') {
      console.warn('Failed to fetch collection page.', responsePage.reason)
      result.not_found.push(...requestPage);
    } else {
      const { not_found, data } = responsePage.value;
      if (not_found) {
        result.not_found.push(...not_found);
      }
      if (data) {
        result.data.push(...data);
      }
    }
  }

  return result;
}


async function getCollectionPage(identifiers: CardIdentifier[]): Promise<CollectionPage> {
  if (identifiers.length >= COLLECTION_PAGE_SIZE) throw Error("Collection page size too large!")

  const response = await fetch(`${SCRYFALL_BASE_URI}/cards/collection`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      identifiers,
    })
  })

  return await response.json()
}