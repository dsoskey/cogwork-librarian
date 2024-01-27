import { buildTree } from './fileExplorer'

describe('buildTree', function() {
  it('should build a file tree out of a list of dir paths and project paths', () => {
    const dirs = [
      "/foo/bar",
      "/foo/tmp/shimp",
      "/foo",
    ]
    const projs = [
      "/foo/bar/proj",
      "/foo/tmp/shimp/proj",
      "/foo/tmp/shimp/proj2",
      "/foo/proj",
      "/foo/proj2",
    ]

    const expected = {
      "": {
        ".path": "",
        "foo": {
          ".path": "/foo",
          "bar": {
            ".path": "/foo/bar",
            "proj": "/foo/bar/proj"
          },
          "tmp": {
            ".path": "/foo/tmp",
            "shimp": {
              ".path": "/foo/tmp/shimp",
              "proj": "/foo/tmp/shimp/proj",
              "proj2": "/foo/tmp/shimp/proj2"
            }
          },
          "proj": "/foo/proj",
          "proj2": "/foo/proj2"
        }
      }
    }

    const result = buildTree(dirs, projs);

    expect(result).toEqual(expected)
  })
})