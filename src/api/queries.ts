export const displayQueries = [
    'o=/whenever ~ deals/',
    '-o:~',
    'cmc:1',
    'o:draw',
    'o=draw',
    'o:"draw a card"',
    'o="draw a card"',
    'o:"elf" or o:"goblin"',
    '(o:"elf" or o:"goblin") -o:~',
    'o:"creature"',
    'pow=6',
    'tou=9',
]

const testQueries = [
    ...displayQueries,
    'o:"elf" OR o:"goblin"',
    'o:"elf" oR o:"goblin"',
    'o:"elf" Or o:"goblin"',
    'o:"CREATURE"',
    'pow>10',
    'power=6',
    'tough=9',
    'toughness=9',
]