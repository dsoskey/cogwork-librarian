import { mirrex } from './testData/mirrex'
import { birdsOfParadise } from './testData/birdsOfParadise'
import { QueryRunner } from '../mql'
import { defaultOptions } from './testData/_utils'

describe('border filter', function() {
  const corpus = [mirrex, birdsOfParadise]
  const queryRunner = new QueryRunner({ corpus, defaultOptions });

  it("gets parsed properly", () => {
    const result = queryRunner.search('border:white')._unsafeUnwrap()

    expect(result[0].id).toEqual(birdsOfParadise.id)
  })
})