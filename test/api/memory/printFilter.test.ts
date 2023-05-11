import { aridmesa } from '../../res/data'
import { Printing } from '../../../src/api/memory/types/normedCard'
import { dateFilter } from '../../../src/api/memory/filters/date'

describe('dateFilter', function () {
  it('works for YYYY-MM-DD', () => {
    const testFunc = dateFilter('>', '2023-01-01')

    const rezzzy = testFunc(aridmesa as Printing)

    expect(rezzzy).toEqual(false)
  })
})
