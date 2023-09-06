import React from 'react'
import { CubeDefinition } from '../../api/memory/types/cube'

interface CubeDefinitionRowProps {
  cube: CubeDefinition
}

const CubeDefinitionRow = ({ cube }: CubeDefinitionRowProps) => {
  const { key, source, last_updated } = cube
  return <tr>
    <td>
      {source === "cubecobra" &&
        <a href={`https://cubecobra.com/cube/overview/${key}`}
           rel='noreferrer'
           target='_blank'>{key}</a>
      }
      {source !== "cubecobra" && key}
    </td>
    <td>{source ?? "list"}</td>
    <td>{last_updated?.toISOString() ?? "~"}</td>
  </tr>
}

interface CubeDefinitionTableProps {
  cubes?: CubeDefinition[]
}
export const CubeDefinitionTable = ({ cubes }: CubeDefinitionTableProps) => {

  return <div>
    <strong>saved cube ids:</strong>
    {cubes === undefined && <span>{" "}loading cubes...</span>}
    {cubes?.length === 0 && <span>{" "}no cubes saved!</span>}
    {cubes?.length > 0 && <table>
      <thead>
        <tr>
          <th>cube id</th>
          <th>source</th>
          <th>last updated</th></tr>
      </thead>
      <tbody>
        {cubes.map(cube => <CubeDefinitionRow key={cube.key} cube={cube} />)}
      </tbody>
    </table>}
  </div>
}