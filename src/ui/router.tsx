import { ObjectValues } from '../types'
import React from 'react'

export const ROUTES = {
  "/data": "/data",
  "/": "/"
} as const
export type CogLibRoute = ObjectValues<typeof ROUTES>

export const subHeader:Record<CogLibRoute, React.ReactNode> = {
  "/data": "database settings",
  "/": "cogwork librarian",
}