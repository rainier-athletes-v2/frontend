import { cookieFetch } from '../lib/utils';

const TOKEN_KEY = 'RaSfToken';
const token = cookieFetch(TOKEN_KEY);
const defaultState = token || null;

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case 'TOKEN_SET_SF':
      return payload;
    case 'TOKEN_REMOVE_SF':
      return null;
    default:
      return state;
  }
};
