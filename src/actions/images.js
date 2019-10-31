import superagent from 'superagent';
import * as routes from '../lib/routes';
import * as t from '../lib/types';
import * as errorActions from './error';
import * as imagePreview from './image-previews';

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
  // store.dispatch(errorActions.clearError());

  files.forEach(file => console.log(`name: ${file.name}, size: ${file.size}, type: ${file.type}`));

  return superagent.post(`${API_URL}${routes.SINGLE_IMAGE_UPLOAD_ROUTE}`)
    .set('Authorization', `Bearer ${token}`)
    .attach('image', files[0])
    .field('name', files[0].name)
    .then((res) => {
      store.dispatch(setImageSgids([res.body]));
      store.dispatch(imagePreview.clearImagePreviews());
      console.log('images saved. setting error to 201');
      return store.dispatch(errorActions.setError(201));
    })
    .catch(() => {
      return store.dispatch(setImageSgids('ERROR'));
    });
};
