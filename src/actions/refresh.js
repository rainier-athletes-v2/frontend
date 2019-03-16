import superagent from 'superagent';
import * as routes from '../lib/routes';
import { setToken } from './auth';

export const useRefreshToken = token => (store) => {
  const { salesforceRefresh } = store.getState();
  console.log('token param', token);
  console.log('refresh sf', salesforceRefresh);
  return superagent.post(`${API_URL}${routes.OAUTH_ROUTE}`)
    .set('Authorization', 'UNUSED')
    .set('Content-Type', 'application/json')
    .send({ refresh_token: salesforceRefresh })
    .then((response) => {
      console.log('response from post:', response.body);
      return store.dispatch(setToken(response.body));
    });
};

export default useRefreshToken;
