import superagent from 'superagent';
import * as routes from '../lib/routes';
import * as t from '../lib/types';
import { setError, clearError } from './error';

export const setBcProjects = payload => ({
  type: t.SET_BC_PROJECTS,
  payload,
});

export const setMsgBoardUrl = url => ({
  type: t.SET_MSG_BOARD_URL,
  payload: url,
});

export const clearMsgBoardUrl = () => ({
  type: t.CLEAR_MSG_BOARD_URL,
  payload: null,
});

export const setProjectIdx = idx => ({
  type: t.SET_PROJECT_IDX,
  payload: idx,
});

export const fetchBcProjects = () => (store) => { // eslint-disable-line
  const { basecampToken, salesforceToken } = store.getState();

  store.dispatch(clearError());
  store.dispatch(setBcProjects({ projects: null, loadState: 'LOADING', idx: undefined }));

  return superagent.get(`${API_URL}${routes.BC_PROJECTS}`)
    .set('Authorization', `Bearer ${salesforceToken}`)
    .set('Content-Type', 'application/json')
    .query({ basecampToken })
    .then((res) => {
      if (res.body.projects.length === 0) {
        store.dispatch(setError(403));
      }
      return store.dispatch(setBcProjects({ projects: res.body.projects, loadState: 'SUCCESS', idx: 0 }));
    })
    .catch((err) => {
      store.dispatch(setBcProjects({ projects: null, loadState: 'ERROR', idx: undefined }));
      return store.dispatch(setError(err.status));
    });
};

export const scanProjectForStudent = studentEmail => (store) => {
  const { basecampToken, salesforceToken, bcProjects } = store.getState();
  const { idx, projects } = bcProjects;
  const project = projects[idx];

  store.dispatch(setBcProjects({ ...bcProjects, loadState: 'SCANNING' }));
  return superagent.get(`${API_URL}${routes.BC_PROJECT_SCAN}`)
    .set('Authorization', `Bearer ${salesforceToken}`)
    .set('Content-Type', 'application/json')
    .query({ studentEmail, project: btoa(JSON.stringify(project)), basecampToken })
    .then((res) => {
      const { messageBoardUrl } = res.body;
      if (!messageBoardUrl) {
        const nextIdx = idx + 1;
        if (nextIdx >= projects.length) {
          store.dispatch(setBcProjects({ ...bcProjects, loadState: 'ERROR', idx: undefined }));
          return store.dispatch(setError(404));
        }
        store.dispatch(setBcProjects({ ...bcProjects, idx: nextIdx }));
        return store.dispatch(scanProjectForStudent(studentEmail));
      }
      store.dispatch(setBcProjects({ ...bcProjects, loadState: 'SUCCESS' }));
      return store.dispatch(setMsgBoardUrl(messageBoardUrl));
    })
    .catch((err) => {
      store.dispatch(setBcProjects({ ...bcProjects, loadState: 'ERROR', idx: undefined }));
      return store.dispatch(setError(err.status));
    });
};
