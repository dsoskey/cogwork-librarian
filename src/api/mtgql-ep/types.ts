import { RunStrategy } from '../queryRunnerCommon'

export type QueryMode = "all" | "sub" | "solo" | "venn"
export type QueryWeight = "uniform" | "zipf"

export interface Alias {
  name: string
  query: string
}

export interface Venn {
  left: string
  right: string
}

export interface QueryEnvironment {
  defaultDomain?: string
  aliases: { [name: string]: Alias }
  defaultMode: QueryMode
  defaultWeight: QueryWeight
}

export interface ParserError {
  message: string,
  offset: number,
}

export interface ParsedQuerySet {
  strategy: RunStrategy,
  queries: string[]
  injectPrefix: (query: string) => string
  getWeight: (index: number) => number
}

/*
main -> queryset \n\n

queryset -> singleline | multiline

singleline -> alias | defaultmode | defaultweight
multiline -> comment+ (query | venn) \n (query \n | comment)*

alias -> "@a" "lias"? ":" name ( query ) \n
defaultmode -> ("@dm" | "@defaultMode") ":" ("allsub" | "basesub") \n
defaultweight -> ("@dw" | "@defaultWeight") ":" ("uniform" | "zipf") \n

name -> [a-zA-Z_-]+

comment -> "#" .* \n

# each one gets checked for @u
venn -> "@venn(" query ")(" query ")"
query -> !"#" .*

 */