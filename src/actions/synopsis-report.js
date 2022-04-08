import superagent from 'superagent';
import * as routes from '../lib/routes';
import { SYNOPSIS_REPORT_SET, SYNOPSIS_REPORT_CLEAR } from '../lib/types';
import { setError, clearError } from './error';

export const setSynopsisReport = sr => ({
  type: SYNOPSIS_REPORT_SET,
  payload: sr,
});

export const clearSynopsisReport = () => ({
  type: SYNOPSIS_REPORT_CLEAR,
  payload: null,
});

export const fetchSynopsisReport = (srId) => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  store.dispatch(clearError());
  store.dispatch(clearSynopsisReport());

  return superagent.get(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}/${srId}`)
    .set('Authorization', `Bearer ${token}`)
    .send('Content-Type', 'application/json')
    .then((res) => {
      const sr = res.body;
      return store.dispatch(setSynopsisReport(sr));
    });
};

export const saveSynopsisReport = (orgSr) => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  store.dispatch(clearError());

  const sr = JSON.parse(JSON.stringify(orgSr)); // create deep copy of SR being saved

  return superagent.put(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .send(sr)
    .then((result) => {
      return store.dispatch(setError(result.status));
    })
    .catch((err) => {
      return store.dispatch(setError(err.status));
    });
};
