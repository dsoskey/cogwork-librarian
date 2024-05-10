import React from 'react'
import { Link } from 'react-router-dom'

export interface NotFoundViewProps {

}

export function NotFoundView({}: NotFoundViewProps) {
    return <div>
      <h1>Whoa there, buddy!</h1>
      <p>looks like you found yourself in a bit of a situation. Maybe hit the back button or <Link to='/'>go to the search page</Link>?</p>
    </div>;
}

