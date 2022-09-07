import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from '@redux-devtools/extension';

import reducer from './reducer/main';
import App from './components/app/app';

import './style/main.scss';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// import { store } from './store';

import thunk from './lib/middleware/redux-thunk';
import refreshSf from './lib/middleware/redux-refresh-sf';
import refreshBc from './lib/middleware/redux-refresh-bc';

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk, refreshSf, refreshBc)));

store.subscribe(() => {
  localStorage.setItem('SF_REFRESH', store.getState().salesforceRefresh);
  localStorage.setItem('BC_REFRESH', store.getState().basecampRefresh);
});

const container = document.createElement('div');
const rootContainer = document.body.appendChild(container);
// const root = createRoot(rootContainer);

store.dispatch({ type: 'ON_INIT_SF' }); // attemp use of refresh tokens
store.dispatch({ type: 'ON_INIT_BC' });

// root.render(<Provider store={store}><App /></Provider>);

const root = createRoot(rootContainer);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
