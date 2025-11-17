import React, { HTMLAttributes } from 'react'
import { Setter } from '../../../types'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import _cloneDeep from 'lodash/cloneDeep'
import "./multiselect.css"
import { DragHandle } from '../../icons/dragHandle'
export interface MultiselectProps extends HTMLAttributes<HTMLSelectElement> {
  labelComponent: React.ReactNode
  value: string[]
  defaultValue?: string[]
  setValue: Setter<string[]>
  optionTransform?: (s: string) => string
}

export function Multiselect({ defaultValue, optionTransform, labelComponent, value, setValue, ...props }: MultiselectProps) {
  const transform = optionTransform ?? (it => it);
  return <div className="multiselect column">
    <div>
      <label>
        {labelComponent}
        <select {...props} value={""} onChange={e => {
          const findex = value.findIndex(it => it === e.target.value)
          if (findex === -1) {
            setValue(prev => [...prev, e.target.value])
          } else {
            setValue(prev => [...prev.slice(0, findex), ...prev.slice(findex+1)])
          }
        }}>
          <option disabled value="">{value.length ? `${value.length} selected` : ""}</option>
          {props.children}
        </select>
      </label>
      {defaultValue !== undefined && value !== defaultValue && <button onClick={()=> setValue(defaultValue)}>reset</button>}
    </div>

    <DragDropContext onDragEnd={e => {
      if (e.source && e.destination) {
        const source = e.source.index;
        const destination = e.destination.index;
        setValue(prev => {
          const next = _cloneDeep(prev)
          const toMove = next[source];
          next.splice(source, 1);
          next.splice(destination, 0, toMove)
          return next;
        })
      }
    }}>
      <Droppable droppableId="j" direction='horizontal'>
        {(provided, _) => <div ref={provided.innerRef} className="row multiselect-droppable">
          {value.map((selectedOption, index) => {
              const onClose = () => {
                setValue(prev => prev.filter(it => it !== selectedOption))
              }
              const displayValue = transform(selectedOption)
              return <Draggable key={selectedOption} draggableId={selectedOption} index={index}>
                {(provided, _) => (
                  <div className="row center slug" ref={provided.innerRef} {...provided.draggableProps}>
                    <div className="drag-handle button-like" {...provided.dragHandleProps} ><DragHandle /></div>
                    <button className="bold" onClick={onClose} title={`unselect ${displayValue}`}>X</button> {displayValue}
                  </div>
                )}
              </Draggable>
            })}
          {provided.placeholder}
        </div>}
      </Droppable>
    </DragDropContext>

  </div>;
}

