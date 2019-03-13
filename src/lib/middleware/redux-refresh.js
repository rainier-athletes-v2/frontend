
import superagent from 'superagent';
import * as routes from '../routes';

export default store => next => (action) => {
  const refreshToken = store.getState().refresh;
  switch (action.type) {
    case 'ON_INIT':
    // if refresh token present use it to try and authenticate
      if (refreshToken) {
        return superagent.post(`${API_URL}${routes.OAUTH_ROUTE}`)
          .set('Authorization', 'UNUSED')
          .set('Content-Type', 'application/json')
          .send({ refresh_token: refreshToken })
          .then((response) => {
            store.dispatch({
              type: 'ROLE_SET',
              payload: response.body.raUser,
            });
            next({
              type: 'TOKEN_SET',
              payload: response.body.raToken,
            });
          }) 
          .catch(console.err);
      }
      break;
    default:
      break;
  }
  return next(action);
};
