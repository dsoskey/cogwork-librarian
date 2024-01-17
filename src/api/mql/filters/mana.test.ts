import { davrielsWithering } from './testData/davrielsWithering'
import { kroxaTitanOfDeathsHunger } from './testData/kroxaTitanOfDeathsHunger'
import { defaultRunner, names } from './testData/_utils'
import { preordain } from './testData/preordain'
import { darkConfidant } from './testData/darkConfidant'
import { combineHybridSymbols } from './mana'
import { gitaxianProbe } from './testData/gitaxianProbe'
import { delverOfSecrets } from './testData/delverOfSecrets'

describe("combineHybridSymbols", function() {
  it("should not combine an existing hybrid symbol", function () {
    const symbols = "r/u/r/u".split("")
    const result = combineHybridSymbols(symbols);
    expect(result).toEqual(["r/u", "r/u"])
  })
  it('should combine mana symbols adjacent to a "/"', function() {
    const symbols = ["u","/", "r"];
    const result = combineHybridSymbols(symbols);
    expect(result).toEqual(["u/r"])
  })
  it('should combine mana symbols adjacent to a "/"', function() {
    const symbols = ["u", "b" ,"/", "r", "g"];
    const result = combineHybridSymbols(symbols);
    expect(result).toEqual(["u", "b/r", "g"])
  })
  it("drops leading and ending slashes", function() {
    const symbols = ["/", "u", "b" ,"/", "r", "g", "/"];
    const result = combineHybridSymbols(symbols);
    expect(result).toEqual(["u", "b/r", "g"])
  })
  it("drops slashes that have adjacent slashes", function() {
    const symbols = ["u", "b" ,"/", "/", "r", "g"];
    const result = combineHybridSymbols(symbols);
    expect(result).toEqual(["u", "b", "r", "g"])
  })
})

describe('mana filter', function() {

  const corpus = [preordain, davrielsWithering, darkConfidant, kroxaTitanOfDeathsHunger]
  const queryRunner = defaultRunner(corpus)
  it('should handle exact match', async function() {
    const result = names(await queryRunner.search("mana=rb"))

    expect(result).toEqual([kroxaTitanOfDeathsHunger.name])
  })

  it('should handle != filter', async function() {
    const result = names(await queryRunner.search("m!=b"))

    expect(result).toEqual([darkConfidant.name, kroxaTitanOfDeathsHunger.name, preordain.name])
  })

  it('should handle > filter', async function() {
    const result = names(await queryRunner.search("mana>b"))

    expect(result).toEqual([darkConfidant.name, kroxaTitanOfDeathsHunger.name])
  })

  it('should handle < filter', async function() {
    const result = names(await queryRunner.search("mana<rb"))

    expect(result).toEqual([davrielsWithering.name])
  })

  it('should handle <= filter', async function() {
    const result = names(await queryRunner.search("mana<=rb"))

    expect(result).toEqual([davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
  })

  it('should handle >= filter, which is the default', async function() {
    const result = names(await queryRunner.search("mana>=b"))
    const defaultResult = names(await queryRunner.search("mana:b"))

    expect(result).toEqual([darkConfidant.name, davrielsWithering.name, kroxaTitanOfDeathsHunger.name])
    expect(result).toEqual(defaultResult)
  })
  it.todo("should handle mixed symbols (aka r{r/u})")
})

describe('Mana regex filter', function() {
  const corpus = [gitaxianProbe, delverOfSecrets, davrielsWithering]
  const queryRunner = defaultRunner(corpus)
  it('should handle typical regexes', async function() {
    const result = names(await queryRunner.search("mana:/u/"))
    expect(result).toEqual([delverOfSecrets.name, gitaxianProbe.name])
  })
  it('should substitute special regex escapes like \\smp', async function() {
    const result = names(await queryRunner.search("mana:/\\smp/"))
    expect(result).toEqual([gitaxianProbe.name])
  })
})