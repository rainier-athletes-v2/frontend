
import { cookieDelete } from '../lib/utils';

export const setToken = token => ({
  type: 'TOKEN_SET_SF',
  payload: token,
});

export const removeToken = () => ({
  type: 'TOKEN_REMOVE_SF',
});

export const setBcToken = token => ({
  type: 'TOKEN_SET_BC',
  payload: token,
});

export const removeBcToken = () => ({
  type: 'TOKEN_REMOVE_BC',
});

export const logout = () => (store) => {
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
  store.dispatch(removeToken());
  return store.dispatch(removeBcToken());
};
