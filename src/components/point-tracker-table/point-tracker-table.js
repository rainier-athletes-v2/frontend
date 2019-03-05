import React from 'react';
import PropTypes from 'prop-types';
import TooltipItem from '../tooltip/tooltip';
import * as ttText from '../../lib/tooltip-text';
import SubjectColumn from '../subject-column/subject-column';
import * as pl from '../../lib/pick-list-tests';

import './_point-tracker-table.scss';

export default function PointTrackerTable(props) {
  const sorted = props.synopsisReport.PointTrackers__r.records.sort((a, b) => a.Class__r.Period__c - b.Class__r.Period__c);
  const subjectsJSX = sorted.map((subject, i) => {
    return (
      <SubjectColumn
        key={ `${subject.Class__r.Name}-${i}` }
        subject={ subject }
        handleSubjectChange={ props.handleSubjectChange }
        isElementaryStudent={ props.synopsisReport.Student__r.Student_Grade__c < 6 }
        doValidation={pl.turnedIn(props.synopsisReport.Point_Sheet_Status__c)}
      /> 
    );
  });

  return (
    <div className="row">
      <div className="col-md-12">
        <span className="edit-subjects">Point Sheet</span><TooltipItem id="tooltip-mentorExplanation" text={ttText.pointSheet}/>
        <div>
        </div>
        <div className={props.synopsisReport.Student__r.Student_Grade__c < 6 
          ? 'point-table elementary-table' 
          : 'point-table middleschool-table'}>
            {props.synopsisReport.Student__r.Student_Grade__c < 6 ? null : <div className="grid-label">Period</div>}
            <div className="grid-label">Teacher</div>
            <div className="grid-label">Subject</div>
            <div className="grid-label">Excused</div>
            <div className="grid-label">Stamps</div>
            <div className="grid-label">X&apos;s</div>
            {props.synopsisReport.Student__r.Student_Grade__c < 6 ? null : <div className="grid-label">Grade</div>}
          { subjectsJSX }
        </div>
      </div>
    </div>
  );
}

PointTrackerTable.propTypes = {
  synopsisReport: PropTypes.object,
  handleSubjectChange: PropTypes.func,
  myRole: PropTypes.string,
};
