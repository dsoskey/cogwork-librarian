import { Theme } from '../../../api/local/types/theme'

export const PRESET_THEMES: { [key: string]: Theme } = {
  'classic': {
    dark100: 'hsl(25, 31%, 12%)',
    dark150: 'hsl(24, 20%, 20%)',
    dark200: 'hsl(25, 32%, 20%)',
    dark300: 'hsl(25, 32%, 27%)',
    light600: 'hsl(19, 41%, 88%)',
    active599: 'hsl(180, 100%, 69%, 100%)',
    active575: 'hsl(180, 100%, 69%, 75%)',
    active550: 'hsl(180, 100%, 69%, 50%)'
  },
  "'97": {
    dark100: 'hsl(349, 31%, 12%)',
    dark150: 'hsl(349, 20%, 20%)',
    dark200: 'hsl(350, 32%, 20%)',
    dark300: 'hsl(350, 61%, 17%)',
    light600: 'hsl(41, 92%, 65%)',
    active599: 'hsl(160, 100%, 69%, 100%)',
    active575: 'hsl(160, 100%, 69%, 75%)',
    active550: 'hsl(160, 100%, 69%, 50%)'
  },
  'surveil getup': {
    dark100: 'hsl(257, 31%, 6%)',
    dark150: 'hsl(257, 20%, 10%)',
    dark200: 'hsl(258, 21%, 14%)',
    dark300: 'hsl(258, 21%, 18%)',
    light600: 'hsl(228, 33%, 97%)',
    active599: 'hsl(323, 80%, 69%, 100%)',
    active575: 'hsl(323, 80%, 69%, 75%)',
    active550: 'hsl(323, 80%, 69%, 50%)'
  },
  'surveil lifted': {
    dark100: 'hsl(257, 31%, 6%)',
    dark150: 'hsl(257, 20%, 10%)',
    dark200: 'hsl(258, 21%, 14%)',
    dark300: 'hsl(258, 21%, 18%)',
    light600: 'hsl(228, 33%, 97%)',
    active599: 'hsl(350, 96%, 59%, 100%)',
    active575: 'hsl(350, 96%, 59%, 75%)',
    active550: 'hsl(350, 96%, 59%, 50%)'
  },
  chiller: {
    'dark100': 'hsl(235, 64%, 22%)',
    'dark150': 'hsl(235, 64%, 36.666666666666664%)',
    'dark200': 'hsl(236, 64%, 51.333333333333336%)',
    'dark300': 'hsl(236, 64%, 66%)',
    'light600': 'hsl(209, 28%, 78%)',
    'active599': 'hsl(60, 100%, 91%, 100%)',
    'active575': 'hsl(60, 100%, 91%, 75%)',
    'active550': 'hsl(60, 100%, 91%, 50%)'
  },
  melonade: {
    'dark100': 'hsl(359, 100%, 12.33%)',
    'dark150': 'hsl(359, 100%, 20.56%)',
    'dark200': 'hsl(360, 100%, 28.78%)',
    'dark300': 'hsl(360, 100%, 37%)',
    'light600': 'hsl(341, 100%, 77%)',
    'active599': 'hsl(89, 100%, 50%, 100%)',
    'active575': 'hsl(89, 100%, 50%, 75%)',
    'active550': 'hsl(89, 100%, 50%, 50%)'
  },
  'hacker-shit': {
    'dark100': 'hsl(135, 100%, 3.6666666666666665%)',
    'dark150': 'hsl(135, 100%, 6.111111111111111%)',
    'dark200': 'hsl(136, 100%, 8.555555555555555%)',
    'dark300': 'hsl(136, 100%, 11%)',
    'light600': 'hsl(179, 100%, 70%)',
    'active599': 'hsl(110, 100%, 55%, 100%)',
    'active575': 'hsl(110, 100%, 55%, 75%)',
    'active550': 'hsl(110, 100%, 55%, 50%)'
  },
  'white lotus': {
    'dark100': 'hsl(349, 2%, 33.33%)',
    'dark150': 'hsl(349, 2%, 55.55%)',
    'dark200': 'hsl(350, 2%, 77.77%)',
    'dark300': 'hsl(350, 95%, 95%)',
    'light600': 'hsl(41, 0%, 0%)',
    'active599': 'hsl(271, 79%, 69%, 100%)',
    'active575': 'hsl(271, 79%, 69%, 75%)',
    'active550': 'hsl(271, 79%, 69%, 50%)'
  },
  'black lotus': {
    'dark100': 'hsl(282, 11%, 6.33%)',
    'dark150': 'hsl(282, 11%, 10.56%)',
    'dark200': 'hsl(283, 11%, 14.78%)',
    'dark300': 'hsl(283, 11%, 19%)',
    'light600': 'hsl(260, 30%, 90%)',
    'active599': 'hsl(267, 100%, 78%, 100%)',
    'active575': 'hsl(267, 100%, 78%, 75%)',
    'active550': 'hsl(267, 100%, 78%, 50%)'
  },
  'all hallow\'s eve': {
    'dark100': 'hsl(32, 17%, 3.67%)',
    'dark150': 'hsl(32, 17%, 6.11%)',
    'dark200': 'hsl(33, 17%, 8.56%)',
    'dark300': 'hsl(33, 17%, 15%)',
    'light600': 'hsl(41, 0%, 100%)',
    'active599': 'hsl(24, 85%, 60%, 100%)',
    'active575': 'hsl(24, 85%, 60%, 75%)',
    'active550': 'hsl(24, 85%, 60%, 50%)'
  },
  eva: {
    "dark100":"color-mix(in oklch, color-mix(in oklch, var(--dark300), var(--light600) 14%), black 64%)",
    "dark150":"color-mix(in oklch, color-mix(in oklch, var(--dark300), var(--light600) 14%), black 47%)",
    "dark200":"color-mix(in oklch, color-mix(in oklch, var(--dark300), var(--light600) 14%), black 30%)",
    "dark300":"hsl(296, 100%, 27%)",
    "light600":"hsl(57, 100%, 56%)",
    "active599":"hsl(90, 83%, 61%, 100%)",
    "active575":"color-mix(in oklch, var(--active599), transparent 20%)",
    "active550":"color-mix(in oklch, var(--active599), transparent 35%)",
  },
}