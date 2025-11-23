import React, { HTMLAttributes } from 'react'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { Setter } from '../../../types'
import _cloneDeep from 'lodash/cloneDeep'
import './multiselect.css'
import { DragHandle } from '../../icons/dragHandle'

export interface MultiselectProps extends HTMLAttributes<HTMLSelectElement> {
  labelComponent: React.ReactNode
  value: string[]
  defaultValue?: string[]
  setValue: Setter<string[]>
  optionTransform?: (s: string) => string
}

export function Multiselect({
  defaultValue,
  optionTransform,
  labelComponent,
  value,
  setValue,
  ...props
}: MultiselectProps) {
  const transform = optionTransform ?? (it => it)
  return <div className='multiselect column'>
    <div>
      <label>
        {labelComponent}
        <select {...props} value={''} onChange={e => {
          const findex = value.findIndex(it => it === e.target.value)
          if (findex === -1) {
            setValue(prev => [...prev, e.target.value])
          } else {
            setValue(prev => [...prev.slice(0, findex), ...prev.slice(findex + 1)])
          }
        }}>
          <option disabled value=''>{value.length ? `${value.length} selected` : ''}</option>
          {props.children}
        </select>
      </label>
      {defaultValue !== undefined && value !== defaultValue &&
        <button onClick={() => setValue(defaultValue)}>reset</button>}
    </div>

    <div className="multiselect-droppable">
      <DndContext onDragEnd={e => {
        const source = e.active.id as number
        const target = e.over.id as number
        setValue(prev => {
          const next = _cloneDeep(prev)
          const toMove = next[source]
          next.splice(source, 1)
          next.splice(target, 0, toMove)
          return next
        })
      }}>
        {value.map((selectedOption, index) =>
          <MulitiselectChip
            key={index} index={index}
            displayValue={transform(selectedOption)}
            onClose={() => {
              setValue(prev => prev.filter(it => it !== selectedOption))
            }} />)}
      </DndContext>
    </div>
  </div>
}

interface MultiselectChipProps {
  index: number
  displayValue: string
  onClose: () => void
}

function MulitiselectChip({ index, displayValue, onClose }: MultiselectChipProps) {

  const droppable = useDroppable({ id: index })
  const dropstyle = {
    backgroundColor: droppable.isOver ? 'var(--active-mid-alpha)' : undefined,
    borderColor: droppable.isOver ? 'var(--light-color)' : undefined,
    cursor: droppable.isOver ? 'grabbing' : 'inherit',
  };

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    activeNodeRect
  } = useDraggable({
    id: index
  })
  const dragstyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 20,
    cursor: isDragging ? 'grabbing' : 'inherit',
  } : undefined;

  return <div className={`chip-container`} style={dropstyle} ref={droppable.setNodeRef}>
    {droppable.isOver && !isDragging && index < droppable.active.id && <div style={{ width: activeNodeRect.width / 2 }}/>}
    <div className='row center slug' ref={setNodeRef} style={dragstyle} {...attributes}>
      <div className='drag-handle button-like' style={{ cursor: isDragging ? 'grabbing' : 'grab'}} ref={setActivatorNodeRef} {...listeners}><DragHandle /></div>
      <button className='bold' onClick={onClose} title={`unselect ${displayValue}`}>X</button>
      {displayValue}
    </div>
    {droppable.isOver && !isDragging && index > droppable.active.id && <div style={{ width: activeNodeRect.width }}/>}
  </div>
}
