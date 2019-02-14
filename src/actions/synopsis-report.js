import superagent from 'superagent';
import * as routes from '../lib/routes';

export const setSynopsisReport = sr => ({
  type: 'SYNOPSIS_REPORT_SET',
  payload: sr,
});

export const clearSynopsisReport = () => ({
  type: 'SYNOPSIS_REPORT_CLEAR',
  payload: null,
});

export const fetchSynopsisReport = (srId) => (store) => { // eslint-disable-line
  const { token } = store.getState();
  console.log('fetchSR');
  return superagent.get(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}/${srId}`)
    .set('Authorization', `Bearer ${token}`)
    .send('Content-Type', 'application/json')
    .then((res) => {
      const thisSynopsisReport = res.body;
      return store.dispatch(setSynopsisReport(thisSynopsisReport));
    });
};

export const saveSynopsisReport = (sr) => (store) => { // eslint-disable-line
  const { token } = store.getState();

  return superagent.put(`${API_URL}${routes.SYNOPSIS_REPORT_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .send(sr)
    .then((res) => {
      console.log('saveSR response.status', res.status);
      // return store.dispatch(clearSynopsisReport());
    });
};
