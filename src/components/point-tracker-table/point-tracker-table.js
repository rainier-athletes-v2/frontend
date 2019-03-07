import React from 'react';
import PropTypes from 'prop-types';
import TooltipItem from '../tooltip/tooltip';
import * as ttText from '../../lib/tooltip-text';
import SubjectColumn from '../subject-column/subject-column';
import * as pl from '../../lib/pick-list-tests';

import './_point-tracker-table.scss';

export default function PointTrackerTable(props) {
  const calcGPA = (subjects) => {
    const sumOfGrades = subjects.reduce((acc, curr) => {
      const c = Number.isInteger(parseInt(curr.Grade__c, 10)) ? parseInt(curr.Grade__c, 10) : 100;
      return acc + c;
    }, 0);
    const avgGrade = sumOfGrades / props.synopsisReport.PointTrackers__r.records.length;
    const avgAsPct = avgGrade / 100;
    const gpa = 4 * avgAsPct;
    return gpa.toFixed(2);
  };

  const sortedSubjects = props.synopsisReport.PointTrackers__r.records.sort((a, b) => a.Class__r.Period__c - b.Class__r.Period__c);
  const subjectsJSX = sortedSubjects.map((subject, i) => {
    return (
      <SubjectColumn
        key={ `${subject.Class__r.Name}-${i}` }
        subject={ subject }
        handleSubjectChange={ props.handleSubjectChange }
        isElementaryStudent={ props.synopsisReport.Student__r.Student_Grade__c < 6 }
        skipValidation={!pl.turnedIn(props.synopsisReport.Point_Sheet_Status__c)}
      /> 
    );
  });

  const gpaJSX = (
    <div className="gpa-display-container">
      <h5>GPA: { calcGPA(props.synopsisReport.PointTrackers__r.records) }</h5>
    </div>
  );

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
            {props.synopsisReport.Student__r.Student_Grade__c < 6 ? null 
              : <div className="grid-label">Grade<TooltipItem id="tooltip-mentorExplanation" text={ttText.pointSheetGrade}/></div>}
          { subjectsJSX }
        </div>
          { gpaJSX }
      </div>
    </div>
  );
}

PointTrackerTable.propTypes = {
  synopsisReport: PropTypes.object,
  handleSubjectChange: PropTypes.func,
  myRole: PropTypes.string,
};
