import { mirrex } from './testData/mirrex'
import { animateLand } from './testData/animateLand'
import { QueryRunner } from '../mql'
import { defaultOptions } from './testData/_utils'
import { negate } from './testData/negate'

describe('rarity filter', function() {
  const corpus = [mirrex, animateLand, negate]
  const queryRunner = new QueryRunner({ corpus, defaultOptions });

  ["r", 'rarity'].forEach(filterKeyword => {
    it(`${filterKeyword} gets parsed properly`, () => {
      const result = queryRunner.search(`${filterKeyword}:r`)._unsafeUnwrap()

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(mirrex.id)
    })
  })

  it('handles <=', () => {
    const result = queryRunner.search(`r<=r`)._unsafeUnwrap()

    expect(result.length).toEqual(3)
    expect(result[0].id).toEqual(animateLand.id)
    expect(result[1].id).toEqual(mirrex.id)
    expect(result[2].id).toEqual(negate.id)
  })
  it('handles <', () => {
    const result = queryRunner.search(`r<r`)._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(animateLand.id)
    expect(result[1].id).toEqual(negate.id)
  })

  it('handles >=', () => {
    const result = queryRunner.search(`r>=u`)._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(animateLand.id)
    expect(result[1].id).toEqual(mirrex.id)
  })

  it('handles >', () => {
    const result = queryRunner.search(`r>u`)._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(mirrex.id)
  })

  it('handles !=', () => {
    const result = queryRunner.search(`r!=common`)._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(animateLand.id)
    expect(result[1].id).toEqual(mirrex.id)
  })
})