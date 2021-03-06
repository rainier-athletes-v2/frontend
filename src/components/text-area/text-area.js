import React from 'react';
import PropTypes from 'prop-types';
import TooltipItem from '../tooltip/tooltip';
import * as ttText from '../../lib/tooltip-text';

export default function TextArea(props) {
  const textAreaMax = 1000;
  const spanStyle = {
    fontStyle: 'italic',
    color: props.value.length > textAreaMax ? 'red' : '#A9A9A9',
  };

  return (
    <React.Fragment>
      <label 
        className={ props.compClass }
        htmlFor={ props.compName }>
        { `${props.label}` }&nbsp;<span style={ spanStyle }> {` (${props.value.length} characters entered)` }</span>
        { ttText[props.compName]
          ? <TooltipItem id={ props.compName } text={ttText[props.compName]} />
          : null
        }
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
