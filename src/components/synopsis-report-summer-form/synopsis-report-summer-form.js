import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SynopsisReportSummerSummary from '../synopsis-report-summer-summary/synopsis-report-summer-summary';
// import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
import ImagePreviews from '../image-previews/image-previews';
import TooltipItem from '../tooltip/tooltip';
// import MultiSelect from '../multi-select/multi-select';
import * as ttText from '../../lib/tooltip-text';
import * as srActions from '../../actions/synopsis-report';
import * as msgBoardUrlActions from '../../actions/message-board-url';
import * as pl from '../../lib/pick-list-tests';
import * as errorActions from '../../actions/error';
import * as imageActions from '../../actions/images';

import './_synopsis-report-summer-form.scss';

const mapStateToProps = state => ({
  synopsisReport: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0],
  myRole: state.myProfile && state.myProfile.role,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
  bcImages: state.bcImages,
  imagePreviews: state.imagePreviews,
});

const mapDispatchToProps = dispatch => ({
  saveSynopsisReport: synopsisReport => dispatch(srActions.saveSynopsisReport(synopsisReport)),
  getMsgBoardUrl: studentEmail => dispatch(msgBoardUrlActions.getMsgBoardUrl(studentEmail)),
  clearMsgBoardUrl: () => dispatch(msgBoardUrlActions.clearMsgBoardUrl()),
  // saveSummaryToBasecamp: srSummary => dispatch(basecampActions.postSummaryToBasecamp(srSummary)),
  clearError: () => dispatch(errorActions.clearError()),
  uploadImages: imageData => dispatch(imageActions.uploadImages(imageData)),
  clearImages: () => dispatch(imageActions.clearImageSgids()),
});

class SynopsisReportSummerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;
    this.state.savedToSalesforce = false;
    this.state.waitingOnSalesforce = false;
    this.state.waitingOnImages = false;
    this.state.imagesSaved = false;
    this.state.imageUploading = false;
    this.state.mentorMadeScheduledCheckin = -1;
    this.state.questionOfTheWeek = -1;
    this.props.clearMsgBoardUrl();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.error !== prevProps.error) {
      if (this.state.waitingOnImages) {
        console.log('images saved');
        this.props.clearError();
        const { synopsisReport } = this.state;
        this.setState({
          waitingOnImages: false,
          imagesSaved: true,
          waitingOnSalesforce: true,
        });
        console.log('saveSynopsisReport after images saved');
        this.props.saveSynopsisReport({ ...synopsisReport });
      }
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
        mentorMadeScheduledCheckin: this.initRadioButtons(this.props.synopsisReport, 'Weekly_Check_In_Status__c'),
        familyConnectionMade: this.initRadioButtons(this.props.synopsisReport, 'Summer_family_connection_made__c'),
      });
      this.props.clearError();
      this.props.getMsgBoardUrl(this.props.synopsisReport.Student__r.Email);
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
    this.props.clearImages();
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.savedToSalesforce = false;
      newState.metWithMentee = true;
      newState.weeklyConnectionStatusOK = true;
      newState.studentConnectionNotesOK = true;
      newState.lastSummerCamp = this.initRadioButtons(newState.SynopsisReport, 'Summer_attended_last_camp__c');
      newState.nextSummerCamp = this.initRadioButtons(newState.SynopsisReport, 'Summer_attend_next_camp__c');
      newState.familyConnectionMade = this.initRadioButtons(newState.SynopsisReport, 'Summer_family_connection_made__c');
      newState.familyConnectionOK = true;
      newState.familyConnectionStatusOK = true;
      newState.familyConnectionNotesOK = true;
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      newState.mentorMadeScheduledCheckin = this.initRadioButtons(newState.SynopsisReport, 'Weekly_Check_In_Status__c');
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
    const metWithMentee = !!sr.Weekly_Check_In_Status__c;
    const weeklyConnectionStatusOK = (sr.Weekly_Check_In_Status__c === 'Yes'
      && (sr.Summer_conn_met__c || sr.Summer_conn_called__c || sr.Summer_conn_late_call__c || sr.Summer_conn_basecamp__c))
      || (sr.Weekly_Check_In_Status__c === 'No'
      && (sr.Summer_conn_no_answer__c || sr.Summer_conn_no_show__c || sr.Summer_conn_missed_other__c));
    const studentConnectionNotesOK = sr.Weekly_Check_In_Status__c === 'Yes'
      || !sr.Summer_conn_missed_other__c
      || (sr.Summer_conn_missed_other__c && !!sr.Summer_weekly_connection_other_notes__c);
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
      studentConnectionNotesOK,
      familyConnectionOK,
      familyConnectionStatusOK,
      familyConnectionNotesOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return metWithMentee 
      && weeklyConnectionStatusOK
      && studentConnectionNotesOK
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

    this.props.clearError();

    if (validMentorInput) { 
      if (this.props.imagePreviews) {   
        this.setState({ waitingOnImages: true });
        console.log('saving images');
        this.props.uploadImages(this.props.imagePreviews.map(preview => (preview.file))); // justs end file objects
      } else {
        console.log('no images. Saving to salesforce');   
        this.setState({ waitingOnSalesforce: true });
        this.props.saveSynopsisReport({ ...synopsisReport }); // save SR to salesforce
      }
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  handleMentorMadeScheduledCheckinChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.mentorMadeScheduledCheckin = parseInt(event.target.value, 10);
    if (newState.mentorMadeScheduledCheckin === 1) {
      newState.synopsisReport.Weekly_Check_In_Status__c = 'Yes';
      newState.synopsisReport.Summer_conn_no_answer__c = false;
      newState.synopsisReport.Summer_conn_no_show__c = false;
      newState.synopsisReport.Summer_conn_missed_other__c = false;
      newState.synopsisReport.Summer_weekly_connection_other_notes__c = '';
    } else {
      newState.synopsisReport.Weekly_Check_In_Status__c = 'No';
      newState.synopsisReport.Summer_conn_met__c = false;
      newState.synopsisReport.Summer_conn_called__c = false;
      newState.synopsisReport.Summer_conn_late_call__c = false;
      newState.synopsisReport.Summer_conn_basecamp__c = false;
    }
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
        <label className={this.state.metWithMentee ? '' : 'required'} htmlFor="made-meeting">Did you connect with your RA student this week?</label><br className="rwd-break" />
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
      { text: 'Student and I met social-distancing in-person', prop: 'Summer_conn_met__c' },
      { text: 'Student and I checked in via video call', prop: 'Summer_conn_called__c' },
      { text: 'Student and I checked in via phone call', prop: 'Summer_conn_late_call__c' },
      { text: 'We connected via Basecamp (Love that you are using Basecamp as an additional way to communicate! Keep it up!)', prop: 'Summer_conn_basecamp__c' },
    ];

    const missedCheckinValues = [
      { text: 'I was not able to reach out this week', prop: 'Summer_conn_no_answer__c' },
      { text: 'I tried reaching out but had trouble connecting', prop: 'Summer_conn_no_show__c' },
      { text: 'We did not connect for reasons explained below', prop: 'Summer_conn_missed_other__c' },
    ];

    const weeklyConnectionStatusJSX = () => {
      if (!this.state.synopsisReport) return null;
      
      if (this.state.mentorMadeScheduledCheckin !== -1) {
        return (
          <fieldset>
            <div className="mentor-met-container" key='connectionStatus'>
              <div className="mentor-met-container">
                <label className={ this.state.weeklyConnectionStatusOK ? 'title' : 'title required' }>Weekly Connection Status<TooltipItem id={'tooltip-weeklyConnection'} text={ttText.weeklyConnection}/></label>
                {this.state.mentorMadeScheduledCheckin === 1
                  ? madeCheckinValues.map((value, i) => {
                    return (<div className="survey-question-container" key={ i }>
                      <input
                        type="checkbox"
                        name={ value.prop } // oneTeamQuestion }
                        className="text-align"
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
                        className="text-align"
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
        <h6 className="title">Family Connection</h6>
        <label className={this.state.familyConnectionOK ? '' : 'required'}htmlFor="made-meeting">Did you connect with your RA student’s family this week?</label>
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
              label="Please explain selection of 'other': "
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

    const additionalCommentsForTeamJSX = (
        <div className="survey-question-container">
          <div key="additionalCommentsForTeam">
                  <TextArea
                    compClass="title"
                    compName="Summer_additional_team_comments__c"
                    label="Additional Comments for Basecamp Team"
                    value={ this.state.synopsisReport && this.state.synopsisReport.Summer_additional_team_comments__c
                      ? this.state.synopsisReport.Summer_additional_team_comments__c
                      : '' }
                    placeholder="Any points of importance, fun facts, or further details to share with your student's Basecamp Team?"
                    onChange={ this.handleTextAreaChange }
                    rows={ 2 }
                    cols={ 80 }
                  />
          </div>
        </div>
    );

    const whatsBeenHappeningJSX = (
        <div className="survey-question-container">
          <div key="whatsBeenHappening">
                  <TextArea
                    compClass="title"
                    compName="Whats_been_happening__c"
                    label="What's Been Happening"
                    value={ this.state.synopsisReport && this.state.synopsisReport.Whats_been_happening__c
                      ? this.state.synopsisReport.Whats_been_happening__c
                      : '' }
                    placeholder="What's been happening this week?"
                    onChange={ this.handleTextAreaChange }
                    rows={ 2 }
                    cols={ 80 }
                  />
          </div>
        </div>
    );

    const onlineSchoolUpdateJSX = (
        <div className="survey-question-container">
          <div key="onlineSchoolUpdate">
                  <TextArea
                    compClass="title"
                    compName="Online_School_Update__c"
                    label="Online School Update"
                    value={ this.state.synopsisReport && this.state.synopsisReport.Online_School_Update__c
                      ? this.state.synopsisReport.Online_School_Update__c
                      : '' }
                    placeholder="Provide an update on how online school is going for your mentee."
                    onChange={ this.handleTextAreaChange }
                    rows={ 2 }
                    cols={ 80 }
                  />
          </div>
        </div>
    );

    const mentorSupportRequestJSX = (
      <div className="container">
        <div className="row ms-select">
          <div className="request-prompt-container">
            <span className={ this.state.mentorSupportRequestOK ? '' : 'required'}>Do you need additional support? (This response goes directly to RA Staff only.)</span>
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
              value={ (this.state.synopsisReport && this.state.synopsisReport.Mentor_Support_Request_Notes__c) || ''}
              onChange={ this.handleTextAreaChange }
              rows={ 2 }
              cols={ 80 } />
          : null
        }
        </div>
      </div>
    );

    const formButtonOrMessage = () => {
      if (this.props.messageBoardUrl) {
        return (<h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Submit Report</button>  to Student&#39;s Core Community</h5>);
      }
      if (this.props.error) {
        return (<React.Fragment><h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Save to Salesforce</button></h5><p>(There&#39;s an issue retrieving Basecamp info. Please alert an administrator.</p></React.Fragment>);
      }
      return (<React.Fragment>
      <h5>Waiting on Basecamp connection...</h5><p>If the submit button doesn&#39;t appear soon contact an administrator.</p>
      </React.Fragment>);
    };

    const synopsisReportForm = this.props.synopsisReport
      ? (
      <div className="points-tracker panel point-tracker-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">SYNOPSIS REPORT</h5>
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
                { familyConnectionJSX }
                { whatsBeenHappeningJSX }
                { onlineSchoolUpdateJSX }
                { additionalCommentsForTeamJSX }
                <ImagePreviews />
                <div className="modal-footer">
                { mentorSupportRequestJSX }
                { formButtonOrMessage() }
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
  clearImages: PropTypes.func,
  uploadImages: PropTypes.func,
  imagePreviews: PropTypes.any,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportSummerForm);
