// import superagent from 'superagent';
// import * as routes from '../lib/routes';
import { cookieDelete } from '../lib/utils';

export const setToken = token => ({
  type: 'TOKEN_SET_SF',
  payload: token,
});

export const removeToken = () => ({
  type: 'TOKEN_REMOVE_SF',
});

// export const userSignup = user => (store) => {
//   return superagent.post(`${API_URL}${routes.SIGNUP_ROUTE}`)
//     .send(user)
//     .withCredentials()
//     .then((response) => {
//       debugger;
//       return store.dispatch(setToken(response.body.token));
//     });
// };

// export const userLogin = user => (store) => {
//   return superagent.get(`${API_URL}${routes.LOGIN_ROUTE}`)
//     .auth(user.username, user.password)
//     .withCredentials()
//     .then((response) => {
//       debugger;
//       return store.dispatch(setToken(response.body.token));
//     });
// };

export const logout = () => (store) => {
  // localStorage.removeItem('REFRESH');
  cookieDelete('RaSfToken');
  cookieDelete('RaUser');
  cookieDelete('RaSfRefresh');
  cookieDelete('RaBcToken');
  cookieDelete('RaBcRefresh');
  store.dispatch({
    type: 'REFRESH_TOKEN_REMOVE_SF',
  });
  store.dispatch({
    type: 'REFRESH_TOKEN_REMOVE_BC',
  });
  return store.dispatch(removeToken());
};
