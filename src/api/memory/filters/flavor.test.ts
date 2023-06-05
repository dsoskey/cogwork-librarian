import { gorillaTitan } from './testData/gorillaTitan'
import { birdsOfParadise } from './testData/birdsOfParadise'
import { emberethShieldbreaker } from './testData/emberethShieldbreaker'
import { defaultOptions } from './testData/_options'
import { QueryRunner } from '../queryRunner'

describe("flavor filters", () => {
  const corpus = [gorillaTitan, birdsOfParadise, emberethShieldbreaker]
  const queryRunner = new QueryRunner(corpus, defaultOptions)

  it('should handle string searches', function() {
    const result = queryRunner.search("flavor:banana")._unsafeUnwrap()

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual(gorillaTitan.id)
  })

  it('should handle regex searches', function() {
    const result = queryRunner.search('flavor:/".+"/')._unsafeUnwrap()

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual(emberethShieldbreaker.id)
    expect(result[1].id).toEqual(gorillaTitan.id)
  })
})