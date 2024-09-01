import React from 'react'

export interface DataProps {
  value: any
  index: number
}
export interface DataTableProps {
  // maybe use a generic?
  data: Object[]; // must have at least one element
  //
  customRenders?: { [key: string]: (dataProps: DataProps) => React.ReactNode }
  ignoreKeys?: Set<string>;
  keyKey: string;
  stickyHeader?:boolean
}

export function DataTable({ data, customRenders, ignoreKeys, keyKey, stickyHeader }: DataTableProps) {
  if (data.length === 0) return <div>no data!</div>
  const headers = Object.keys(data[0]).filter(key => !ignoreKeys.has(key))
  return <table className={`striped${stickyHeader ? " sticky-header":""}`}>
    <thead>
    <tr>
      {headers.map(header => <th key={header}>{header}</th>)}
    </tr>
    </thead>
    <tbody>
    {data.map(datum => <DataTableRow key={data[keyKey]} ignoreKeys={ignoreKeys} datum={datum} customRenders={customRenders} />)}
    </tbody>
  </table>
}

function DataTableRow({ datum, ignoreKeys, customRenders }) {
  if (datum === null || datum === undefined) return null;
  const cols = Object.entries(datum).filter(([k, _]) => !ignoreKeys.has(k))
  return <tr>
    {cols.map(([k, v], index) => <td key={k}>
      <DataTableValue value={v} index={index} customRender={customRenders?.[k]} />
    </td>)}
  </tr>
}

function DataTableValue({ value, index, customRender }) {
  if (value === null || value === undefined) return null;
  if (customRender) return customRender({value , index})

  if (Array.isArray(value)) return value.length

  return value?.toString() ?? '~'
}