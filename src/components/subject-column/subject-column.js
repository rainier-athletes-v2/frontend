import React from 'react';
import PropTypes from 'prop-types';
import * as pt from '../../lib/playing-time-utils';

import './_subject-column.scss';

export default function SubjectColumn(props) {
  if (!props.subject) return null;

  const gradeClassName = (subject) => {
    if (subject.Class__r.Name.toLowerCase() === 'tutorial') return 'grid-cell-hidden';
    return (props.skipValidation || (subject.Grade__c !== null && subject.Grade__c !== '') ? 'grid-input' : 'grid-input invalid-scores');
  };

  const scoring = [
    'Excused_Days__c',
    'Stamps__c',
    'Half_Stamps__c',
  ];

  const validScores = props.skipValidation || pt.validScores(props.subject);

  return (
    <React.Fragment>
      {props.isElementaryStudent ? null : <div className="grid-cell">{ (props.subject.Class__r && props.subject.Class__r.Period__c) || '' }</div>}
      <div className="grid-cell">{ (props.subject.Class__r.Teacher__r && props.subject.Class__r.Teacher__r.Name) || '' }</div>
      <div className="grid-cell">{ props.subject.Class__r.Name }</div>
      {
        scoring.map((markType, i) => {
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
          required={props.skipValidation || props.subject.Class__r.Name.toLowerCase() !== 'tutorial'}/>
      </div>}
    </React.Fragment>
  );
}

SubjectColumn.propTypes = {
  subject: PropTypes.object,
  handleSubjectChange: PropTypes.func,
  isElementaryStudent: PropTypes.bool,
  skipValidation: PropTypes.bool,
};
