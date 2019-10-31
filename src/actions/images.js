import superagent from 'superagent';
import * as routes from '../lib/routes';
import * as t from '../lib/types';
// import { setError, clearError } from './error';

export const setImageSgids = sgids => ({
  type: t.IMAGE_DATA_SET,
  payload: sgids,
});

export const clearImageSgids = () => ({
  type: t.IMAGE_DATA_CLEAR,
  payload: null,
});

export const uploadImages = (files) => (store) => { // eslint-disable-line
  const token = store.getState().basecampToken;

  store.dispatch(setImageSgids('WAITING'));

  files.forEach(file => console.log(`name: ${file.name}, size: ${file.size}, type: ${file.type}`));

  return superagent.post(`${API_URL}${routes.SINGLE_IMAGE_UPLOAD_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .attach('image', files[0])
    .field('name', files[0].name)
    .then((res) => {
      return store.dispatch(setImageSgids(res.body));
    })
    .catch((err) => {
      return store.dispatch(setImageSgids('ERROR'));
    });
};
