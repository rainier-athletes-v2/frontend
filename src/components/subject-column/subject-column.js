import React from 'react';
import PropTypes from 'prop-types';

import './subject-column.scss';

// export default function SubjectColumn(props) {
export default class SubjectColumn extends React.Component {
  /* eslint-disable */
  constructor(props) {
    // converted this component to a class in order to implement gradeClassName.
    // don't need state, but need props.
    super(props);
  };
  /* eslint-enable */

  // handleDelete = () => {
  //   const { subjectName, teacher } = this.props.subject;
  //   this.props.deleteSubject(subjectName, teacher);
  // };

  gradeClassName = (subject) => {
    if (subject.Class__r.Name.toLowerCase() === 'tutorial') return 'grid-cell-hidden';
    return this.props.subject.Grade__c !== null && this.props.subject.Grade__c !== '' ? 'grid-input' : 'grid-input invalid-scores';
  };

  
  render() {
    if (!this.props.subject) return null;
    const scoring = [
      'Excused_Days__c',
      'Stamps__c',
      'Half_Stamps__c',
    ];
    return (
      <React.Fragment>
        <div className="grid-cell">{ this.props.subject.Class__r.Name.toLowerCase() !== 'tutorial' 
          ? this.props.subject.Class__r.Teacher__r.Name : '' }</div>
        <div className="grid-cell">{ this.props.subject.Class__r.Name }</div>
        {
          scoring.map((markType, i) => {
            const excusedDays = this.props.subject && this.props.subject.Excused_Days__c;
            const stamps = this.props.subject && this.props.subject.Stamps__c;
            const halfStamps = this.props.subject && this.props.subject.Half_Stamps__c;
            const validScores = this.props.subject[markType] !== null && this.props.subject[markType] !== ''
              && excusedDays >= 0 ? (stamps + halfStamps) <= (20 - excusedDays * 4) : false;
            return (
              <div className="grid-cell" key={ i }><input
                type="number"
                required
                onChange={ this.props.handleSubjectChange }
                className={validScores ? 'grid-input' : 'grid-input invalid-scores'}
                name={ `${this.props.subject.Class__r.Name}-${markType}` }
                value={ this.props.subject[markType] === null ? '' : this.props.subject[markType]}
              /></div>);
          })
        }
        {this.props.isElementaryStudent ? null
          : <div className="grid-cell">
          <input
            type="text"
            className={this.gradeClassName(this.props.subject)}
            onChange={ this.props.handleSubjectChange }
            name={ `${this.props.subject.Class__r.Name}-grade` }
            value={ this.props.subject.Grade__c }
            required={this.props.subject.Class__r.Name.toLowerCase() !== 'tutorial'}/>
        </div>}
        {/* <div className={this.props.editing && this.props.subject.subjectName.toLowerCase() !== 'tutorial' ? 'grid-cell-delete' : 'grid-cell-hidden'}>
            <button type="button" onClick={ this.handleDelete }>X</button>
        </div> */}
      </React.Fragment>
    );
  }
}

SubjectColumn.propTypes = {
  subject: PropTypes.object,
  handleSubjectChange: PropTypes.func,
  // deleteSubject: PropTypes.func,
  isElementaryStudent: PropTypes.bool,
  // editing: PropTypes.bool,
};
