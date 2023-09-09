import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CubeDefinition } from '../../api/memory/types/cube'
import "./cubeDefinitionTable.css"
import { PageControl } from '../cardBrowser/pageControl'

interface CubeDefinitionRowProps {
  cube: CubeDefinition
  checked: boolean
  onChecked: (checked: boolean) => void
}

const CubeDefinitionRow = ({ cube, checked, onChecked }: CubeDefinitionRowProps) => {
  const { key, source, last_updated } = cube
  return <tr>
    {/*<td>*/}
    {/*  /!* what's the accessibility story here? *!/*/}
    {/*  <input*/}
    {/*    type="checkbox"*/}
    {/*    checked={checked}*/}
    {/*    onChange={() => onChecked(!checked)}*/}
    {/*  />*/}
    {/*</td>*/}
    <td>
      {source === "cubecobra" &&
        <a href={`https://cubecobra.com/cube/overview/${key}`}
           rel='noreferrer'
           target='_blank'>{key}</a>
      }
      {source !== "cubecobra" && key}
    </td>
    <td>{source ?? "list"}</td>
    <td>{last_updated?.toLocaleString() ?? "~"}</td>
  </tr>
}

interface CubeDefinitionTableProps {
  cubes?: CubeDefinition[]
}
export const CubeDefinitionTable = ({ cubes }: CubeDefinitionTableProps) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const checkRef = useRef<HTMLInputElement>()
  const setCheckedId = (cubeId: string, checked: boolean) => {
    setCheckedIds(prev => {
      if (checked) {
        prev.add(cubeId)
      } else {
        prev.delete(cubeId)
      }
      return new Set(prev)
    })
  }
  useLayoutEffect(() => {
    if(checkRef.current) {
      checkRef.current.indeterminate =
        checkedIds.size > 0 && checkedIds.size < cubes?.length;
    }
  }, [checkedIds])

  const pageSize = 20
  const [page, setPage] = useState<number>(0)
  const [filterString, _setFilterString] = useState<string>("")
  const [filteredCubes, setFilteredCubes] = useState<CubeDefinition[] | undefined>(undefined)

  const timeout = useRef<number>()
  const setFilterString = (value: string) => {
    _setFilterString(value)

    clearTimeout(timeout.current)
    timeout.current = setTimeout(() => {
      if (value.length > 0) {

        setFilteredCubes(cubes?.filter(it => it.key.toLowerCase().includes(value.trim().toLowerCase())) ?? [])
      } else {
        setFilteredCubes(undefined)
      }
    }, 250)
  }
  const lowerBound = page * pageSize
  const upperBound = (page + 1) * pageSize

  const currentCubes = useMemo(
    () => {
      const listToUse = filteredCubes !== undefined ? filteredCubes : cubes
      return listToUse?.slice(lowerBound, upperBound)
    },
    [cubes, filteredCubes, lowerBound, upperBound]
  )

  return <div className='cube-definitions'>
    <div>
      <div className='table-controls'>
        <div className='filter'>
          <input
            disabled={cubes === undefined}
            placeholder="filter cube ids"
            value={filterString}
            onChange={event => setFilterString(event.target.value)}
          />
        </div>
        <PageControl
          page={page} setPage={setPage}
          upperBound={upperBound} pageSize={pageSize}
          cardCount={cubes?.length}
        />
      </div>
      <table>
        <thead>
          <tr>
            {/*<th>*/}
            {/*  <input*/}
            {/*    ref={checkRef}*/}
            {/*    type="checkbox"*/}
            {/*    checked={checkedIds.size === cubes?.length}*/}
            {/*    onChange={() => {*/}
            {/*      if (checkedIds.size > 0) {*/}
            {/*        setCheckedIds(new Set())*/}
            {/*      } else {*/}
            {/*        setCheckedIds(new Set(cubes.map(it => it.key)))*/}
            {/*      }*/}
            {/*    }}*/}
            {/*  />*/}
            {/*</th>*/}
            <th>cube id</th>
            <th>source</th>
            <th>last updated</th>
          </tr>
        </thead>
        <tbody>
          {cubes === undefined && <tr><td className='notfound' colSpan={4}>loading cubes...</td></tr>}
          {cubes !== undefined && currentCubes.length === 0 && <tr><td className='notfound' colSpan={4}>
            {filteredCubes !== undefined && filterString.length > 0 && `no cubes found for filter "${filterString}"`}
            {filteredCubes === undefined && "no cubes found in database. import some below!"}
          </td></tr>}
          {cubes !== undefined && currentCubes.map(cube => <CubeDefinitionRow
            key={cube.key}
            cube={cube}
            checked={checkedIds.has(cube.key)}
            onChecked={checked => setCheckedId(cube.key, checked)}
          />)}
        </tbody>
      </table>
    </div>
  </div>
}