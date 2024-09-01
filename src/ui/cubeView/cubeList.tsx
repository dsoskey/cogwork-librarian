import React, { useContext } from 'react'
import { LoaderText } from '../component/loaders'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { useMemoryQueryRunner } from '../../api/local/useQueryRunner'
import { parseQuerySet } from '../../api/mtgql-ep/parser'
import { RunStrategy } from '../../api/queryRunnerCommon'
import { cogDB as cogDBClient } from '../../api/local/db'
import { SearchOptions } from 'mtgql'
import { CubeFilter } from './cubeFilter'
import { CardResultsLayout } from './cardResults'

const options: SearchOptions = {
    order: 'cmc',
    dir: 'auto',
}
export interface CubeListProps {}

export function CubeList({}: CubeListProps) {
    const { cube, cards, oracleList, loadingError, setActiveCard } = useContext(CubeViewModelContext);
    const queryRunner = useMemoryQueryRunner({ corpus: oracleList });

    const execute = (queries: string[], baseIndex: number) => {
        parseQuerySet(queries, baseIndex)
          .map(({ strategy, queries, getWeight, injectPrefix }) => {
              const executedAt = new Date();
              let promise
              if (strategy === RunStrategy.Venn && queryRunner.generateVenn !== undefined) {
                  const [left, right, ...rest] = queries
                  promise = queryRunner.generateVenn(left, right, rest, options, getWeight)
              } else {
                  promise = queryRunner.run(queries, options, injectPrefix, getWeight)
              }
              promise.then(() =>
                cogDBClient.history.put({
                    rawQueries: queries,
                    baseIndex,
                    source: 'local',
                    strategy,
                    executedAt,
                    projectPath: `/.coglib/cube/${cube.key}`,
                })
              ).catch(error => {
                  console.error(error)
                  cogDBClient.history.put({
                      rawQueries: queries,
                      baseIndex,
                      source: 'local',
                      strategy,
                      errorText: error.toString(),
                      executedAt,
                      projectPath: `/.coglib/cube/${cube.key}`,
                  })
              })
          })
    }
    const applySimpleFilter = (query: string) => {
        execute([`cube=${cube.key} ++ (${query})`], 0);
    }

    return <CardResultsLayout
      cards={() => {
        return queryRunner.status === "success"
          // grossly inefficient
          ? queryRunner.result.map(it => it.data as OrderedCard)
          : cards;
      }}
      filterControl={
        <CubeFilter
          applyFilter={applySimpleFilter}
          clearFilter={queryRunner.reset}
          canClear={queryRunner.status !== "unstarted"}
        />}
      extraControls={<>
        {queryRunner.status === "success" && <div>filter matched {queryRunner.result.length} of {cube.cards.length}</div>}
        {cards.length === 0
          && queryRunner.status !== "error"
          && loadingError === undefined
          && <LoaderText text="Loading cards"/>}
        {loadingError}
      </>}
    />;
}