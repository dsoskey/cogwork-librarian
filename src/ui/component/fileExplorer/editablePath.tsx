import React, { useEffect, useState } from 'react'

export interface EditablePathProps {
    path: string
    text: string
    isSelected: boolean
    updatePath: (prev: string, next: string) => void
}


interface EditablePath {
    editing: boolean
    editButton: React.ReactNode
    pathEditor: React.ReactNode
}

export function useEditablePath({ path, text, isSelected, updatePath }: EditablePathProps): EditablePath {
    const [editing, setEditing] = useState<boolean>(false);
    const [updatedName, setUpdatedName] = useState<string>(text);
    // yucko
    useEffect(() => {
        if (!isSelected) {
            setEditing(false)
        }
    }, [isSelected])

    const onRename = event => {
        event.stopPropagation();
        const pathParts = path.split("/")
        pathParts[pathParts.length-1] = updatedName;
        const newPath = pathParts.join("/");

        updatePath(path, newPath);
    }

    const editButton = <button
      className="edit"
      title="rename"
      onClick={e => {
          e.stopPropagation()
          setEditing(true);
      }}
    >✒</button>;

    const pathEditor = <>
        <input className='edit'
           value={updatedName}
           onChange={e => setUpdatedName(e.target.value)}
        />
        <button onClick={e => {
            e.stopPropagation()
            setEditing(false)
            setUpdatedName(text)
        }}>cancel</button>
        <button onClick={onRename} disabled={updatedName === text}>
            rename
        </button>
    </>

    return { editing, editButton, pathEditor }
}

