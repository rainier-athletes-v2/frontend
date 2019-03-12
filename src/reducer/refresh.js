import { cookieFetch } from '../lib/utils';

const TOKEN_KEY = 'RaRefresh';
const token = cookieFetch(TOKEN_KEY);
const defaultState = token || null;

export default (state = defaultState, { type, payload }) => {
  switch (type) {
    case 'REFRESH_TOKEN_SET':
      console.log('refresh reducer type', type, 'payload', payload);
      return payload;
    case 'REFRESH_TOKEN_REMOVE':
      return null;
    default:
      console.log('refresh reducer setting default state');
      return state;
  }
};
