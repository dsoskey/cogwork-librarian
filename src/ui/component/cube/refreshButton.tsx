import React, { useContext } from 'react'
import { BulkCubeImporterContext } from '../../../api/cubecobra/useBulkCubeImporter'
import { groupBy } from 'lodash'
import { Cube } from 'mtgql'

export interface RefreshButtonProps {
  toSubmit: Cube[]
}
export function RefreshButton({ toSubmit }: RefreshButtonProps) {
  const { isRunning, attemptRefresh } = useContext(BulkCubeImporterContext);
  const importCheckedCubeIds = () => {
    if (toSubmit.length === 0) {
      console.warn("no selected cubes are from refreshable sources. ignoring");
      return;
    }

    const bySource = groupBy(toSubmit, "source")
    attemptRefresh(bySource);
  }

  return <button onClick={importCheckedCubeIds} disabled={isRunning} title="refresh from source">
    {"🔄"}
  </button>
}