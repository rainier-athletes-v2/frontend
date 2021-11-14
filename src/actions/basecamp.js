import superagent from 'superagent';
import * as routes from '../lib/routes';
import { setError, clearError } from './error';

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
};
