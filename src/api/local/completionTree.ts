export class CompletionTree {
  public tree = {};
  constructor(values: string[] = []) {
    for (const value of values) {
      this._addValueToTree(value);
    }
  }

  addToTree(...values: string[]) {
    for (const value of values) {
      this._addValueToTree(value);
    }
  }

  _addValueToTree(value: string) {
    let currentNode = this.tree;
    for (let i = 0; i < value.length; i++) {
      const char = value[i].toLowerCase();
      if (!(char in currentNode)) {
        currentNode[char] = {}
      }
      currentNode = currentNode[char];
    }
    currentNode["_match"] = value;
  }

  public async getCompletions(input: string, maxCount: number = 25): Promise<string[]> {
    return CompletionTree.getCompletions(this.tree, input, maxCount);
  }

  public static async getCompletions(tree: Object, input: string, maxCount: number = 25): Promise<string[]> {
    let currentNode = tree;
    for (let i = 0; i < input.length; i++) {
      const char = input[i].toLowerCase();
      if (char in currentNode) {
        currentNode = currentNode[char];
      } else {
        return [];
      }
    }

    return CompletionTree.gatherCompletions(currentNode, input).slice(0, maxCount);
  }

  public static gatherCompletions(currentNode: Object, currentString: string): string[] {
    const results = []
    for (const key in currentNode) {
      if (key === "_match") {
        results.push(currentNode[key]);
      } else {
        //  add completions of next layer
        results.push(...CompletionTree.gatherCompletions(currentNode[key], `${currentString}${key}`))
      }
    }
    return results;
  }
}



