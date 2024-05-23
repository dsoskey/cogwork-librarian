import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlagContext } from './flags'

export interface NotFoundViewProps {

}

export function NotFoundView({}: NotFoundViewProps) {
  const { proxyTest } = useContext(FlagContext).flags;

  return <div>
      <h2>Whoa there, buddy!</h2>
      <p>looks like you found yourself in a bit of a situation. Maybe hit the back button or <Link to='/'>go to the search page</Link>?</p>

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