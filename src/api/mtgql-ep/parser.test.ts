import { alias, parseQuerySet, replaceUse, collapseMultiline, venn } from './parser'
import { Alias } from './types'
import { weightAlgorithms } from '../queryRunnerCommon'

describe('alias', function() {
  it('should parse an alias real proper', function() {
    const result = alias("@a:u(t:creature)");
    const expected: Alias = { name: "u", query: "(t:creature)" };
    expect(result).toEqual(expected)
  })
})

describe('unMultiline', function() {

  it('should parse an alias real proper', function() {
    const input = [
      "",
      "jerp\\",
      "clerp",
      "shamp",
      "champ \\",
      "jamp \\",
      "buppy",
    ];

    const result = collapseMultiline(input);
    expect(result).toEqual({"indexToCollapsedIndex": [0, 1, 1, 2, 3, 3, 3], "collapsed": ["", "jerp clerp", "shamp", "champ jamp buppy"]})
  })
})

describe('venn', function() {
  function newVenn(left: string, right: string) {
    return `@venn(${left})(${right})`
  }
  describe('happy cases', function() {
    const testCases = [
      ["simple, valid query", "t:creature", "name:bushwhack"],
      ["simple, valid query", "@use:a", "name:bushwhack"],
      ["queries with parentheses", "(t:creature or t:artifact) c:u", "r:u (name:bushwhack or t:frog)"],
    ]
    testCases.forEach(([msg, left, right]) => {
      it(`should create a venn for ${msg}`, function() {
        const result = venn(newVenn(left, right));
        expect(result).toEqual({ left, right })
      })
    })
  })

  describe('error cases', function() {
    const testCases = [
      ["missing left open parens", "@vennt:creature)(t:artifact)"],
      ["missing left close parens", "@venn(t:creature(t:artifact)"],
      ["missing right open parens", "@venn(t:creature)t:artifact)"],
      ["missing right close parens", "@venn(t:creature)(t:artifact"],
      ["stuff after right close parens", "@venn(t:creature)(t:artifact)extra"],
    ]
    testCases.forEach(([msg, input]) => {
      it(`should throw an error for ${msg}`, function() {
        expect(() => {
          venn(input)
        }).toThrow()
      })
    })
  })
})

describe('replaceUse', function() {
  it('should replace all aliases', function() {
    const input = "@u:a or @u:b";
    const aliases = {
      a: { name: "a", query: "foo" },
      b: { name: "b", query: "bingus" },
    };
    const result = replaceUse(aliases, input);

    expect(result).toEqual("foo or bingus");
  })

  it('should handle nested aliases', function() {
    const input = "@u:a or @u:b";
    const aliases = {
      a: { name: "a", query: "foo" },
      b: { name: "b", query: "@u:c or bingus" },
      c: { name: "c", query: "blammo" },
    };
    const result = replaceUse(aliases, input);

    expect(result).toEqual("foo or blammo or bingus");
  })

  it('should handle a nested alias cycle', function() {
    const input = "@u:a or @u:b";
    const aliases = {
      a: { name: "a", query: "foo" },
      b: { name: "b", query: "@u:c or bingus" },
      c: { name: "c", query: "@u:d" },
      d: { name: "d", query: "@u:b" }
    };
    expect(() => {
      replaceUse(aliases, input);
    }).toThrow()

  })
})

describe('parseQuerySet', function() {
  describe('alias/use', function() {
    it('should error for aliases with no name', function() {
      expect(() => {
        parseQuerySet(["@alias:(commander:rb)"], 0)
      }).toThrow()
    })

    it('should error for aliases with a missing (', function() {
      expect(() => {
        parseQuerySet(["@alias:domaincommander:rb)"], 0)
      }).toThrow()
    })

    it('should error for aliases with a missing )', function() {
      expect(() => {
        parseQuerySet(["@alias:domain(commander:rb"], 0)
      }).toThrow()
    })

    it('should error for duplicate aliases', function() {
      expect(() => {
        parseQuerySet([
          "@dm:allsub",
          "",
          "@alias:domain(is:extra)",
          "",
          "@alias:domain(commander:rb)",
          "",
          "o:flying @use:domain kw:trample"
        ], 6)
      }).toThrow()
    })

    it('should error for a use with no matching alias', function() {
      expect(() => {
        parseQuerySet(["@use:fake"], 0)
      }).toThrow()
    })

    it('should run an alias as a standalone query', function() {
      const result = parseQuerySet([
        "@dm:allsub",
        "",
        "@alias:domain(commander:rb)",
      ], 2)

      expect(result.queries).toEqual(["(commander:rb)"])
    })

    it('should substitute an alias when used in a query', function() {
      const result = parseQuerySet([
        "@dm:allsub",
        "",
        "@alias:domain(commander:rb)",
        "",
        "o:flying @use:domain kw:trample"
      ], 4)

      expect(result.queries).toEqual(["o:flying (commander:rb) kw:trample"])
    })
  })

  describe('defaultWeight', function() {
    it('should error when defaultWeight isnt recognized', function() {
      expect(() => {
        parseQuerySet([
          "@dw:zipg"
        ], 0)
      }).toThrow()
    })

    it('should error for duplicate defaultWeights', function() {
      expect(() => {
        parseQuerySet([
          "@defaultWeight:zipf",
          "",
          "@dw:uniform",
          "",
          "who cares?"
        ], 4)
      }).toThrow()
    })

    it('should set the correct weight algorithm for zipf', function() {
      const result = parseQuerySet([
        "@dw:zipf",
        "",
        "o:flying"
      ], 2)

      expect(result.getWeight).toEqual(weightAlgorithms.zipf)
    })

    it('should set the correct weight algorithm for uniform', function() {
      const result = parseQuerySet([
        "@dw:uniform",
        "",
        "o:flying"
      ], 2)

      expect(result.getWeight).toEqual(weightAlgorithms.uniform)
    })
  })

  describe('defaultMode', function() {
    it('should error when defaultMode isnt recognized', function() {
      expect(() => {
        parseQuerySet([
          "@dm:nosub"
        ], 0)
      }).toThrow()
    })

    it('should error for duplicate defaultWeights', function() {
      expect(() => {
        parseQuerySet([
          "@defaultMode:allsub",
          "",
          "@dm:basesub",
          "",
          "who cares?"
        ], 4)
      }).toThrow()
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
      ], 2)

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
      ], 2)

      expect(result.queries).toEqual(["query2"])
      expect(result.injectPrefix("query2")).toEqual("query1 (query2)")
    })
  })

  describe('comments', function() {
    it('should error for a paragraph full of comments', function() {
      expect(() => {
        parseQuerySet([
          "# commnt",
          "# comment",
          "# comment",
        ], 0)
      }).toThrow()
    })
  })
})