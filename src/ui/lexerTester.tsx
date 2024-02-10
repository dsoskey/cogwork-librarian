import React, { useState } from 'react'
import { useHighlightPrism } from '../api/local/syntaxHighlighting'
import { MQL_LEXER } from '../mql'
import { useLocalStorage } from '../api/local/useLocalStorage'

export const LexerTester = () => {
  const [text, setText] = useLocalStorage<string>("lexer-test-value", "")
  const [tokens, setTokens] = useState<any[]>([])
  const [error, setError] = useState<Error | undefined>()

  useHighlightPrism([text]);

  const runLexer = () => {
    const toSubmit = text.trim()
    if (toSubmit.length === 0) {
      // display error?
      return
    }

    const newTokens = []
    try {
      MQL_LEXER.reset(text)
      let nextToken = MQL_LEXER.next()
      while (nextToken !== undefined) {
        newTokens.push(nextToken)
        nextToken = MQL_LEXER.next();
      }
    } catch (e) {
      setError(e)
    } finally {
      setTokens(newTokens)
    }

  }

  return <div>

    <label>
      <div>query</div>
      <input value={text} onChange={(event) => setText(event.target.value)} />
    </label>

    <button onClick={runLexer}>run lexer</button>

    {tokens.length > 0 && <ol>
      {tokens.map((it, index) => <li key={index}>{JSON.stringify(it)}</li>)}
    </ol>}

    {error && <pre>{error.toString()}</pre>}
  </div>
}