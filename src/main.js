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
import refreshSf from './lib/middleware/redux-refresh-sf';
import refreshBc from './lib/middleware/redux-refresh-bc';

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk, refreshSf, refreshBc)));

store.subscribe(() => {
  localStorage.setItem('SF_REFRESH', store.getState().salesforceRefresh);
  localStorage.setItem('BC_REFRESH', store.getState().basecampRefresh);
});

const root = document.createElement('div');
document.body.appendChild(root);

store.dispatch({ type: 'ON_INIT_SF' }); // attemp use of refresh tokens
store.dispatch({ type: 'ON_INIT_BC' });

renderDOM(<Provider store={store}><App /></Provider>, root);
