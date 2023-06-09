import { preordain } from './testData/preordain'
import { asymmetrySage } from './testData/asymmetrySage'
import { lagoHirvienteDeDarigaaz } from './testData/lagoHirvienteDeDarigaaz'
import { QueryRunner } from '../queryRunner'

describe('in filter', function() {
  const corpus = [preordain, asymmetrySage, lagoHirvienteDeDarigaaz]
  const queryRunner = new QueryRunner(corpus)
  it('should show cards that were printed in a set', function() {
    const result = queryRunner.search("in:m11")._unsafeUnwrap()

    expect(result).toEqual([preordain])
  })
  it('should show cards that were printed in a set_type', function() {
    const result = queryRunner.search("in:core")._unsafeUnwrap()

    expect(result).toEqual([preordain])
  })
  it('should show cards that were printed in a game', function() {
    const result = queryRunner.search("in:arena")._unsafeUnwrap()

    expect(result).toEqual([asymmetrySage])
  })
  it('should show cards that were printed in a language', function() {
    const result = queryRunner.search("in:es")._unsafeUnwrap()

    expect(result).toEqual([lagoHirvienteDeDarigaaz])
  })
})