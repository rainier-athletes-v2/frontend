import { cookieFetch } from '../lib/utils';
import { BC_ACCESS, TOKEN_SET_BC, TOKEN_REMOVE_BC } from '../lib/types';

const TOKEN_KEY = BC_ACCESS;
const token = cookieFetch(TOKEN_KEY);
const defaultState = token || null;

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case TOKEN_SET_BC:
      return payload;
    case TOKEN_REMOVE_BC:
      return null;
    default:
      return state;
  }
};
