import { ObjectValues } from '../types'
import React from 'react'

export const ROUTES = {
  "/data": "/data",
  '/examples': '/examples',
  '/about-me': '/about-me',
  "/user-guide": "/user-guide",
  "/": "/"
} as const
export type CogLibRoute = ObjectValues<typeof ROUTES>

export const subHeader:Record<CogLibRoute, React.ReactNode> = {
  "/data": "database settings",
  "/": "cogwork librarian",
  "/examples": "example queries",
  "/about-me": "what is this thing???",
  "/user-guide": "user guide"
}