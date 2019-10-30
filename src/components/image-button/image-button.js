// Thanks to Osvaldas Valutis for the styling ideas and approach to hiding the standard file chooser.
// https://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/
// Thanks to Jesse Heaslip for the image upload pattern.
// https://codeburst.io/react-image-upload-with-kittens-cc96430eaece

import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faImages } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import './_image-button.scss';

export default function ImageButton(props) { 
  return (<div>  
      <input type='file' id='multi' className="inputfile" onChange={props.onChange} multiple />
      <label htmlFor='multi'>
        {props.labelText}
      </label>
  </div>);
}

ImageButton.propTypes = {
  onChange: PropTypes.func,
  labelText: PropTypes.string,
};
