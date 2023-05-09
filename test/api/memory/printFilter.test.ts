import { printFilters } from '../../../src/api/memory/printFilter'
import { aridmesa } from '../../res/data'
import { Printing } from '../../../src/api/memory/types/normedCard'

describe('dateFilter', function () {
  it('works for YYYY-MM-DD', () => {
    const testFunc = printFilters.dateFilter('>', '2023-01-01')

    const rezzzy = testFunc(aridmesa as Printing)

    expect(rezzzy).toEqual(false)
  })
})
