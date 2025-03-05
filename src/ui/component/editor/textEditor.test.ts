import { findQueryIndex, getLineIndex } from './textEditor'

describe('findQueryIndex', function() {
  describe('basic queries', function() {
    const query =
      'commander:naya\n' +
      't:land\n' +
      'o:landfall\n' +
      'o:"sacrifice a land"\n' +
      'o:graveyard\n' +
      '\n' +
      '\n' +
      'commander:zagoth\n' +
      'o:mill\n' +
      'o:surveil\n' +
      'o:graveyard\n' +
      '\n' +
      'eternal'
    it('finds the correct line for the first query', () => {
      const index = query.indexOf("o:")

      const result = findQueryIndex(query, index)

      expect(result).toEqual(0)
    })
    it('finds the correct line for the second query', () => {
      const index = query.indexOf("mill")

      const result = findQueryIndex(query, index)

      expect(result).toEqual(7)
    })
    it('empty lines count for the previous query', () => {
      const index = query.indexOf("\ncommander")

      const result = findQueryIndex(query, index)

      expect(result).toEqual(0)
    })
    it('when cursor is at the front of a query, that query is picked', () => {
      const index = query.indexOf("eternal")

      const result = findQueryIndex(query, index)

      expect(result).toEqual(12)
    })
  })

  describe('comment logic', function() {
    const commentfulQuery =
      'commander:naya\n' +
      'o:landfall\n' +
      '#t:land\n' +
      'o:"sacrifice a land"\n' +
      'o:graveyard\n' +
      '\n' +
      '# this is a comment for my cool zagoth build' +
      'commander:zagoth\n' +
      'o:mill\n' +
      'o:surveil\n' +
      'o:graveyard\n' +
      '\n' +
      'eternal'
    it('ignores commented lines below a base query', () => {
      const index = commentfulQuery.indexOf('o:graveyard')

      const result = findQueryIndex(commentfulQuery, index)

      expect(result).toEqual(0)
    })

    it('ignores commented lines above a base query', () => {
      const index = commentfulQuery.indexOf('mill')

      const result = findQueryIndex(commentfulQuery, index)

      expect(result).toEqual(7)
    })

    it('commented lines above a base query are associated with that base query', () => {
      const index = commentfulQuery.indexOf('# this')

      const result = findQueryIndex(commentfulQuery, index)

      expect(result).toEqual(7)
    })
    it.todo("what happens when first line is a comment AND theres no break between it and the first query?")
    it.todo("what happens when first line is a comment AND theres a break between it and the first query?")
    it.todo('what happens when a comment is in between 2 breaks?')
    it.todo("what happens when last line is a comment AND theres no break between it and the previous query?")
    it.todo("what happens when last line is a comment AND theres a break between it and the previous query?")
  })
})

describe('getLineIndex', function() {
  const query =
    'commander:naya\n' +
    't:land9\n' +
    'o:landfall\n' +
    'o:"sacrifice a land"\n' +
    'o:graveyard\n' +
    '\n' +
    '\n' +
    'commander:zagoth\n' +
    'o:mill\n' +
    'o:surveil\n' +
    'o:graveyard\n' +
    '\n' +
    'eternal'
  it('finds something at the start', () => {
    const index = query.indexOf("commander")

    const result = getLineIndex(query, index)

    expect(result).toEqual(0)
  })
  it('finds something on the first line', () => {
    const index = query.indexOf("mmander")

    const result = getLineIndex(query, index)

    expect(result).toEqual(0)
  })
  it('finds something on a middle line', function() {
    const index = query.indexOf("mill")

    const result = getLineIndex(query, index)

    expect(result).toEqual(8)
  })
  it('finds the last line', function() {
    const index = query.indexOf("eternal")

    const result = getLineIndex(query, index)

    expect(result).toEqual(12)
  })
  it("counts the last index before a newline as part of the previous line", () => {
    const index = query.indexOf("9")

    const result = getLineIndex(query, index)

    expect(result).toEqual(1)
  })
})