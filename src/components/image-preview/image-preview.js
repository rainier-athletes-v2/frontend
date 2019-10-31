// Thanks to Egor Egorov for this idea.
// https://medium.com/@650egor/react-30-day-challenge-day-2-image-upload-preview-2d534f8eaaa

import { React } from 'react';
import PropTypes from 'prop-types';
import ImageButton from '../image-button/image-button';

class ImagePreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: null,
    };
  }

  handleChange = (event) => {
    this.setState({
      files: event.target.files.map(file => URL.createObjectURL(file)),
    });
  }

  render() {
    return (
      <div>
        <ImageButton onChange={this.handleChange} labelText={this.props.labelText} />
        { this.state.files.map((file, i) => { return (<img src={file}key={i}/>); }) }
      </div>
    );
  }
}

ImagePreview.propTypes = {
  labelText: PropTypes.string,
};

export default ImagePreview;
