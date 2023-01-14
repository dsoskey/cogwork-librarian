export const displayQueries = [
    'o=/whenever ~ deals/',
    'o:/add {.}\\./',
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
    't=creature',
    't:merfolk',
    't=legendary',
    't="legendary creature"',
    't=/tribal .* elf/',
    'layout:art_series',
    'c=g',
    'c:g',
    'c<=w',
    'c>R',
    'c>=U',
    "c=ur",
    "c=urg",
    "c=urgwb",
    "c=witherbloom",
    "c<=savai",
    "c=c",
    'c=urgw', // reported upstream: https://github.com/dekkerglen/CubeCobra/issues/2336

]

const testQueries = [
    ...displayQueries,
    'o:"elf" OR o:"goblin"',
    'o:"elf" oR o:"goblin"',
    'o:"elf" Or o:"goblin"',
    "o:/{t}: add {.}\./",
    'o:"CREATURE"',
    'pow>10',
    'pow<10',
    'power=6',
    'tough=9',
    'toughness=9',
    't=merfolk',
    't=CREATURE',
    '-layout:art_series',
]

const unimplementedQueries = [
    `fo:"put the rest on the bottom"`, // oracle works like full-oracle atm
    "keyword:flying",
    "is:*", // any of them
]

const brokenQueries = [
]