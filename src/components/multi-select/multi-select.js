import React from 'react';
import PropTypes from 'prop-types';
import TooltipItem from '../tooltip/tooltip';
import * as ttText from '../../lib/tooltip-text';

export default function MultiSelect(props) {
  return (
    <React.Fragment>
      <label className={props.compClass}
        htmlFor={props.compName}>
        {props.label}
      </label>
      { ttText[props.compName] 
        ? <TooltipItem id={props.compName} text={ttText[props.compName]}/>
        : null
      }
      <select multiple value={props.value}
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

MultiSelect.propTypes = {
  compClass: PropTypes.string,
  compName: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.array,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  options: PropTypes.array,
};
