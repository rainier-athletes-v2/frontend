import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SynopsisReportSummerSummary from '../synopsis-report-summer-summary/synopsis-report-summer-summary';
import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
import MultiSelect from '../multi-select/multi-select';
import * as srActions from '../../actions/synopsis-report';
import * as msgBoardUrlActions from '../../actions/message-board-url';
import * as pl from '../../lib/pick-list-tests';
import * as errorActions from '../../actions/error';

import './_synopsis-report-summer-form.scss';

const mapStateToProps = state => ({
  synopsisReport: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0],
  myRole: state.myProfile && state.myProfile.role,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
});

const mapDispatchToProps = dispatch => ({
  saveSynopsisReport: synopsisReport => dispatch(srActions.saveSynopsisReport(synopsisReport)),
  getMsgBoardUrl: studentEmail => dispatch(msgBoardUrlActions.getMsgBoardUrl(studentEmail)),
  clearMsgBoardUrl: () => dispatch(msgBoardUrlActions.clearMsgBoardUrl()),
  // saveSummaryToBasecamp: srSummary => dispatch(basecampActions.postSummaryToBasecamp(srSummary)),
  clearError: () => dispatch(errorActions.clearError()),
});

class SynopsisReportSummerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;
    this.state.savedToSalesforce = false;
    this.state.waitingOnSalesforce = false;
    this.state.mentorMadeScheduledCheckin = -1;
    this.state.questionOfTheWeek = -1;
    this.props.clearMsgBoardUrl();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.error !== prevProps.error) {
      if (this.state.waitingOnSalesforce) {
        this.setState({
          waitingOnSalesfore: false,
          savedToSalesforce: true,
        });
      }
    }
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      const sr = this.props.synopsisReport;
      this.setState({ 
        synopsisReport: sr,
        lastSummerCamp: this.initRadioButtons(this.props.synopsisReport, 'Summer_attended_last_camp__c'),
        nextSummerCamp: this.initRadioButtons(this.props.synopsisReport, 'Summer_attend_next_camp__c'),
        mentorMadeScheduledCheckin: this.initRadioButtons(this.props.synopsisReport, 'Summer_weekly_connection_made__c'),
        questionOfTheWeek: this.initRadioButtons(this.props.synopsisReport, 'Summer_question_of_the_week_answered__c'),
        familyConnectionMade: this.initRadioButtons(this.props.synopsisReport, 'Summer_family_connection_made__c'),
      });
      this.props.clearError();
      this.props.getMsgBoardUrl(this.props.synopsisReport.Student__r.npe01__HomeEmail__c);
    }
  }

  initMultiSelectArray = (sr, fieldName) => {
    if (!sr) return [];
    if (sr[fieldName]) {
      const values = sr[fieldName];
      const returnVal = values.split(',');
      return returnVal || [];
    }
    return [];
  }

  initRadioButtons = (sr, fieldName) => {
    if (!sr) return -1;
    switch (sr[fieldName]) {
      case 'Yes':
        return 1;
      case 'No':
        return 0;
      default:
        return -1;
    }
  }

  componentDidMount = () => {
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.savedToSalesforce = false;
      newState.metWithMentee = true;
      newState.weeklyConnectionStatusOK = true;
      newState.studentConnectionNotesOK = true;
      newState.answeredQoW = true;
      newState.lastSummerCamp = this.initRadioButtons(newState.SynopsisReport, 'Summer_attended_last_camp__c');
      newState.nextSummerCamp = this.initRadioButtons(newState.SynopsisReport, 'Summer_attend_next_camp__c');
      newState.lastSummerCampOK = true;
      newState.nextSummerCampOK = true;
      newState.lastCampNotesOK = true;
      newState.nextCampNotesOK = true;
      newState.familyConnectionMade = this.initRadioButtons(newState.SynopsisReport, 'Summer_family_connection_made__c');
      newState.familyConnectionOK = true;
      newState.familyConnectionStatusOK = true;
      newState.familyConnectionNotesOK = true;
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      newState.mentorMadeScheduledCheckin = this.initRadioButtons(newState.SynopsisReport, 'Summer_weekly_connection_made__c');
      newState.questionOfTheWeek = this.initRadioButtons(newState.SynopsisReport, 'Summer_question_of_the_week_answered__c');
      return newState;
    });
  }

  handleSimpleFieldChange = (event) => {
    const { name, value } = event.target;
    const newState = { ...this.state };
    newState.synopsisReport[name] = value;
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
    const metWithMentee = !!sr.Summer_weekly_connection_made__c;
    const weeklyConnectionStatusOK = (sr.Summer_weekly_connection_made__c === 'Yes'
      && (sr.Summer_conn_met__c || sr.Summer_conn_called__c || sr.Summer_conn_late_call__c || sr.Summer_conn_basecamp__c))
      || (sr.Summer_weekly_connection_made__c === 'No'
      && (sr.Summer_conn_no_answer__c || sr.Summer_conn_no_show__c || sr.Summer_conn_missed_other__c));
    const answeredQoW = !!sr.Summer_question_of_the_week_answered__c;
    const studentConnectionNotesOK = sr.Summer_weekly_connection_made__c === 'Yes'
      || !sr.Summer_conn_missed_other__c
      || (sr.Summer_conn_missed_other__c && !!sr.Summer_weekly_connection_other_notes__c);
    const lastSummerCampOK = !!sr.Summer_attended_last_camp__c;
    const nextSummerCampOK = !!sr.Summer_attend_next_camp__c;
    const lastCampNotesOK = !!sr.Summer_attended_last_camp_notes__c || sr.Summer_attended_last_camp__c === 'Yes';
    const nextCampNotesOK = !!sr.Summer_next_camp_notes__c || sr.Summer_attend_next_camp__c === 'Yes';
    const familyConnectionOK = !!sr.Summer_family_connection_made__c;
    const familyConnectionStatusOK = sr.Summer_family_connection_made__c === 'No' 
      || (sr.Summer_family_connection_made__c === 'Yes' 
      && (sr.Summer_family_conn_phone__c || sr.Summer_family_conn_camp__c || sr.Summer_family_conn_meal__c
        || sr.Summer_family_conn_ymca__c || sr.Summer_family_conn_digital__c || sr.Summer_family_conn_other__c));
    const familyConnectionNotesOK = sr.Summer_family_connection_made__c === 'No'
      || !sr.Summer_family_conn_other__c 
      || (sr.Summer_family_conn_other__c && !!sr.Summer_family_connection_other_notes__c);
    const mentorSupportRequestOK = !!sr.Mentor_Support_Request__c;
    const mentorSupportRequestNotesOK = !pl.yes(sr.Mentor_Support_Request__c)
      || (pl.yes(sr.Mentor_Support_Request__c) && !!sr.Mentor_Support_Request_Notes__c);

    this.setState({
      metWithMentee,
      weeklyConnectionStatusOK,
      answeredQoW,
      studentConnectionNotesOK,
      lastSummerCampOK,
      lastCampNotesOK,
      nextSummerCampOK,
      nextCampNotesOK,
      familyConnectionOK,
      familyConnectionStatusOK,
      familyConnectionNotesOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return metWithMentee 
      && weeklyConnectionStatusOK
      && answeredQoW
      && studentConnectionNotesOK
      && lastSummerCampOK
      && lastCampNotesOK
      && nextSummerCampOK
      && nextCampNotesOK
      && familyConnectionOK
      && familyConnectionStatusOK
      && familyConnectionNotesOK
      && mentorSupportRequestOK
      && mentorSupportRequestNotesOK;
  }

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const newState = { ...this.state };
    const { synopsisReport } = newState;
    synopsisReport.Synopsis_Report_Status__c = pl.SrStatus.Completed;
    const validMentorInput = this.validMentorInput(synopsisReport);
    if (validMentorInput) {      
      this.setState({
        ...newState, 
        waitingOnSalesforce: true, 
        savedToSalesforce: false,   
      });
      this.props.saveSynopsisReport({ ...synopsisReport }); // save SR to salesforce
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  handleMentorMadeScheduledCheckinChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.mentorMadeScheduledCheckin = parseInt(event.target.value, 10);
    if (newState.mentorMadeScheduledCheckin === 1) {
      newState.synopsisReport.Summer_weekly_connection_made__c = 'Yes';
      newState.synopsisReport.Summer_conn_no_answer__c = false;
      newState.synopsisReport.Summer_conn_no_show__c = false;
      newState.synopsisReport.Summer_conn_missed_other__c = false;
      newState.synopsisReport.Summer_weekly_connection_other_notes__c = '';
    } else {
      newState.synopsisReport.Summer_weekly_connection_made__c = 'No';
      newState.synopsisReport.Summer_conn_met__c = false;
      newState.synopsisReport.Summer_conn_called__c = false;
      newState.synopsisReport.Summer_conn_late_call__c = false;
      newState.synopsisReport.Summer_conn_basecamp__c = false;
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
    newState.synopsisReport.Summer_attended_last_camp_notes__c = '';
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
    newState.synopsisReport.Summer_next_camp_notes__c = '';
    this.setState(newState);
  }

  handleFamilyConnectionChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.familyConnectionMade = parseInt(event.target.value, 10);
    if (newState.familyConnectionMade === 1) {
      newState.synopsisReport.Summer_family_connection_made__c = 'Yes';
    } else {
      newState.synopsisReport.Summer_family_connection_made__c = 'No';
      newState.synopsisReport.Summer_family_conn_phone__c = false;
      newState.synopsisReport.Summer_family_conn_camp__c = false;
      newState.synopsisReport.Summer_family_conn_meal__c = false;
      newState.synopsisReport.Summer_family_conn_ymca__c = false;
      newState.synopsisReport.Summer_family_conn_digital__c = false;
      newState.synopsisReport.Summer_family_conn_other__c = false;
      newState.synopsisReport.Summer_family_connection_other_notes__c = '';
    }
    this.setState(newState);
  }

  handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisReport[name] = checked;
      return newState; 
    });
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
      && this.state.synopsisReport.Summer_conn_missed_other__c;

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
    const madeCheckinValues = [
      { text: 'I met with student at the agreed upon day and time (+2 Character Capital)', prop: 'Summer_conn_met__c' },
      { text: 'Student called me at the agreed upon day and time (+2 Character Capital)', prop: 'Summer_conn_called__c' },
      { text: 'I called student 30 minutes after the agreed upon time as student did not call me (+1 Character Capital)', prop: 'Summer_conn_late_call__c' },
      { text: 'We connected via Basecamp (Love that you are using Basecamp as an additional way to communicate! Keep it up!)', prop: 'Summer_conn_basecamp__c' },
    ];

    const missedCheckinValues = [
      { text: 'I called student 30 minutes after the agreed upon time as student did not call me and student didn’t answer or call me back', prop: 'Summer_conn_no_answer__c' },
      { text: 'Student did not show up on the day and time we agreed upon', prop: 'Summer_conn_no_show__c' },
      { text: 'We did not connect for reasons explained below', prop: 'Summer_conn_missed_other__c' },
    ];

    const weeklyConnectionStatusJSX = () => {
      if (!this.state.synopsisReport) return null;
      
      if (this.state.mentorMadeScheduledCheckin !== -1) {
        return (
          <fieldset>
            <div className="mentor-met-container" key='connectionStatus'>
              <div className="mentor-met-container">
                <label className={ this.state.weeklyConnectionStatusOK ? 'title' : 'title required' }>Weekly Connection Status</label>
                {this.state.mentorMadeScheduledCheckin === 1
                  ? madeCheckinValues.map((value, i) => {
                    return (<div className="survey-question-container" key={ i }>
                      <input
                        type="checkbox"
                        name={ value.prop } // oneTeamQuestion }
                        className="inline"
                        onChange= { this.handleCheckboxChange }
                        checked={ (this.state.synopsisReport && this.state.synopsisReport[value.prop]) || false }/>
                      <label htmlFor={ value.prop }>{ value.text }</label>
                    </div>);
                  })
                  : missedCheckinValues.map((value, i) => {
                    return (<div className="survey-question-container" key={ i }>
                      <input
                        type="checkbox"
                        name={ value.prop } // oneTeamQuestion }
                        className="inline"
                        onChange= { this.handleCheckboxChange }
                        checked={ (this.state.synopsisReport && this.state.synopsisReport[value.prop]) || false }/>
                      <label htmlFor={ value.prop }>{ value.text }</label>
                    </div>);
                  })
                }
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
              </div>
            </div>
          </fieldset>
        );
      }
      return null;
    };

    // question 3
    const questionOfTheWeekResponseJSX = (
      <div className="survey-question-container">
        <div className="mentor-met-container" key='questionOfTheWeek'>
        <label className={ this.state.answeredQoW ? 'title' : 'title required' }>Question of The Week</label><br />
          <label htmlFor="qow">Did the student respond to the Question of the Week?</label>
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
      </div>
    );

    // question 4
    const attendedLastSummerCampJSX = (
      <div className="survey-question-container">
        <div className="mentor-met-container" key='attendedLastCamp'>
        <label className="title">Summer Camp</label><br />
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
        <div className="mentor-met-container" key='attendNextCamp'>
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
    const familyConnectionTypes = [
      { text: 'Phone Call', prop: 'Summer_family_conn_phone__c' },
      { text: 'Summer Camp', prop: 'Summer_family_conn_camp__c' },
      { text: 'Mentor Meal', prop: 'Summer_family_conn_meal__c' },
      { text: 'YMCA', prop: 'Summer_family_conn_ymca__c' },
      { text: 'Digital', prop: 'Summer_family_conn_digital__c' },
      { text: 'Other', prop: 'Summer_family_conn_other__c' },
    ];

    const familyConnectionJSX = (
      <div className="survey-question-container">
        <div className="mentor-met-container" key='familyConnection'>
        <label className={this.state.familyConnectionOK ? 'title' : 'title required'}>Family Connection</label><br />
        <label htmlFor="made-meeting">Did you connect with your RA student’s family this week?</label>
          <input
            type="radio"
            name="familyConn"
            value="1"
            className="inline"
            checked={this.state.familyConnectionMade === 1 ? 'checked' : ''}
            required="true"
            onChange={this.handleFamilyConnectionChange}/> Yes (+1 Character Capital)
          <input
            type="radio"
            name="familyConn"
            value="0"
            className="inline"
            checked={this.state.familyConnectionMade === 0 ? 'checked' : ''}
            requried="true"
            onChange={this.handleFamilyConnectionChange}/> No
      </div>
        { this.state.synopsisReport && this.state.synopsisReport.Summer_family_connection_made__c === 'Yes' 
          ? <React.Fragment>
              <label className={ this.state.familyConnectionStatusOK ? 'title' : 'title required'}>Connection Type:</label>
              { familyConnectionTypes.map((value, i) => {
                return (<div className="survey-question-container" key={ i }>
                  <input
                    type="checkbox"
                    name={ value.prop } 
                    onChange= { this.handleCheckboxChange }
                    checked={ (this.state.synopsisReport && this.state.synopsisReport[value.prop]) || false }/>
                  <label htmlFor={ value.prop }>{ value.text }</label>
                  </div>);
              })}
          </React.Fragment>
          : '' 
        }
        { this.state.synopsisReport && this.state.synopsisReport.Summer_family_conn_other__c
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
              cols={ 80 } />
          : ''
        }
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

    const formButtonOrMessageJSX = this.props.messageBoardUrl
      ? <h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Submit Summer Report</button>  to Student&#39;s Core Community</h5>
      : <React.Fragment>
        <h5>Waiting on Basecamp connection...</h5><p>If the submit button doesn&#39;t appear soon contact an administrator.</p>
        </React.Fragment>;

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
                { formButtonOrMessageJSX }
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
        { this.state.savedToSalesforce
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
  error: PropTypes.number,
  messageBoardUrl: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummerForm);
