import superagent from 'superagent';
import * as routes from '../lib/routes';
import * as t from '../lib/types';
import * as errorActions from './error';
import * as imagePreview from './image-previews';

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

  const uploadPromises = [];
  files.forEach((file) => {
    uploadPromises.push(superagent.post(`${API_URL}${routes.SINGLE_IMAGE_UPLOAD_ROUTE}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('image', file)
      .field('name', file.name));
  });
  Promise.all(uploadPromises)
    .then((responses) => {
      const returnVal = responses.map(response => response.body);
      store.dispatch(setImageSgids(returnVal));
      store.dispatch(imagePreview.clearImagePreviews());
      console.log('images saved. setting error to 201');
      return store.dispatch(errorActions.setError(201));
    })
    .catch(() => {
      return store.dispatch(setImageSgids('ERROR'));
    });
};
