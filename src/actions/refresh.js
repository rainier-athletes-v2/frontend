import superagent from 'superagent';
import * as routes from '../lib/routes';
import { setToken } from './auth';

// const setProfile = profile => ({
//   type: 'PROFILE_SET',
//   payload: profile,
// });

export const useRefreshToken = token => (store) => {
  const { refresh } = store.getState();
  console.log('token param', token);
  console.log('refresh st.', refresh);
  return superagent.post(`${API_URL}${routes.OAUTH_ROUTE}/${refresh}`)
    // .set('Authorization', `Bearer ${token}`)
    // .set('Content-Type', 'application/json')
    // .send(profile)
    .then((response) => {
      console.log('response from post:', response.body);
      return store.dispatch(setToken(response.body));
    });
};

export default useRefreshToken;
