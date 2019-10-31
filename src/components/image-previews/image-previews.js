// Thanks to Egor Egorov for this idea.
// https://medium.com/@650egor/react-30-day-challenge-day-2-image-upload-preview-2d534f8eaaa

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import ImageButton from '../image-button/image-button';
import { setImagePreviews } from '../../actions/image-previews';

const mapDispatchToProps = dispatch => ({
  setImagePreviews: images => dispatch(setImagePreviews(images)),
});

class ImagePreviews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: null,
    };
  }

  handleChange = (event) => {
    const newState = { ...this.state };
    if (newState.images) {
      const offset = newState.images.length;
      Array.from(event.target.files)
        .forEach((file, i) => (newState.images.push({ file, url: URL.createObjectURL(file), id: i + offset })));
    } else {
      newState.images = Array.from(event.target.files)
        .map((file, i) => ({ file, url: URL.createObjectURL(file), id: i }));
    }
    this.props.setImagePreviews(newState.images);
    return this.setState(newState);
  }

  removeImage = (thisImage) => {
    const newImages = this.state.images.filter(image => image.id !== thisImage.id);
    this.props.setImagePreviews(newImages);
    return this.setState({ images: newImages });
  }

  render() {
    return (
      <div>
        { this.state.images 
          ? this.state.images.map((image, i) => <div key={i} className="fadein">
              <div className="delete" onClick={() => this.removeImage(image)} >
                <FontAwesomeIcon icon={faTimesCircle} size='2x' />
              </div>
              <img src={image.url}/>
            </div>) 
          : null }
        <ImageButton onChange={this.handleChange} labelText="OPTIONAL: Add Images" />
      </div>
    );
  }
}

ImagePreviews.propTypes = {
  setImagePreviews: PropTypes.func,
};

export default connect(null, mapDispatchToProps)(ImagePreviews);
