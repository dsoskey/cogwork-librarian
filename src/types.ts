export const TASK_STATUS = {
    unstarted: 'unstarted',
    loading: 'loading',
    success: 'success',
    error: 'error',
} as const

type ObjectValues<T> = T[keyof T]

export type TaskStatus = ObjectValues<typeof TASK_STATUS>