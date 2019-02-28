import React from 'react';
import PropTypes from 'prop-types';
import SubjectColumn from '../subject-column/subject-column';

import './point-tracker-table.scss';

const defaultState = {
  subjectName: '',
  teacherId: '',
};

export default class PointTrackerTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = defaultState;
  }

  handleChange = (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    this.setState({ [name]: value });
  }

  render() {
    const sorted = this.props.synopsisReport.PointTrackers__r.records.sort((a, b) => a.Class__r.Period__c - b.Class__r.Period__c);
    const subjectsJSX = sorted.map((subject, i) => {
      return (
        <SubjectColumn
          key={ `${subject.Class__r.Name}-${i}` }
          subject={ subject }
          handleSubjectChange={ this.props.handleSubjectChange }
          isElementaryStudent={ this.props.synopsisReport.Student__r.Student_Grade__c < 6 }
        /> 
      );
    });

    return (
      <div className="row">
        <div className="col-md-12">
          <span className="edit-subjects">Point Sheet</span>
          <div>
          </div>
          <div className={this.props.synopsisReport.Student__r.Student_Grade__c < 6 
            ? 'point-table elementary-table' 
            : 'point-table middleschool-table'}>
              {this.props.synopsisReport.Student__r.Student_Grade__c < 6 ? null : <div className="grid-label">Period</div>}
              <div className="grid-label">Teacher</div>
              <div className="grid-label">Subject</div>
              <div className="grid-label">Excused</div>
              <div className="grid-label">Stamps</div>
              <div className="grid-label">X&apos;s</div>
              {this.props.synopsisReport.Student__r.Student_Grade__c < 6 ? null : <div className="grid-label">Grade</div>}
            { subjectsJSX }
          </div>
        </div>
      </div>
    );
  }
}

PointTrackerTable.propTypes = {
  synopsisReport: PropTypes.object,
  handleSubjectChange: PropTypes.func,
  myRole: PropTypes.string,
};
