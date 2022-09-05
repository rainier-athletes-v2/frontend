import React from 'react';
import PropTypes from 'prop-types';

export default function DropDown(props) {
  return (
    <React.Fragment>
      <label 
        className={props.labelClass ? props.labelClass : '' }
        htmlFor={props.compName}>
        {props.label}
      </label>
      <select className={props.valueClass ? props.valueClass : '' }
        value={props.value}
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
  labelClass: PropTypes.string,
  valueClass: PropTypes.string,
  compName: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  options: PropTypes.array,
};
