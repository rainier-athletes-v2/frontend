import superagent from 'superagent';
import * as routes from '../lib/routes';
import { MY_PROFILE_SET, MY_STUDENTS_SET } from '../lib/types';

const setMyProfile = profile => ({
  type: MY_PROFILE_SET,
  payload: profile,
});

const setMyStudents = students => ({
  type: MY_STUDENTS_SET,
  payload: students.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  }),
});

export const fetchMyProfileReq = () => (store) => {
  const token = store.getState().salesforceToken;

  return superagent.get(`${API_URL}${routes.MYPROFILE_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .then((res) => {
      return store.dispatch(setMyProfile(res.body));
    });
};

export const fetchMyStudentsReq = studentIds => (store) => { // eslint-disable-line
  const token = store.getState().salesforceToken;

  return superagent.get(`${API_URL}${routes.MYSTUDENTS_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
    .then((res) => {
      const students = res.body;

      return store.dispatch(setMyStudents(students));
    });
};
