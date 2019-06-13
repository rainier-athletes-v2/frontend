import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import PointTrackerTable from '../point-tracker-table/point-tracker-table';
import SynopsisReportSummerSummary from '../synopsis-report-summer-summary/synopsis-report-summer-summary';
// import TooltipItem from '../tooltip/tooltip';
import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
// import * as ttText from '../../lib/tooltip-text';
import * as srActions from '../../actions/synopsis-report';
import * as srSummaryActions from '../../actions/synopsis-report-summary';
import * as srPdfActions from '../../actions/synopsis-report-pdf';
import * as pl from '../../lib/pick-list-tests';
// import * as pt from '../../lib/playing-time-utils';
import * as errorActions from '../../actions/error';

import './_synopsis-report-summer-form.scss';

const mapStateToProps = state => ({
  synopsisReport: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0],
  synopsisReportLink: state.synopsisReport && state.synopsisReportLink,
  myRole: state.myProfile && state.myProfile.role,
});

const mapDispatchToProps = dispatch => ({
  saveSynopsisReport: synopsisReport => dispatch(srActions.saveSynopsisReport(synopsisReport)),
  setSynopsisReportLink: link => dispatch(srPdfActions.setSynopsisReportLink(link)),
  getMsgBoardUrl: studentEmail => dispatch(srSummaryActions.getMsgBoardUrl(studentEmail)),
  clearMsgBoardUrl: () => dispatch(srSummaryActions.clearMsgBoardUrl()),
  clearError: () => dispatch(errorActions.clearError()),
});

class SynopsisReportSummerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;
    this.state.synopsisSaved = false;

    this.props.clearMsgBoardUrl();
  }

  componentDidUpdate = (prevProps) => {
    console.log('cdUpdate link:', this.props.synopsisReportLink);
    if (this.props.synopsisReportLink !== prevProps.synopsisReportLink) {
      this.setState({
        synopsisSaved: true,
        waitingOnSaves: false,
        synopsisLink: this.props.synopsisReportLink,
      });
    }
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      this.props.clearError();
      this.setState({ 
        synopsisReport: { ...this.props.synopsisReport },
      });
      this.props.getMsgBoardUrl(this.props.synopsisReport.Student__r.npe01__HomeEmail__c);
    }
  }

  componentDidMount = () => {
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisSaved = false;
      this.props.setSynopsisReportLink('');
      newState.metWithMentee = true;
      newState.studentConnectionNotesOK = true;
      newState.weeklyQuestionOK = true;
      newState.lastCampNotesOK = true;
      newState.nextCampNotesOK = true;
      newState.familyConnectionStatusOK = true;
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      return newState;
    });
  }

  handleSimpleFieldChange = (event) => {
    const { name, value } = event.target;
    const newState = { ...this.state };
    newState.synopsisReport[name] = value;
    return this.setState(newState);
  }

  handleWeeklyConnectionChange = (event) => {
    const { value } = event.target;
    const newState = { ...this.state };
    newState.synopsisReport.Summer_weekly_connection_made__c = value.indexOf('Yes,') !== -1;
    newState.synopsisReport.Summer_weekly_connection_status__c = value;
    return this.setState(newState);
  }

  handleTextAreaChange = (event) => {
    event.persist();
    this.handleSimpleFieldChange(event);
  }

  handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisReport[name] = checked;
      return newState; 
    });
  }

  validMentorInput = (sr) => {
    const metWithMentee = !!sr.Summer_weekly_connection_status__c;
    const studentConnectionNotesOK = sr.Summer_weekly_connection_status__c 
      && (
        (sr.Summer_weekly_connection_status__c.indexOf('No, for reasons') !== -1
          && sr.Summer_weekly_connection_other_notes) 
        || !!sr.Summer_weekly_connection_status__c
      );
    const weeklyQuestionOK = sr.Summer_weekly_connection_status__c
      && ((sr.Summer_weekly_connection_status__c.indexOf('Yes, ') !== -1
      && !!sr.Summer_question_of_the_week_response__c) 
      || sr.Summer_weekly_connection_status__c.indexOf('No, ') !== -1);
    const lastCampNotesOK = !!sr.Summer_attended_last_camp_notes__c || !!sr.Summer_attended_last_camp__c;
    const nextCampNotesOK = !!sr.Summer_next_camp_notes__c || !!sr.Summer_attend_next_camp__c;
    const familyConnectionMade = !!sr.Summer_family_connection_made__c;
    const familyConnectionStatusOK = (familyConnectionMade && !!sr.Summer_family_connection_status__c) || !familyConnectionMade;
    // const familyConnectionNotesOK = sr.Summer_family_connection_status__c
    //   && ((sr.Summer_family_connection_status__c.indexOf('Other') !== -1 && !!sr.Summer_family_connection_other_notes__c)
    //   || !!sr.Summer_family_connection_status__c);
    const mentorSupportRequestOK = !!sr.Mentor_Support_Request__c;
    const mentorSupportRequestNotesOK = !pl.yes(sr.Mentor_Support_Request__c)
      || (pl.yes(sr.Mentor_Support_Request__c) && !!sr.Mentor_Support_Request_Notes__c);

    this.setState({
      metWithMentee,
      studentConnectionNotesOK,
      weeklyQuestionOK,
      lastCampNotesOK,
      nextCampNotesOK,
      familyConnectionStatusOK,
      // familyConnectionNotesOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return metWithMentee 
      && studentConnectionNotesOK
      && weeklyQuestionOK
      && lastCampNotesOK
      && nextCampNotesOK
      && familyConnectionStatusOK
      // && familyConnectionNotesOK
      && mentorSupportRequestOK
      && mentorSupportRequestNotesOK;
  }

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport } = this.state;
    synopsisReport.Synopsis_Report_Status__c = pl.SrStatus.Completed;
    const validMentorInput = this.validMentorInput(synopsisReport);
    if (validMentorInput) {      
      this.setState({ ...this.state, waitingOnSaves: true, synopsisSaved: false });
      this.props.saveSynopsisReport({ ...synopsisReport });
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  render() {
    const srHeadingJSX = (
      <div className="row">
        <div className="col-md-6">
          <span className="title">Student</span>
          <span className="name">{ this.state.synopsisReport && this.state.synopsisReport.Student__r.Name }</span>
        </div>
        <div className="col-md-6">
          <span className="title">Reporting Period</span>
          <span className="name">{`${this.state.synopsisReport && this.state.synopsisReport.Week__c}`}</span>
        </div>
      </div>
    );

    const weeklyConnectionNotesRequired = this.state.synopsisReport
      && this.state.synopsisReport.Summer_weekly_connection_status__c
      && this.state.synopsisReport.Summer_weekly_connection_status__c.indexOf('No, for reasons') !== -1;

    // question 1 & 2
    const weeklyConnectionStatusJSX = (
      <div className="mentor-met-container" key='mentorMadeCheckin'>
        <DropDown
          compClass={this.state.metWithMentee ? 'title' : 'title required'}
          compName="Summer_weekly_connection_status__c"
          label="Did you connect with your RA student this week?:"
          value={this.state.synopsisReport && this.state.synopsisReport.Summer_weekly_connection_status__c
            ? this.state.synopsisReport.Summer_weekly_connection_status__c
            : ''}
          onChange={ this.handleWeeklyConnectionChange}
          options={
            [
              { value: '', label: '--Select Check In Status--' },
              { value: 'Yes, I met with student at the agreed upon day and time', label: 'Yes, I met with student at the agreed upon day and time' },
              { value: 'Yes, student called me at the agreed upon day and time', label: 'Yes, student called me at the agreed upon day and time' },
              { value: 'Yes, I called student 30 minutes after the agreed upon time as student did not call me', label: 'Yes, I called student 30 minutes after the agreed upon time as student did not call me' },
              { value: 'Yes, we connected via Basecamp', label: 'Yes, we connected via Basecamp' },
              { value: 'No, I called student 30 minutes after the agreed upon time as student did not call me and the student didn’t answer or call me back', label: 'No, I called student 30 minutes after the agreed upon time as student did not call me and the student didn’t answer or call me back' },
              { value: 'No, student did not show up on the day and time we agreed upon', label: 'No, student did not show up on the day and time we agreed upon' },
              { value: 'No, for reasons explained below', label: 'No, for reasons explained below' },
            ]
          }/>
          {weeklyConnectionNotesRequired
            ? <div className="survey-question-container">
                <TextArea
                  compClass={this.state.studentConnectionNotesOK ? 'title' : 'title required'}
                  compName="Summer_weekly_connection_other_notes__c"
                  label="Please explain your response:"
                  placeholder={''}
                  value={ this.state.synopsisReport && this.state.synopsisReport.Summer_weekly_connection_other_notes__c
                    ? this.state.synopsisReport.Summer_weekly_connection_other_notes__c
                    : '' }
                  required={weeklyConnectionNotesRequired}
                  onChange={ this.handleTextAreaChange }
                  rows={ 2 }
                  cols={ 80 }
                />
              </div>
            : '' }
      </div>
    );

    // question 3
    const questionOfTheWeekResponseJSX = (
      <div className="survey-question-container">
      { this.state.synopsisReport && this.state.synopsisReport.Summer_weekly_connection_made__c
        ? <TextArea
            compClass={this.state.weeklyQuestionOK ? 'title' : 'title required'}
            compName="Summer_question_of_the_week_response__c"
            label="Student's Question of The Week response:"
            placeholder={''}
            value={ this.state.synopsisReport && this.state.synopsisReport.Summer_question_of_the_week_response__c
              ? this.state.synopsisReport.Summer_question_of_the_week_response__c
              : '' }
            required={this.state.synopsisReport && pl.other(this.state.synopsisReport.Point_Sheet_Status__c)}
            onChange={ this.handleTextAreaChange }
            rows={ 2 }
            cols={ 80 }
          />
        : ''}
      </div>
    );

    // question 4
    const attendedLastSummerCampJSX = (
      <div className="survey-question-container">
        <div>
          <label htmlFor="last-summer-camp" 
            className="title" >Check if student attended their last summer camp: </label>
          <input
            id="last-summer-camp"
            type="checkbox"
            name={ 'Summer_attended_last_camp__c' }
            onChange= { this.handleCheckboxChange }
            checked={ this.state.synopsisReport && this.state.synopsisReport.Summer_attended_last_camp__c }
            />
          </div>
          <TextArea
            compClass={this.state.lastCampNotesOK ? 'title' : 'title required'}
            compName="Summer_attended_last_camp_notes__c"
            label="Notes for last summer camp experience:"
            placeholder={ this.state.synopsisReport && !this.state.synopsisReport.Summer_attended_last_camp__c ? 'Why didn\'t they attend?...' : ''}
            value={ this.state.synopsisReport && this.state.synopsisReport.Summer_attended_last_camp_notes__c
              ? this.state.synopsisReport.Summer_attended_last_camp_notes__c
              : '' }
            // required={ true }
            onChange={ this.handleTextAreaChange }
            rows={ 2 }
            cols={ 80 }
          />
      </div>
    );

    // question 5
    const nextSummerCampPlansJSX = (
      <div className="survey-question-container">
        <div>
          <label htmlFor="next-summer-camp" className="title">Check if student plans to attended their next summer camp: </label>
          <input
            id="next-summer-camp"
            type="checkbox"
            name={ 'Summer_attend_next_camp__c' }
            onChange= { this.handleCheckboxChange }
            checked={ this.state.synopsisReport && this.state.synopsisReport.Summer_attend_next_camp__c }
            />
        </div>
        <TextArea
          compClass={this.state.nextCampNotesOK ? 'title' : 'title required'}
          compName="Summer_next_camp_notes__c"
          label="Notes for next summer camp plans:"
          placeholder={ this.state.synopsisReport && !this.state.synopsisReport.Summer_attend_next_camp__c ? 'Why won\'t they attend?...' : ''}
          value={ this.state.synopsisReport && this.state.synopsisReport.Summer_next_camp_notes__c
            ? this.state.synopsisReport.Summer_next_camp_notes__c
            : '' }
          required={ true }
          onChange={ this.handleTextAreaChange }
          rows={ 2 }
          cols={ 80 }
        />
      </div>
    );

    // question 6
    const familyConnectionJSX = (
      <div className="survey-question-container">
        <label htmlFor="family-connection" className="title">Check if you met with students family this week:</label>
        <input
          id="family-connection"
          type="checkbox"
          name={ 'Summer_family_connection_made__c' }
          onChange= { this.handleCheckboxChange }
          checked={ this.state.synopsisReport && this.state.synopsisReport.Summer_family_connection_made__c }
          />
        { this.state.synopsisReport && this.state.synopsisReport.Summer_family_connection_made__c
          ? <DropDown
              compClass={this.state.familyConnectionStatusOK ? 'title' : 'title required'}
              compName="Summer_family_connection_status__c"
              label="Please characterize your family connection:"
              value={this.state.synopsisReport && this.state.synopsisReport.Summer_family_connection_status__c
                ? this.state.synopsisReport.Summer_family_connection_status__c
                : ''}
              onChange={ this.handleSimpleFieldChange }
              options={
                [
                  { value: '', label: '--Select Check In Status--' },
                  { value: 'Phone Call', label: 'Phone Call' },
                  { value: 'Summer Camp', label: 'Summer Camp' },
                  { value: 'Mentor Meal', label: 'Mentor Meal' },
                  { value: 'YMCA', label: 'YMCA' },
                  { value: 'Digital', label: 'Digital' },
                  { value: 'Other', label: 'Other' },
                ]
              }/>
          : '' }
          { this.state.synopsisReport && this.state.synopsisReport.Summer_family_connection_status__c
            && this.state.synopsisReport.Summer_family_connection_status__c.indexOf('Other') !== -1
            ? <TextArea
                compClass={this.state.familyConnectionNotesOK ? 'title' : 'title required'}
                compName="Summer_family_connection_other_notes__c"
                label="Please explain selection of 'other':"
                placeholder={''}
                value={ this.state.synopsisReport && this.state.synopsisReport.Summer_family_connection_other_notes__c
                  ? this.state.synopsisReport.Summer_family_connection_other_notes__c
                  : '' }
                required={ true }
                onChange={ this.handleTextAreaChange }
                rows={ 2 }
                cols={ 80 }
              />
            : ''}
      </div>
    );

    const mentorSupportRequestJSX = (
      <div className="container">
        <div className="row ms-select">
          <div className="request-prompt-container">
            <span className={ this.state.mentorSupportRequestOK ? '' : 'required'}>Do you need additional support? </span>
          </div>
          <div className="request-dropdown-container">
            <select
              name="Mentor_Support_Request__c"
              onChange={ this.handleSimpleFieldChange }
              value={ this.state.synopsisReport ? this.state.synopsisReport.Mentor_Support_Request__c : '' }>
              <option value="">Pick One...</option>
              <option value="No">No</option>
              <option value="Student Follow Up">Student Follow Up</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="support-request-notes">
        { this.state.synopsisReport && !!this.state.synopsisReport.Mentor_Support_Request__c && this.state.synopsisReport.Mentor_Support_Request__c !== 'No'
          ? <TextArea
              compClass={ this.state.mentorSupportRequestNotesOK ? 'title' : 'title required' }
              compName="Mentor_Support_Request_Notes__c"
              label="Please explain:"
              value={ this.state.synopsisReport && this.state.synopsisReport.Mentor_Support_Request_Notes__c }
              onChange={ this.handleTextAreaChange }
              rows={ 2 }
              cols={ 80 } />
          : null
        }
        </div>
      </div>
    );

    const synopsisReportForm = this.props.synopsisReport
      ? (
      <div className="points-tracker panel point-tracker-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">SUMMER SYNOPSIS REPORT</h5>
              <button type="button" 
                className="close" 
                onClick={ this.props.cancelClick }
                data-dismiss="modal" 
                aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <form className="data-entry container">
                { srHeadingJSX }
                { weeklyConnectionStatusJSX }
                { questionOfTheWeekResponseJSX }
                { attendedLastSummerCampJSX }
                { nextSummerCampPlansJSX }
                { familyConnectionJSX }
                <div className="modal-footer">
                { mentorSupportRequestJSX }
                  { this.state.waitingOnSaves 
                    ? <FontAwesomeIcon icon="spinner" className="fa-spin fa-2x"/> 
                    : <h3><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Submit Summer Report</button>  to Student&#39;s Core Community</h3> }
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
      )
      : null; 

    console.log('Summer form rendering');
    return (
      <div className="modal-backdrop">
        { this.state.synopsisSaved
          ? <SynopsisReportSummerSummary 
            synopsisReport={this.state.synopsisReport} 
            onClose={ this.props.saveClick }/> 
          : synopsisReportForm }
      </div>
    );
  }
}

SynopsisReportSummerForm.propTypes = {
  synopsisReportLink: PropTypes.string,
  synopsisReport: PropTypes.object,
  pointTrackers: PropTypes.object,
  handleChange: PropTypes.func,
  saveSynopsisReport: PropTypes.func,
  createSynopsisReportPdf: PropTypes.func,
  setSynopsisReportLink: PropTypes.func,
  clearMsgBoardUrl: PropTypes.func,
  clearError: PropTypes.func,
  getMsgBoardUrl: PropTypes.func,
  saveClick: PropTypes.func,
  cancelClick: PropTypes.func,
  content: PropTypes.object,
  myRole: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummerForm);
