import superagent from 'superagent';
import * as routes from '../lib/routes';
// import * as t from '../lib/types';
import { setError, clearError } from './error';

// export const setBasecampStatus = status => ({
//   type: t.BASECAMP_STATUS_SET,
//   payload: status,
// });

// export const clearBasecampStatus = () => ({
//   type: t.BASECAMP_STATUS_CLEAR,
//   payload: null,
// });

export const postSummaryToBasecamp = (srSummary) => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  store.dispatch(clearError());

  return superagent.post(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send(srSummary)
    .then((res) => {
      return store.dispatch(setError(res.status));
    });
  // .catch((res) => {
  //   return store.dispatch(setError(res.status));
  // })
};
