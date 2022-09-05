import React from 'react';
import PropTypes from 'prop-types';

export const textAreaMax = 1000;

export function TextArea(props) {
  const spanStyle = {
    fontStyle: 'italic',
    color: props.value && props.value.length > textAreaMax ? 'red' : '#A9A9A9',
  };

  const charsRemaining = (value) => {
    const charsUsed = value ? value.length : 0;
    return textAreaMax - charsUsed;
  };

  return (
    <React.Fragment>
      <label 
        className={ props.compClass }
        htmlFor={ props.compName }>
        {props.label}
        &nbsp;<span style={ spanStyle }> {` (${charsRemaining(props.value)} characters remaining)` }</span>
      </label>
      <textarea
        name={ props.compName }
        required={ props.required }
        placeholder= { props.placeholder }
        onChange={ props.onChange }
        value={props.value}
        rows={ props.rows }
        cols={ props.cols }
        wrap="hard"
      />
    </React.Fragment>
  );
}


TextArea.propTypes = {
  compClass: PropTypes.string,
  compName: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  cols: PropTypes.number,
};
