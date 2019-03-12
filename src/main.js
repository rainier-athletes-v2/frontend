import React from 'react';
import { render as renderDOM } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import reducer from './reducer/main';
import App from './components/app/app';

import './style/main.scss';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


import thunk from './lib/middleware/redux-thunk';
import refresh from './lib/middleware/redux-refresh';

const startState = {
  refresh: localStorage.getItem('REFRESH'),
};

const store = createStore(reducer, startState, composeWithDevTools(applyMiddleware(thunk, refresh)));

store.subscribe(() => {
  localStorage.setItem('REFRESH', store.getState().refresh);
});

const root = document.createElement('div');
document.body.appendChild(root);

store.dispatch({ type: 'ON_INIT' });

renderDOM(<Provider store={store}><App /></Provider>, root);
