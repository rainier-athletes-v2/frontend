import React from 'react';
import PropTypes from 'prop-types';
import TooltipItem from '../tooltip/tooltip';
import * as ttText from '../../lib/tooltip-text';

export default function DropDown(props) {
  return (
    <React.Fragment>
      <label className={props.compClass}
        htmlFor={props.compName}>
        {props.label}
        { ttText[props.compName] 
          ? <TooltipItem id={props.compName} text={ttText[props.compName]}/>
          : null
        }
      </label>
      <select value={props.value}
        required
        name={props.compName}
        onChange={props.onChange}>
        {props.options.map((op, i) => (
          <option key={i} value={op.value}>{op.label}</option>
        ))}
      </select>
    </React.Fragment>
  );
}

DropDown.propTypes = {
  compClass: PropTypes.string,
  compName: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  options: PropTypes.array,
};
