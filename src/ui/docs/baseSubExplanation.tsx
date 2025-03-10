import { singleQueryInfo } from '../component/editor/singleQueryActionBar'
import { rankInfo } from '../component/editor/infoLines'
import { injectPrefix as _injectPrefix, SCORE_PRECISION, weightAlgorithms } from '../../api/queryRunnerCommon'
import React from 'react'
import { QueryExample } from '../../api/example'

export const BaseSubExplanation = ({ example }: { example: QueryExample }) => {

  const injectPrefix = _injectPrefix(example.queries[0])
  const subqueries = example.queries.slice(1)
  return <>
    <h3 id="basesub-query-model">
      <a href="#basesub-query-model">#</a>
      {" "}
      How does the base/sub query model work?
    </h3>
    <p>
      The base/sub query model helps you curate complex searches with
      minimal syntax. it uses a custom 3-step algorithm on top of Scryfall's
      filter syntax:
    </p>
    <ol>
      <li>Combine the base query with each subquery</li>
      <li>
        Weigh each combined query, assigning that weight to each card in the query
      </li>
      <li>Aggregate cards by total query weight</li>
    </ol>

    <h4>1. Combine the base query with each subquery</h4>
    <p>Starting from an input like this:</p>
    <div className='example-query'>
      <pre className='language-none labels'>
        <code>
          {singleQueryInfo(rankInfo)(example.queries).join('\n')}
        </code>
      </pre>
      <pre className='language-scryfall-extended'>
          <code>{example.queries.join('\n')}</code>
        </pre>
    </div>

    <p>Cogwork Librarian transforms the queries into this:</p>
    <pre className='language-scryfall'>
        <code>{subqueries.map(injectPrefix).join('\n')}</code>
      </pre>
    <p>
      This lets you treat the first query as the total set of cards you want
      to see in each subquery.
    </p>

    <h4>
      2. Weigh each query, assigning that weight to each card in the query
    </h4>
    <p>
      Once prepared, each query is weighed by its order in the list of
      queries (first being highest)
    </p>
    <div className='example-query'>
      <pre className='language-none labels'>
        <code>
          {subqueries.map((_, index) =>
            `[${weightAlgorithms
              .zipf(index)
              .toFixed(SCORE_PRECISION)}]`).join('\n')}
        </code>
      </pre>
      <pre className='language-scryfall'>
        <code>
          {subqueries
            .map(injectPrefix)
            .join('\n')}
        </code>
      </pre>
    </div>

    <h4>3. Aggregate cards by total query weight</h4>
    <p>
      Cards in multiple queries get their combined weight, so their final
      placement rises above cards that matched fewer or lower placed queries
      (tip: use Scryfall's <code>or</code> syntax to give two queries the
      same weight)
    </p>
  </>
}