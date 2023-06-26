import { preordain } from './testData/preordain'
import { asymmetrySage } from './testData/asymmetrySage'
import { lagoHirvienteDeDarigaaz } from './testData/lagoHirvienteDeDarigaaz'
import { QueryRunner } from '../queryRunner'
import { defaultOptions } from './testData/_options'

describe('in filter', function() {
  const corpus = [preordain, asymmetrySage, lagoHirvienteDeDarigaaz]
  const queryRunner = new QueryRunner({ corpus, defaultOptions })
  it('should show cards that were printed in a set', function() {
    const result = queryRunner.search("in:m11")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([preordain.name])
  })
  it('should show cards that were printed in a set_type', function() {
    const result = queryRunner.search("in:core")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([preordain.name])
  })
  it('should show cards that were printed in a game', function() {
    const result = queryRunner.search("in:arena")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([asymmetrySage.name])
  })
  it('should show cards that were printed in a language', function() {
    const result = queryRunner.search("in:es")._unsafeUnwrap().map(it => it.name)

    expect(result).toEqual([lagoHirvienteDeDarigaaz.name])
  })
})