import { ManaCost, toManaCost } from './card'

describe('toManaCost', function () {
  interface TestCase {
    input: string[]
    expected: ManaCost
  }
  const cases: TestCase[] = [
    {
      input: ['4'],
      expected: { generic: 4 },
    },
    {
      input: ['5', '5'],
      expected: { generic: 10 },
    },
    {
      input: ['4', 'x', 'y', 'z'],
      expected: { generic: 4, x: 1, y: 1, z: 1 },
    },
    {
      input: ['w', 'u', 'b', 'r', 'g', 'c', 's'],
      expected: { w: 1, u: 1, b: 1, r: 1, g: 1, c: 1, s: 1 },
    },
    {
      input: ['b', 'b'],
      expected: { b: 2 },
    },
  ]

  cases.forEach(({ input, expected }) => {
    it('output should match expected', function () {
      expect(toManaCost(input)).toEqual(expected)
    })
  })
})
