import { parseEntry } from './cardEntry'

describe('parseEntry', () => {
  const testCases = [
    {
      input: '4 Chumbo Wumbo (STX) 42★',
      expected: {
        quantity: 4,
        name: 'Chumbo Wumbo',
        set: 'STX',
        cn: '42★'
      }
    },
    {
      input: 'Erase (Not the Urza\'s Legacy One)',
      expected: {
        name: 'Erase (Not the Urza\'s Legacy One)'
      }
    },
    {
      input: 'Ratchet Bomb (2XM)',
      expected: {
        name: 'Ratchet Bomb',
        set: '2XM'
      }
    },
    {
      input: 'Hazmat Suit (Used) (UST)',
      expected: {
        name: 'Hazmat Suit (Used)',
        set: 'UST',
      }
    },
    {
      input: '1996 World Champion',
      expected: {
        name: 'World Champion',
        quantity: 1996,
      }
    },
    {
      input: '3 Phyrexian Metamorph (PNPH) 42★ *F*',
      expected: {
        quantity: 1,
        name: 'Phyrexian Metamorph',
        set: 'PNPH',
        cn: '42★',
        finish: '*F*',
      }
    }
  ]
  testCases.forEach(({ input, expected }) =>
    it(`should parse ${input}`, () => {
      const output = parseEntry(input)
      expect(output).toEqual(expected)
    })
  )
})