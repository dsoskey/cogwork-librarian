import { CompletionTree } from './completionTree'
import { isOracleVal, normCardList, NormedCard } from 'mtgql'
import { CubeCard } from 'mtgql/build/types/cube'
import { cogDB } from './db'
import * as Scryfall from 'scryfall-sdk'

class CardIndex {
  oracleToCard: { [id: string]: NormedCard } = {}
  completionTree = new CompletionTree()
  nameToOracle: { [name: string]: string } = {}

  constructor() {
    this.reset();
  }

  reset() {
    this.oracleToCard = {}
    this.nameToOracle = {}
    this.completionTree = new CompletionTree()
  }


  addCard(card: NormedCard) {
    if (!isOracleVal('extra')(card)) {
      this.oracleToCard[card.oracle_id] = card
      this.nameToOracle[card.name] = card.oracle_id
      this.nameToOracle[card.name.toLowerCase()] = card.oracle_id
      this.completionTree.addToTree(card.name)
      if (card.name.includes(' // ')) {
        const [left, right] = card.name.split(' // ')
        this.nameToOracle[left] = card.oracle_id
        this.nameToOracle[left.toLowerCase()] = card.oracle_id
      }
    }
  }

  cardByName = (name: string, fuzzy: boolean = false): NormedCard | undefined => {
    // todo: add fuzzing
    const fuzzed = fuzzy ? name : name
    return this.oracleToCard[this.nameToOracle[fuzzed]]
  }

  cardByOracle = (oracleId: string): NormedCard | undefined => {
    return this.oracleToCard[oracleId]
  }
// this looks pretty generalizable ngl

  bulkCardByOracle = async (oracleIds: string[]) => {
    const memOracles = oracleIds.map(this.cardByOracle)
    const missingMemoryIndices = memOracles
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)
    if (missingMemoryIndices.length === 0) return memOracles

    const oraclesToCheckDB = missingMemoryIndices.map(index => oracleIds[index])
    const newOracles = (await cogDB.card.bulkGet(oraclesToCheckDB)) ?? []
    const missingIndexes = newOracles
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)

    if (missingIndexes.length) return Promise.reject(missingIndexes)

    for (let i = 0; i < missingMemoryIndices.length; i++) {
      const index = missingMemoryIndices[i]
      memOracles[index] = newOracles[i]
    }
    return memOracles
  }

  bulkCardByCubeList = async (cubeList: CubeCard[]) => {
    const result = cubeList.map(it => this.cardByOracle(it.oracle_id))
    const missingMemoryIndices = result
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)
    if (missingMemoryIndices.length === 0) return result

    const oraclesToCheckDB = missingMemoryIndices.map(index => cubeList[index].oracle_id)
    const newOracles = (await cogDB.card.bulkGet(oraclesToCheckDB)) ?? []
    const missingDBIndexes = newOracles
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)

    for (let i = 0; i < missingMemoryIndices.length; i++) {
      const index = missingMemoryIndices[i]
      result[index] = newOracles[i]
    }
    if (missingDBIndexes.length === 0) return result

    const toCheckScryfall = missingDBIndexes
      .map(index => Scryfall.CardIdentifier.byId(cubeList[missingMemoryIndices[index]].print_id))
    const scryfallCards = await Scryfall.Cards.collection(...toCheckScryfall).waitForAll()
    if (scryfallCards.not_found.length) return Promise.reject(scryfallCards.not_found)

    for (let i = 0; i < missingDBIndexes.length; i++) {
      const index = missingMemoryIndices[missingDBIndexes[i]]
      // @ts-ignore
      result[index] = normCardList([scryfallCards[i]])[0]
    }
    return result
  }

  handleAutocomplete = async (input: string) => {
    return this.completionTree.getCompletions(input)
  }
}

export const CARD_INDEX = new CardIndex();