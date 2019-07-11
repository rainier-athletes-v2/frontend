import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SynopsisReportSummerSummary from '../synopsis-report-summer-summary/synopsis-report-summer-summary';
import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
import * as srActions from '../../actions/synopsis-report';
import * as srSummaryActions from '../../actions/synopsis-report-summary';
import * as srPdfActions from '../../actions/synopsis-report-pdf';
import * as pl from '../../lib/pick-list-tests';
import * as errorActions from '../../actions/error';

import './_synopsis-report-summer-form.scss';

const mapStateToProps = state => ({
  synopsisReport: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0],
  synopsisReportLink: state.synopsisReport && state.synopsisReportLink,
  myRole: state.myProfile && state.myProfile.role,
  saveStatus: state.error,
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
    this.state.mentorMadeScheduledCheckin = -1;
    this.state.questionOfTheWeek = -1;
    this.props.clearMsgBoardUrl();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.saveStatus !== prevProps.saveStatus) {
      if (this.props.saveStatus && this.props.saveStatus < 300) {
        this.setState({
          synopsisSaved: true,
          waitingOnSaves: false,
        });
        this.props.clearError();
      }
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
      newState.answeredQoW = true;
      newState.weeklyQuestionOK = true;
      newState.lastSummerCamp = -1;
      newState.nextSummerCamp = -1;
      newState.lastSummerCampOK = true;
      newState.nextSummerCampOK = true;
      newState.lastCampNotesOK = true;
      newState.nextCampNotesOK = true;
      newState.familyConnectionStatusOK = true;
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      newState.mentorMadeScheduledCheckin = -1;
      newState.questionOfTheWeek = -1;
      return newState;
    });
  }

  handleSimpleFieldChange = (event) => {
    const { name, value } = event.target;
    const newState = { ...this.state };
    newState.synopsisReport[name] = value;
    return this.setState(newState);
  }

  handleWeeklyConnectionMadeChange = (event) => {
    const { value } = event.target;
    const newState = { ...this.state };
    newState.synopsisReport.Summer_weekly_connection_made__c = value;
    return this.setState(newState);
  }

  handleWeeklyConnectionChange = (event) => {
    const { value } = event.target;
    const newState = { ...this.state };
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
    const answeredQoW = !!sr.Summer_question_of_the_week_answered__c;
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
    const lastSummerCampOK = !!sr.Summer_attended_last_camp__c;
    const nextSummerCampOK = !!sr.Summer_attend_next_camp__c;
    const lastCampNotesOK = !!sr.Summer_attended_last_camp_notes__c || sr.Summer_attended_last_camp__c === 'Yes';
    const nextCampNotesOK = !!sr.Summer_next_camp_notes__c || sr.Summer_attend_next_camp__c === 'Yes';
    const familyConnectionMade = !!sr.Summer_family_connection_made__c;
    const familyConnectionStatusOK = (familyConnectionMade && !!sr.Summer_family_connection_status__c) || !familyConnectionMade;
    const mentorSupportRequestOK = !!sr.Mentor_Support_Request__c;
    const mentorSupportRequestNotesOK = !pl.yes(sr.Mentor_Support_Request__c)
      || (pl.yes(sr.Mentor_Support_Request__c) && !!sr.Mentor_Support_Request_Notes__c);

    this.setState({
      metWithMentee,
      answeredQoW,
      studentConnectionNotesOK,
      weeklyQuestionOK,
      lastSummerCampOK,
      lastCampNotesOK,
      nextSummerCampOK,
      nextCampNotesOK,
      familyConnectionStatusOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return metWithMentee 
      && answeredQoW
      && studentConnectionNotesOK
      && weeklyQuestionOK
      && lastSummerCampOK
      && lastCampNotesOK
      && nextSummerCampOK
      && nextCampNotesOK
      && familyConnectionStatusOK
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

  handleMentorMadeScheduledCheckinChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.mentorMadeScheduledCheckin = parseInt(event.target.value, 10);
    if (newState.mentorMadeScheduledCheckin === 1) {
      newState.synopsisReport.Summer_weekly_connection_made__c = 'Yes';
    } else {
      newState.synopsisReport.Summer_weekly_connection_made__c = 'No';
    }
    this.setState(newState);
  }

  handleQuestionOfTheWeekChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.questionOfTheWeek = parseInt(event.target.value, 10);
    if (newState.questionOfTheWeek === 1) {
      newState.synopsisReport.Summer_question_of_the_week_answered__c = 'Yes';
    } else {
      newState.synopsisReport.Summer_question_of_the_week_answered__c = 'No';
    }
    this.setState(newState);
  }

  handleLastSummerCampChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.lastSummerCamp = parseInt(event.target.value, 10);
    if (newState.lastSummerCamp === 1) {
      newState.synopsisReport.Summer_attended_last_camp__c = 'Yes';
    } else {
      newState.synopsisReport.Summer_attended_last_camp__c = 'No';
    }
    this.setState(newState);
  }

  handleNextSummerCampChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.nextSummerCamp = parseInt(event.target.value, 10);
    if (newState.nextSummerCamp === 1) {
      newState.synopsisReport.Summer_attend_next_camp__c = 'Yes';
    } else {
      newState.synopsisReport.Summer_attend_next_camp__c = 'No';
    }
    this.setState(newState);
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

    // question 1
    const mentorMadeScheduledCheckinJSX = (
      <React.Fragment>
      <div className="mentor-met-container" key='mentorMadeCheckin'>
        <label className={this.state.metWithMentee ? '' : 'required'} htmlFor="made-meeting">Did you connect with your RA student this week?</label>
          <input
            type="radio"
            name="made-meeting"
            value="1"
            className="inline"
            checked={this.state.mentorMadeScheduledCheckin === 1 ? 'checked' : ''}
            required="true"
            onChange={this.handleMentorMadeScheduledCheckinChange}/> Yes
          <input
            type="radio"
            name="made-meeting"
            value="0"
            className="inline"
            checked={this.state.mentorMadeScheduledCheckin === 0 ? 'checked' : ''}
            requried="true"
            onChange={this.handleMentorMadeScheduledCheckinChange}/> No
      </div>
      </React.Fragment>
    );

    // question 2
    const weeklyConnectionStatusJSX = () => {
      if (!this.state.synopsisReport) return null;
      
      if (this.state.mentorMadeScheduledCheckin !== -1) {
        return (
        <div className="mentor-met-container" key='mentorMadeCheckin'>
          <DropDown
            compClass={this.state.metWithMentee ? 'title' : 'title required'}
            compName="Summer_weekly_connection_status__c"
            label="Select a weekly connection status:"
            value={this.state.synopsisReport.Summer_weekly_connection_status__c
              ? this.state.synopsisReport.Summer_weekly_connection_status__c
              : ''}
            onChange={ this.handleWeeklyConnectionChange}

            options={this.state.synopsisReport.Summer_weekly_connection_made__c === 'Yes'
              ? [
                { value: '', label: '--Select Check In Status--' },
                { value: 'I met with student at the agreed upon day and time (+2 Character Capital)', label: 'I met with student at the agreed upon day and time (+2 Character Capital)' },
                { value: 'Student called me at the agreed upon day and time (+2 Character Capital)', label: 'Student called me at the agreed upon day and time (+2 Character Capital)' },
                { value: 'I called student 30 minutes after the agreed upon time as student did not call me (+1 Character Capital)', label: 'I called student 30 minutes after the agreed upon time as student did not call me (+1 Character Capital)' },
                { value: 'We connected via Basecamp (Love that you are using Basecamp as an additional way to communicate! Keep it up!) ', label: 'We connected via Basecamp (Love that you are using Basecamp as an additional way to communicate! Keep it up!) ' },
              ]
              : [
                { value: '', label: '--Select Check In Status--' },
                { value: 'I called student 30 minutes after the agreed upon time as student did not call me and student didn’t answer or call me back', label: 'I called student 30 minutes after the agreed upon time as student did not call me and student didn’t answer or call me back' },
                { value: 'Student did not show up on the day and time we agreed upon', label: 'Student did not show up on the day and time we agreed upon' },
                { value: 'No, for reasons explained below', label: 'No, for reasons explained below' },
              ]
            }/>
            {weeklyConnectionNotesRequired
              ? <div className="survey-question-container">
                  <TextArea
                    compClass={this.state.studentConnectionNotesOK ? 'title' : 'title required'}
                    compName="Summer_weekly_connection_other_notes__c"
                    label="Please explain your response (required):"
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
        </div>);
      }
      return null;
    };

    // question 3
    const questionOfTheWeekResponseJSX = (
      <div className="survey-question-container">
      <React.Fragment>
      <div className="mentor-met-container" key='mentorMadeCheckin'>
        <label className={this.state.answeredQoW ? '' : 'required'} htmlFor="made-meeting">Did the student respond to the Question of the Week?</label>
          <input
            type="radio"
            name="qow"
            value="1"
            className="inline"
            checked={this.state.questionOfTheWeek === 1 ? 'checked' : ''}
            required="true"
            onChange={this.handleQuestionOfTheWeekChange}/> Yes
          <input
            type="radio"
            name="qow"
            value="0"
            className="inline"
            checked={this.state.questionOfTheWeek === 0 ? 'checked' : ''}
            requried="true"
            onChange={this.handleQuestionOfTheWeekChange}/> No
      </div>
      </React.Fragment>
      { this.state.questionOfTheWeek !== -1
        ? <TextArea
            compClass={this.state.weeklyQuestionOK ? 'title' : 'title required'}
            compName="Summer_question_of_the_week_response__c"
            label={this.state.questionOfTheWeek === 1 ? 'What was student’s response?' : 'Why not?'}
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
        <div className="mentor-met-container" key='mentorMadeCheckin'>
        <label className={this.state.lastSummerCampOK ? '' : 'required'} htmlFor="made-meeting">Did your student attend their last summer camp?</label>
          <input
            type="radio"
            name="lastCamp"
            value="1"
            className="inline"
            checked={this.state.lastSummerCamp === 1 ? 'checked' : ''}
            required="true"
            onChange={this.handleLastSummerCampChange}/> Yes
          <input
            type="radio"
            name="lastCamp"
            value="0"
            className="inline"
            checked={this.state.lastSummerCamp === 0 ? 'checked' : ''}
            requried="true"
            onChange={this.handleLastSummerCampChange}/> No
      </div>
      { this.state.lastSummerCamp !== -1 
        ? <TextArea
            compClass={this.state.lastCampNotesOK ? 'title' : 'title required'}
            compName="Summer_attended_last_camp_notes__c"
            label={this.state.lastSummerCamp === 1 ? 'Provide more detail (optional)' : 'Why didn’t they attend? (required)'}
            placeholder={''}
            value={ this.state.synopsisReport && this.state.synopsisReport.Summer_attended_last_camp_notes__c
              ? this.state.synopsisReport.Summer_attended_last_camp_notes__c
              : '' }
            // required={ true }
            onChange={ this.handleTextAreaChange }
            rows={ 2 }
            cols={ 80 }
          />
        : null }
      </div>
    );

    // question 5
    const nextSummerCampPlansJSX = (
      <div className="survey-question-container">
        <div className="mentor-met-container" key='mentorMadeCheckin'>
        <label className={this.state.nextSummerCampOK ? '' : 'required'} htmlFor="made-meeting">Is your student planning to attend their next summer camp?</label>
          <input
            type="radio"
            name="nextCamp"
            value="1"
            className="inline"
            checked={this.state.nextSummerCamp === 1 ? 'checked' : ''}
            required="true"
            onChange={this.handleNextSummerCampChange}/> Yes
          <input
            type="radio"
            name="nextCamp"
            value="0"
            className="inline"
            checked={this.state.nextSummerCamp === 0 ? 'checked' : ''}
            requried="true"
            onChange={this.handleNextSummerCampChange}/> No
      </div>
      { this.state.nextSummerCamp !== -1
        ? <TextArea
          compClass={this.state.nextCampNotesOK ? 'title' : 'title required'}
          compName="Summer_next_camp_notes__c"
          label={this.state.nextSummerCamp === 1 ? 'Provide more detail (optional)' : 'Why won\'t they attend? (required)'}
          placeholder={''}
          value={ this.state.synopsisReport && this.state.synopsisReport.Summer_next_camp_notes__c
            ? this.state.synopsisReport.Summer_next_camp_notes__c
            : '' }
          required={ true }
          onChange={ this.handleTextAreaChange }
          rows={ 2 }
          cols={ 80 }
        />
        : null }
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
                { mentorMadeScheduledCheckinJSX }
                { weeklyConnectionStatusJSX() }
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
  saveStatus: PropTypes.number,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummerForm);
