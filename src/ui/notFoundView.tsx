import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlagContext } from './flags'
import { Autocomplete } from './component/autocomplete'
import { CARD_INDEX } from '../api/local/cardIndex'

export interface NotFoundViewProps {

}

export function NotFoundView({}: NotFoundViewProps) {
  const { proxyTest } = useContext(FlagContext).flags;

  const [value, setValue] = useState<string>("");

  return <div>
      <h2>Whoa there, buddy!</h2>
      <p>looks like you found yourself in a bit of a situation. Maybe hit the back button or <Link to='/'>go to the search page</Link>?</p>

    <Autocomplete
      value={value}
      setValue={setValue}
      onChange={(e) => setValue(e.target.value)}
      getCompletions={CARD_INDEX.handleAutocomplete}
    />

      {proxyTest && <ProxyTest />}
    </div>;
}

function ProxyTest() {
  const [result, setResult] = useState<any>()
  const [port, setPort] = useState<number>(6969);

  const runTest = () => {
    setResult(undefined);
    (async () => {
      try {
        const nextResult = await fetch(`http://localhost:${port}/ping`);
        const text = await nextResult.text();
        setResult(text)
      } catch (e) {
        console.error(e);
        setResult(e);
      }
    })()
  }

  return <div>
    <h3>port check!</h3>
    <input type='number' value={port} onChange={e => setPort(parseInt(e.target.value))} />
    <button onClick={runTest}>test</button>
    {result && <pre><code>{result.toString()}</code></pre>}
  </div>
}