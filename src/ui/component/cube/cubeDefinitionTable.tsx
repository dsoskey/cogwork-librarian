import React, { useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Cube } from 'mtgql'
import './cubeDefinitionTable.css'
import { PageControl } from '../../cardBrowser/pageControl'
import { BulkCubeImporterContext } from '../../../api/cubecobra/useBulkCubeImporter'
import { Modal } from '../modal'
import { BulkImportMessage } from '../../data/bulkCubeSiteImporter'
import { cogDB } from '../../../api/local/db'
import { Link } from 'react-router-dom'
import { SourceIcon } from './sourceIcon'
import { RefreshButton } from './refreshButton'

interface CubeRowProps {
  cube: Cube
  checked: boolean
  onChecked: (checked: boolean) => void
}

const userUrlPrefix = {
  cubecobra: "https://cubecobra.com/user/view/",
  cubeartisan: "https://cubeartisan.net/user/",
}

const CubeRow = ({ cube, checked, onChecked }: CubeRowProps) => {
  const { key, created_by, source, last_updated } = cube
  return <tr>
    <td>
      {/* what's the accessibility story here? */}
      <input
        className="custom"
        type="checkbox"
        checked={checked}
        onChange={() => onChecked(!checked)}
      />
    </td>
    <td>
      <Link to={`/data/cube/${key}`}>{key}</Link>
    </td>
    <td>
      {created_by?.length > 0 && cube.source !== "list" && <a
        href={`${userUrlPrefix[cube.source]}${cube.created_by}`}
        target="_blank"
        rel="noopener noreferrer"
      >{created_by}</a>}
      {created_by?.length > 0 && cube.source === "list" && created_by}
      {(created_by === undefined || created_by?.length === 0) && "~"}
    </td>
    <td>
      {source !== "list" &&
        <a href={`https://cubecobra.com/cube/overview/${key}`}
           rel='noreferrer'
           target='_blank'>
          <SourceIcon source={source??"list"} />
        </a>
      }
      {source === "list" && <SourceIcon source={source??"list"} />}
    </td>
    <td>{last_updated?.toLocaleString() ?? "~"}</td>
  </tr>
}

interface CubeTableProps {
  cubes?: Cube[]
}
export const CubeTable = ({ cubes }: CubeTableProps) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const checkRef = useRef<HTMLInputElement>()
  const { isRunning } = useContext(BulkCubeImporterContext);

  const toSubmit = cubes
    ?.filter(it => checkedIds.has(it.key) && it.source !== "list") ?? [];

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>("");
  const [deleting, setDeleting] = useState<boolean>(false);

  const onDeleteClick = () => {
    setDeleting(true);
    cogDB.cube.bulkDelete(Array.from(checkedIds)).then(() => {
      setShowDeleteModal(false);
      setCheckedIds(new Set());
    })
      .catch(console.error)
      .finally(() => setDeleting(false));
  }
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
  const [filteredCubes, setFilteredCubes] = useState<Cube[] | undefined>(undefined)

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
      <div className='table-controls center'>
        <div className='filter'>
          <input
            disabled={cubes === undefined}
            placeholder="filter cube ids"
            value={filterString}
            onChange={event => setFilterString(event.target.value)}
          />
        </div>
        <div className='select-actions center'>
          <PageControl
            page={page} setPage={setPage}
            upperBound={upperBound} pageSize={pageSize}
            cardCount={cubes?.length}
          />
          {checkedIds.size > 0 && <>
            <button onClick={() => setShowDeleteModal(true)} disabled={isRunning}>
              delete
            </button>
            <RefreshButton toSubmit={toSubmit} />
            <div className='message'>{checkedIds.size}{" cube"}{checkedIds.size > 1 && "s"}{" selected  "}</div>
          </>}
        </div>
      </div>
      <BulkImportMessage/>
      <table>
        <thead>
          <tr>
            <th>
              <input
                className="custom"
                ref={checkRef}
                type="checkbox"
                checked={checkedIds.size === cubes?.length}
                onChange={() => {
                  if (checkedIds.size === cubes?.length) {
                    setCheckedIds(new Set())
                  } else {
                    setCheckedIds(new Set(cubes.map(it => it.key)))
                  }
                }}
              />
            </th>
            <th>cube id</th>
            <th>curator</th>
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
          {cubes !== undefined && currentCubes.map(cube => <CubeRow
            key={cube.key}
            cube={cube}
            checked={checkedIds.has(cube.key)}
            onChecked={checked => setCheckedId(cube.key, checked)}
          />)}
        </tbody>
      </table>
      <Modal
        open={showDeleteModal}
        title={<h2>Confirm Delete</h2>}
        onClose={() => setShowDeleteModal(false)}>
        <div>
          <p>{"you are about to delete "}
            {checkedIds.size}
            {" cube"}{checkedIds.size > 1 && "s"}{": "}
            {Array.from(checkedIds).join(", ")}
            {". Type and press 'delete' to proceed."}
          </p>
          <div className="row">
            <input
              placeholder="delete"
              value={confirmText}
              onChange={event => setConfirmText(event.target.value)}
            />
            <button
              disabled={confirmText !== "delete" || deleting}
              onClick={onDeleteClick}>
              {deleting ? "deleting" : "delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
}