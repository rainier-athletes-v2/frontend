import { setError, clearError } from './error';
import {
  setBcProjects, clearMsgBoardUrl, setMsgBoardUrl, scanProjectForStudent,
} from './bc-projects';

export const getMsgBoardUrl = studentEmail => (store) => { // eslint-disable-line
  const { bcProjects } = store.getState();

  store.dispatch(clearError());
  store.dispatch(clearMsgBoardUrl());
  store.dispatch(setBcProjects({ ...bcProjects, idx: 0 }));

  if (bcProjects.projects.length === 0 && bcProjects.loadState === 'SUCCESS') {
    store.dispatch(setMsgBoardUrl(null));
    return store.dispatch(setError(404));
  }

  return store.dispatch(scanProjectForStudent(studentEmail));
};
