
import reducer from './reducer/main';
import { configureStore } from '@reduxjs/toolkit';
import { composeWithDevTools } from '@redux-devtools/extension';
import { applyMiddleware, createStore } from 'redux';
import thunk from './lib/middleware/redux-thunk';
import refreshSf from './lib/middleware/redux-refresh-sf';
import refreshBc from './lib/middleware/redux-refresh-bc';

// composeWithDevTools(applyMiddleware(thunk, refreshSf, refreshBc))

// export const store = configureStore(
//   reducer,
//   composeWithDevTools(applyMiddleware(thunk, refreshSf, refreshBc))
// );

export const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk, refreshSf, refreshBc)));
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch