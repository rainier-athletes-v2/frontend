import superagent from 'superagent';
import * as routes from '../lib/routes';
import * as t from '../lib/types';

export const setBasecampStatus = status => ({
  type: t.BASECAMP_STATUS_SET,
  payload: status,
});

export const clearBasecampStatus = () => ({
  type: t.BASECAMP_STATUS_CLEAR,
  payload: null,
});

export const postSummaryToBasecamp = srSummary => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  store.dispatch(clearBasecampStatus());

  return superagent.post(`${API_URL}${routes.SYNOPSIS_SUMMARY_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .send(srSummary)
    .then((res) => {
      const { status } = res;
      return store.dispatch(setBasecampStatus(status));
    });
};
