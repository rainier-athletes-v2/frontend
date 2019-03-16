import { cookieFetch } from '../lib/utils';

const TOKEN_KEY = 'RaBcToken';
const token = cookieFetch(TOKEN_KEY);
const defaultState = token || null;

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case 'TOKEN_SET_BC':
      return payload;
    case 'TOKEN_REMOVE_BC':
      return null;
    default:
      return state;
  }
};
