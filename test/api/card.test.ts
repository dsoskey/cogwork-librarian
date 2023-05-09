import { emptyCost, ManaCost, toManaCost } from '../../src/api/memory/types/card'

describe('toManaCost', function () {
  interface TestCase {
    input: string[]
    expected: ManaCost
  }
  const cases: TestCase[] = [
    {
      input: ['4'],
      expected: { ...emptyCost, generic: 4 },
    },
    {
      input: ['5', '5'],
      expected: { ...emptyCost, generic: 10 },
    },
    {
      input: ['4', 'x', 'y', 'z'],
      expected: { ...emptyCost, generic: 4 },
    },
    {
      input: ['w', 'u', 'b', 'r', 'g', 'c', 's'],
      expected: { ...emptyCost, w: 1, u: 1, b: 1, r: 1, g: 1, c: 1, s: 1 },
    },
    {
      input: ['b', 'b'],
      expected: { ...emptyCost, b: 2 },
    },
  ]

  cases.forEach(({ input, expected }) => {
    it('output should match expected', function () {
      expect(toManaCost(input)).toEqual(expected)
    })
  })
})
