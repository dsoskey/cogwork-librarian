import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import { AuthLayer } from './auth';
// import './styles.css';

render(
  <BrowserRouter>
    <div>Hello Cogwork Librarian!</div>
  </BrowserRouter>,
  document.getElementById('app')
);
