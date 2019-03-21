
import { cookieDelete } from '../lib/utils';
import * as t from '../lib/types';

export const setToken = token => ({
  type: t.TOKEN_SET_SF,
  payload: token,
});

export const removeToken = () => ({
  type: t.TOKEN_REMOVE_SF,
});

export const setBcToken = token => ({
  type: t.TOKEN_SET_BC,
  payload: token,
});

export const removeBcToken = () => ({
  type: t.TOKEN_REMOVE_BC,
});

export const setRole = role => ({
  type: t.ROLE_SET,
  payload: role,
});

export const removeRole = () => ({
  type: t.ROLE_REMOVE,
});

export const logout = () => (store) => {
  cookieDelete(t.SF_ACCESS);
  cookieDelete(t.SF_REFRESH);
  cookieDelete(t.BC_ACCESS);
  cookieDelete(t.BC_REFRESH);
  cookieDelete(t.RA_USER);
  store.dispatch({
    type: t.REFRESH_TOKEN_REMOVE_SF,
  });
  store.dispatch({
    type: t.REFRESH_TOKEN_REMOVE_BC,
  });
  store.dispatch(removeToken());
  return store.dispatch(removeBcToken());
};
