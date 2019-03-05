import React from 'react';
import PropTypes from 'prop-types';

import './_subject-column.scss';

export default function SubjectColumn(props) {
  const gradeClassName = (subject) => {
    if (subject.Class__r.Name.toLowerCase() === 'tutorial') return 'grid-cell-hidden';
    return (!props.doValidation || (subject.Grade__c !== null && subject.Grade__c !== '') ? 'grid-input' : 'grid-input invalid-scores');
  };

  if (!props.subject) return null;
  const scoring = [
    'Excused_Days__c',
    'Stamps__c',
    'Half_Stamps__c',
  ];
  return (
    <React.Fragment>
      {props.isElementaryStudent ? null : <div className="grid-cell">{ (props.subject.Class__r && props.subject.Class__r.Period__c) || '' }</div>}
      <div className="grid-cell">{ (props.subject.Class__r.Teacher__r && props.subject.Class__r.Teacher__r.Name) || '' }</div>
      <div className="grid-cell">{ props.subject.Class__r.Name }</div>
      {
        scoring.map((markType, i) => {
          const excusedDays = props.subject && props.subject.Excused_Days__c;
          const stamps = props.subject && props.subject.Stamps__c;
          const halfStamps = props.subject && props.subject.Half_Stamps__c;
          const validScores = !props.doValidation 
            || (props.subject[markType] !== null && props.subject[markType] !== '' && excusedDays >= 0 
              ? (stamps + halfStamps) <= (20 - excusedDays * 4) 
              : false);
          return (
            <div className="grid-cell" key={ i }><input
              type="number"
              required
              onChange={ props.handleSubjectChange }
              className={validScores ? 'grid-input' : 'grid-input invalid-scores'}
              name={ `${props.subject.Class__r.Name}-${markType}` }
              value={ props.subject[markType] === null ? '' : props.subject[markType]}
            /></div>);
        })
      }
      {props.isElementaryStudent ? null
        : <div className="grid-cell">
        <input
          type="text"
          className={gradeClassName(props.subject)}
          onChange={ props.handleSubjectChange }
          name={ `${props.subject.Class__r.Name}-grade` }
          value={ props.subject.Grade__c }
          required={!props.doValidation || props.subject.Class__r.Name.toLowerCase() !== 'tutorial'}/>
      </div>}
    </React.Fragment>
  );
}

SubjectColumn.propTypes = {
  subject: PropTypes.object,
  handleSubjectChange: PropTypes.func,
  isElementaryStudent: PropTypes.bool,
  doValidation: PropTypes.bool,
};
