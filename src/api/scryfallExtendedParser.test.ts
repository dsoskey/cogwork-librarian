import { parseQuerySet } from './scryfallExtendedParser'
import { weightAlgorithms } from './queryRunnerCommon'

describe('parseQuerySet', function() {
  describe('alias/use', function() {
    it('should error for aliases with no name', function() {
      const result = parseQuerySet(["@alias:(commander:rb)"], 0)

      expect(result.isErr()).toEqual(true)
    })

    it('should error for aliases with a missing (', function() {
      const result = parseQuerySet(["@alias:domaincommander:rb)"], 0)

      expect(result.isErr()).toEqual(true)
    })

    it('should error for aliases with a missing )', function() {
      const result = parseQuerySet(["@alias:domain(commander:rb"], 0)

      expect(result.isErr()).toEqual(true)
    })

    it('should error for duplicate aliases', function() {
      const result = parseQuerySet([
        "@dm:allsub",
        "",
        "@alias:domain(is:extra)",
        "",
        "@alias:domain(commander:rb)",
        "",
        "o:flying @use:domain kw:trample"
      ], 6)

      expect(result.isErr()).toEqual(true)
    })

    it('should error for a use with no matching alias', function() {
      const result = parseQuerySet(["@use:fake"], 0)

      expect(result.isErr()).toEqual(true)
    })

    it('should run an alias as a standalone query', function() {
      const result = parseQuerySet([
        "@dm:allsub",
        "",
        "@alias:domain(commander:rb)",
      ], 2)._unsafeUnwrap()

      expect(result.queries).toEqual(["(commander:rb)"])
    })

    it('should substitute an alias when used in a query', function() {
      const result = parseQuerySet([
        "@dm:allsub",
        "",
        "@alias:domain(commander:rb)",
        "",
        "o:flying @use:domain kw:trample"
      ], 4)._unsafeUnwrap()

      expect(result.queries).toEqual(["o:flying (commander:rb) kw:trample"])
    })
  })

  describe('defaultWeight', function() {
    it('should error when defaultWeight isnt recognized', function() {
      const result = parseQuerySet([
        "@dw:zipg"
      ], 0)

      expect(result.isErr()).toEqual(true)
    })

    it('should error for duplicate defaultWeights', function() {
      const result = parseQuerySet([
        "@defaultWeight:zipf",
        "",
        "@dw:uniform",
        "",
        "who cares?"
      ], 4)

      expect(result.isErr()).toEqual(true)
    })

    it('should set the correct weight algorithm for zipf', function() {
      const result = parseQuerySet([
        "@dw:zipf",
        "",
        "o:flying"
      ], 2)._unsafeUnwrap()


      expect(result.getWeight).toEqual(weightAlgorithms.zipf)
    })

    it('should set the correct weight algorithm for uniform', function() {
      const result = parseQuerySet([
        "@dw:uniform",
        "",
        "o:flying"
      ], 2)._unsafeUnwrap()


      expect(result.getWeight).toEqual(weightAlgorithms.uniform)
    })
  })

  describe('defaultMode', function() {
    it('should error when defaultMode isnt recognized', function() {
      const result = parseQuerySet([
        "@dm:nosub"
      ], 0)

      expect(result.isErr()).toEqual(true)
    })

    it('should error for duplicate defaultWeights', function() {
      const result = parseQuerySet([
        "@defaultMode:allsub",
        "",
        "@dm:basesub",
        "",
        "who cares?"
      ], 4)

      expect(result.isErr()).toEqual(true)
    })

    it('should count each line as a subquery for allsub', function() {
      const result = parseQuerySet([
        "@dm:allsub",
        "",
        "query1",
        "#comment",
        "query2",
        "",
        "kw:flying",
      ], 2)._unsafeUnwrap()

      expect(result.queries).toEqual(["query1", "query2"])
      expect(result.injectPrefix("query1")).toEqual("query1")
    })

    it('should count the first query as base for basesub', function() {
      const result = parseQuerySet([
        "@dm:basesub",
        "",
        "query1",
        "query2",
        "",
        "kw:flying",
      ], 2)._unsafeUnwrap()

      expect(result.queries).toEqual(["query2"])
      expect(result.injectPrefix("query2")).toEqual("query1 (query2)")

    })
  })

  describe('comments', function() {
    it('should error for a paragraph full of comments', function() {
      const result = parseQuerySet([
        "# commnt",
        "# comment",
        "# comment",
      ], 0)

      expect(result.isErr()).toEqual(true)
    })
  })
})