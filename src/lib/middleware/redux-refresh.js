// thanks to https://michaelwashburnjr.com/best-way-to-store-tokens-redux/ for
// inspiration.
import superagent from 'superagent';
import * as routes from '../routes';

export default store => next => (action) => {
  console.log('refresh mw action.type', action.type);
  const refreshToken = store.getState().refresh;
  switch (action.type) {
    case 'ON_INIT':
    // if refresh token present use it to try and authenticate
      if (refreshToken) {
        return superagent.post(`${API_URL}${routes.OAUTH_ROUTE}`)
          .send(refreshToken)
          .then((response) => {
            console.log('response from post:', response.body);
            next({
              type: 'SET_AUTH_TOKEN',
              payload: response.body,
            });
          }); 
      }
      break;
    case 'RECEIVE_REFRESH':
      localStorage.setItem('REFRESH', action.token);
      break;
    default:
      break;
  }
  return next(action);
};
