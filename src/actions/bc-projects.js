import superagent from 'superagent';
import * as routes from '../lib/routes';
import * as t from '../lib/types';
import { setError, clearError } from './error';

export const clearBcProjects = () => ({
  type: t.CLEAR_BC_PROJECTS,
  payload: null,
});

export const setBcProjects = projects => ({
  type: t.SET_BC_PROJECTS,
  payload: projects,
});

export const fetchBcProjects = () => (store) => { // eslint-disable-line
  const { basecampToken, salesforceToken } = store.getState();

  store.dispatch(clearError());
  store.dispatch(clearBcProjects());

  return superagent.get(`${API_URL}${routes.BC_PROJECTS}`)
    .set('Authorization', `Bearer ${salesforceToken}`)
    .set('Content-Type', 'application/json')
    .query({ basecampToken })
    .then((res) => {
      return store.dispatch(setBcProjects(res.body));
    })
    .catch((err) => {
      return store.dispatch(setError(err.status));
    });
};
