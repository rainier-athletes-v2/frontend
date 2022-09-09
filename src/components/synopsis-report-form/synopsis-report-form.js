import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
import DropDown from '../drop-down/drop-down';
import { TextArea, textAreaMax } from '../text-area/text-area';
import ImagePreviews from '../image-previews/image-previews';
import * as srActions from '../../actions/synopsis-report';
import * as errorActions from '../../actions/error';
import * as imageActions from '../../actions/images';

import './_synopsis-report-form.scss';

const mapStateToProps = state => ({
  synopsisReport: state.synopsisReport && state.synopsisReport.records && state.synopsisReport.records[0],
  myRole: state.myProfile.role,
  messageBoardUrl: state.messageBoardUrl,
  error: state.error,
  bcImages: state.bcImages,
  imagePreviews: state.imagePreviews,
  pickListFieldValues: state.pickListFieldValues,
  projectCount: state.bcProjects.projects.length,
  projectIdx: state.bcProjects.idx,
  projectScanState: state.bcProjects.loadState,
});

const mapDispatchToProps = dispatch => ({
  saveSynopsisReport: synopsisReport => dispatch(srActions.saveSynopsisReport(synopsisReport)),
  clearError: () => dispatch(errorActions.clearError()),
  uploadImages: imageData => dispatch(imageActions.uploadImages(imageData)),
  clearImages: () => dispatch(imageActions.clearImageSgids()),
});

class SynopsisReportForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.synopsisReport = this.props.synopsisReport;
    this.state.waitingOnImages = false;
    this.state.imagesSaved = false;
    this.state.savedToSalesforce = false;
    this.state.waitingOnSalesforce = false;
    this.state.salesforceErrorStatus = 0;
    this.state.waitingOnBasecamp = !this.props.messageBoardUrl;
    this.state.basecampErrorStatus = 0;
    this.state.imageUploading = false;
  }

  componentDidMount = () => {
    this.props.clearImages();
    this.setState((prevState) => {
      const newState = { ...prevState };
      newState.synopsisSaved = false;
      newState.weeklyCheckinStatusOK = true;
      newState.metWithMentee = true;
      newState.checkinStatusMetOK = true;
      newState.commStatusMetOK = true;
      newState.commStatusDidNotMeetOK = true;
      newState.commMethodNoCheckinOK = true;
      newState.howSupportRequiredOK = true;
      newState.howSupportOK = true;
      newState.commNoResponseOK = true;
      newState.metWithFamilyOK = true;
      newState.metWithTeacherOK = true;
      newState.metWithCoachOK = true;
      newState.identityStatusOK = true;
      newState.identityTopicOK = true;
      newState.identityHighlightsOK = true;
      newState.identityJournalStatusOK = true;
      newState.msSelfReflectionOK = true;
      newState.esSelfReflectionOK = true;
      newState.msTeacherConvoOK = true;
      newState.esTeacherConvoOK = true;
      newState.identityJournaltMissedReasonOK = true;
      newState.identityJournalStatusNotesOK = true;
      newState.ijAndTeacherConvoOK = true;
      newState.sportsUpdateOK = true;
      newState.ijImageOK = true;
      newState.mentorSupportRequestOK = true;
      newState.mentorSupportRequestNotesOK = true;
      return newState;
    });
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.error !== prevProps.error) {
      if (this.state.waitingOnBasecamp) {
        this.setState({
          waitingOnBasecamp: false,
          basecampErrorStatus: this.props.error,
        });
        this.props.clearError();
      }
      if (this.state.waitingOnImages) {
        this.props.clearError();
        const { synopsisReport } = this.state;
        this.setState({
          waitingOnImages: false,
          imagesSaved: true,
          waitingOnSalesforce: true,
        });
        this.props.saveSynopsisReport({ ...synopsisReport });
      }
      if (this.state.waitingOnSalesforce) {
        this.props.clearError();
        this.setState({
          waitingOnSalesforce: false,
          savedToSalesforce: true,
          salesforceErrorStatus: this.props.error,
        });
      }
    }
    if (this.props.synopsisReport !== prevProps.synopsisReport) {
      this.props.clearError();
      this.setState({ 
        synopsisReport: { ...this.props.synopsisReport },
        studentGrade: this.props.synopsisReport.Student__r.Student_Grade__c,
        waitingOnBasecamp: !this.props.messageBoardUrl,
      });
    }
    if (this.props.messageBoardUrl !== prevProps.messageBoardUrl) {
      this.setState({ waitingOnBasecamp: !this.props.messageBoardUrl });
    }
  }

  handleSimpleFieldChange = (event, maxStringLength = 0) => {
    const { name, value } = event.target;
    const newState = { ...this.state };
    newState.synopsisReport[name] = maxStringLength ? value.slice(0, maxStringLength) : value;
    return this.setState(newState);
  }

  handleTextAreaChange = (event) => {
    event.persist();
    this.handleSimpleFieldChange(event, textAreaMax);
  }

  srSafe = prop => !!(this.state.synopsisReport && this.state.synopsisReport[prop]);

  notEmpty = prop => this.srSafe(prop) && !!this.state.synopsisReport[prop] && this.state.synopsisReport[prop] !== 'X';


  validMentorInput = (sr) => {
    const met = sr.Weekly_Check_In_Status__c === 'Met';
    const metWithMentee = !!sr.Weekly_Check_In_Status__c;
    const didNotMeet = sr.Weekly_Check_In_Status__c === 'Did not meet';
    const emptyCheckinStatus = !this.notEmpty('Weekly_Check_In_Status__c');
    const weeklyCheckinStatusOK = this.notEmpty('Weekly_Check_In_Status__c');
    const checkinStatusMetOK = emptyCheckinStatus || didNotMeet || (met && this.notEmpty('Check_in_status_met__c'));
    const commStatusMetOK = emptyCheckinStatus || didNotMeet || (met && this.notEmpty('Communication_Status_Met__c'));
    const commStatusDidNotMeetOK = emptyCheckinStatus || met || (didNotMeet && this.notEmpty('Did_not_meet_communication__c'));
    const commMethodNoCheckinOK = emptyCheckinStatus || met
      || sr.Did_not_meet_communication__c !== 'I communicated with the student and/or family but we weren’t able to have a check in'
      || (sr.Did_not_meet_communication__c === 'I communicated with the student and/or family but we weren’t able to have a check in'
      && this.notEmpty('Communication_Method_No_Check_In__c'));
    const commNoResponseOK = sr.Communication_Method_No_Check_In__c !== 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff'
      || (sr.Communication_Method_No_Check_In__c === 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff'
      && this.notEmpty('Communication_Method_No_Response__c'));
    const howSupportRequiredOK = met
      || sr.Did_not_meet_communication__c !== 'I did not connect with student and/or family for other reasons explained below'
      || (sr.Weekly_Check_In_Status__c === 'Did not meet'
      && sr.Communication_Method_No_Check_In__c === 'I did not connect with student and/or family for other reasons explained below'
      && this.notEmpty('How_can_we_support_comm_required__c'));
    const howSupportOK = sr.Communication_Method_No_Response__c !== 'I did not connect with student and/or family for reasons explained below'
      || (sr.Communication_Method_No_Check_In__c === 'I tried reaching out to student and family and did not hear back, and then I reached out to RA Staff' 
      && sr.Communication_Method_No_Response__c === 'I did not connect with student and/or family for reasons explained below'
      && this.notEmpty('How_can_we_support__c'));

    const metWithFamilyOK = this.notEmpty('Family_Connection__c');
    const metWithTeacherOK = this.notEmpty('Teacher_Connection__c');
    const metWithCoachOK = this.notEmpty('Coach_Connection__c');

    const emptyIdStatement = !this.notEmpty('Identity_Statement_Weekly_Status__c');
    const idNo = sr.Identity_Statement_Weekly_Status__c === 'No';
    const identityStatusOK = this.notEmpty('Identity_Statement_Weekly_Status__c');
    const identityTopicOK = emptyIdStatement || idNo || this.notEmpty('Identity_Statement_Topic__c');
    const identityHighlightsOK = emptyIdStatement || idNo || this.notEmpty('Identity_Statement_Highlights__c');

    const emptyIJStatus = !this.notEmpty('Identity_Journal_Status__c');
    const ijTurnedIn = sr.Identity_Journal_Status__c === 'Turned in';
    const ijNotTurnedIn = sr.Identity_Journal_Status__c === 'Not turned in';
    const ijMs = this.state.studentGrade > 5;
    const ijEs = this.state.studentGrade <= 5;
    const identityJournalStatusOK = this.notEmpty('Identity_Journal_Status__c');
    const msSelfReflectionOK = emptyIJStatus || ijNotTurnedIn || ijEs
      || (ijMs && this.notEmpty('Identity_Journal_MS_Self_Reflection__c'));
    const esSelfReflectionOK = emptyIJStatus || ijNotTurnedIn || ijMs
      || (ijEs && this.notEmpty('Identity_Journal_ES_Self_Reflection__c'));
    const msTeacherConvoOK = emptyIJStatus || ijEs || ijNotTurnedIn
      || (ijMs && ijTurnedIn && this.notEmpty('Identity_Journal_Teacher_Convo_MS__c')); 
    const esTeacherConvoOK = emptyIJStatus || ijMs || ijNotTurnedIn
      || (ijEs && ijTurnedIn && this.notEmpty('Identity_Journal_Teacher_Convo_ES__c')); 
    const identityJournaltMissedReasonOK = emptyIJStatus || ijTurnedIn
      || (ijNotTurnedIn && this.notEmpty('No_Identity_Journal__c'));
    const identityJournalStatusNotesOK = emptyIJStatus || ijTurnedIn
      || (ijNotTurnedIn && sr.No_Identity_Journal__c !== 'Other')
      || (ijNotTurnedIn && sr.No_Identity_Journal__c === 'Other' && this.notEmpty('No_Identity_Journal_What_Happened__c'));
    const ijAndTeacherConvoOK = this.notEmpty('Identity_Journal_and_Teacher_Convo__c');

    const sportsUpdateOK = this.notEmpty('Weekly_Sports_and_Activities_Update__c');

    const ijImageOK = sr.Identity_Journal_Status__c === 'Not turned in'
      || (sr.Identity_Journal_Status__c === 'Turned in' && !!(this.props.imagePreviews && this.props.imagePreviews.length));
      // || (sr.Identity_Journal_Status__c === 'Turned in' && this.notEmpty('Missing_Identity_Journal_Image__c'));

    const mentorSupportRequestOK = this.notEmpty('Mentor_Support_Request__c');
    const mentorSupportRequestNotesOK = sr.Mentor_Support_Request__c === 'No' 
      || (sr.Mentor_Support_Request__c !== 'No' && this.notEmpty('Mentor_Support_Request_Notes__c'));

    this.setState({
      metWithMentee,
      weeklyCheckinStatusOK,
      checkinStatusMetOK,
      commStatusMetOK,
      commStatusDidNotMeetOK,
      commMethodNoCheckinOK,
      howSupportRequiredOK,
      howSupportOK,
      commNoResponseOK,
      metWithFamilyOK,
      metWithTeacherOK,
      metWithCoachOK,
      identityStatusOK,
      identityTopicOK,
      identityHighlightsOK,
      identityJournalStatusOK,
      msSelfReflectionOK,
      esSelfReflectionOK,
      msTeacherConvoOK,
      esTeacherConvoOK,
      identityJournaltMissedReasonOK,
      identityJournalStatusNotesOK,
      ijAndTeacherConvoOK,
      sportsUpdateOK,
      ijImageOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return metWithMentee
      && weeklyCheckinStatusOK 
      && checkinStatusMetOK
      && commStatusMetOK 
      && commStatusDidNotMeetOK
      && commMethodNoCheckinOK
      && howSupportRequiredOK
      && howSupportOK
      && commNoResponseOK
      && metWithFamilyOK
      && metWithTeacherOK
      && metWithCoachOK
      && identityStatusOK
      && identityTopicOK
      && identityHighlightsOK
      && identityJournalStatusOK
      && msSelfReflectionOK
      && esSelfReflectionOK
      && msTeacherConvoOK
      && esTeacherConvoOK
      && identityJournaltMissedReasonOK
      && identityJournalStatusNotesOK
      && ijAndTeacherConvoOK
      && sportsUpdateOK
      && ijImageOK
      && mentorSupportRequestOK
      && mentorSupportRequestNotesOK;
  }

  handleFullReportSubmit = (event) => {
    event.preventDefault();
    const { synopsisReport } = this.state;
    const validMentorInput = this.validMentorInput(synopsisReport);
    this.props.clearError();

    if (validMentorInput) {
      synopsisReport.Synopsis_Report_Status__c = 'Completed';
      if (this.props.imagePreviews) {   
        this.setState({ waitingOnImages: true });
        this.props.uploadImages(this.props.imagePreviews.map(preview => (preview.file))); // just send file objects
      } else {
        this.setState({ waitingOnSalesforce: true });
        this.props.saveSynopsisReport({ ...synopsisReport });
      }
    } else {
      alert('Please provide required information before submitting full report.'); // eslint-disable-line
    }
  }

  handleImageUpload = (event) => {
    const errs = []; 
    const files = Array.from(event.target.files);

    const types = ['image/png', 'image/jpeg', 'image/gif'];

    files.forEach((file) => {
      if (types.every(type => file.type !== type)) {
        errs.push(`'${file.type}' is not a supported format`);
      }
    });

    if (errs.length) {
      return alert(errs[0]);
    }

    if (files.length > 0) {
      this.setState({ inputImageLabelText: `${files.length} file(s) selected` });
    }

    this.setState({ imageUploading: true });
    
    this.props.uploadImages(files);

    return 1;
  }

  handleMentorMadeScheduledCheckinChange = (event) => {
    const newState = Object.assign({}, this.state);
    newState.mentorMadeScheduledCheckin = event.target.value === 'Met' ? 1 : 0;
    if (newState.mentorMadeScheduledCheckin === 1) {
      newState.synopsisReport.Weekly_Check_In_Status__c = 'Met';
      newState.synopsisReport.Did_not_meet_communication__c = false;
      newState.synopsisReport.How_can_we_support_comm__c = '';
      newState.synopsisReport.How_can_we_support_comm_required__c = '';
      newState.synopsisReport.Communication_Method_No_Check_In__c = false;
      newState.synopsisReport.Communication_Method_No_Response__c = false;
    } else {
      newState.synopsisReport.Weekly_Check_In_Status__c = 'Did not meet';
      newState.synopsisReport.Check_in_status_met__c = false;
      newState.synopsisReport.Communication_Status_Met__c = false;
    }
    this.setState(newState);
  }

  render() {
    const headerJSX = (
      <div className="row">
        <div className="col-md-6">
          <span className="title">Student</span>
          <span className="name">{ this.state.synopsisReport && this.state.synopsisReport.Student__r.Name }</span>
        </div>
        <div className="col-md-6">
          <span className="title">Reporting Period</span>
          <span className="name">{`${this.state.synopsisReport && this.state.synopsisReport.Week__c}`}</span>
        </div>
        <div className="title">
          <h5>WEEKLY CHECK IN AND COMMUNICATION</h5>
        </div>
      </div>
    );

    const mentorMadeScheduledCheckinJSX = (
      <fieldset>
      <div className="mentor-met-container" key='mentorMadeCheckin'>
        <React.Fragment>
          <div className="mentor-met-container" key='mentorMadeCheckin'>
          <label className={this.state.metWithMentee ? '' : 'required'} htmlFor="made-meeting">Did you meet with your student?</label><br className="rwd-break" />
          <input
            type="radio"
            name="made-meeting"
            value="Met"
            className={this.state.weeklyCheckinStatusOK ? 'inline' : 'inline required'}
            checked={this.state.synopsisReport && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Met' ? 'checked' : ''}
            required="required"
            onChange={this.handleMentorMadeScheduledCheckinChange}/> Yes
          <input
            type="radio"
            name="made-meeting"
            value="Did not meet"
            className={this.state.weeklyCheckinStatusOK
              || this.notEmpty('Weekly_Check_In_status__c') ? 'inline' : 'inline required'}
            checked={this.state.synopsisReport && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Did not meet' ? 'checked' : ''}
            requried="required"
            onChange={this.handleMentorMadeScheduledCheckinChange}/> No
          </div>
        </React.Fragment>
          { this.notEmpty('Weekly_Check_In_Status__c') && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Met' 
            ? <div className="survey-question-container">
                <DropDown
                  compName="Check_in_status_met__c"
                  value={ this.srSafe('Check_in_status_met__c') ? this.state.synopsisReport.Check_in_status_met__c : undefined }
                  valueClass={this.state.checkinStatusMetOK || this.notEmpty('Check_in_status_met__c') ? '' : 'required'}
                  onChange={ this.handleSimpleFieldChange }
                  options={this.props.pickListFieldValues.Check_in_status_met__c.values}
                />
              </div>
            : '' }
          { this.notEmpty('Weekly_Check_In_Status__c') 
            && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Met'
            && this.notEmpty('Check_in_status_met__c')
            ? <div className="survey-question-container">
                <DropDown
                  compName="Communication_Status_Met__c"
                  value={ this.srSafe('Communication_Status_Met__c') ? this.state.synopsisReport.Communication_Status_Met__c : undefined }
                  valueClass={this.state.commStatusMetOK || this.notEmpty('Communication_Status_Met__c') ? '' : 'required'}
                  onChange={ this.handleSimpleFieldChange }
                  options={this.props.pickListFieldValues.Communication_Status_Met__c.values}
                />
              </div>
            : '' }
          { this.notEmpty('Weekly_Check_In_Status__c') 
            && this.state.synopsisReport.Weekly_Check_In_Status__c === 'Did not meet' 
            ? <div className="survey-question-container">
                <DropDown
                  compName="Did_not_meet_communication__c"
                  value={ this.srSafe('Did_not_meet_communication__c') ? this.state.synopsisReport.Did_not_meet_communication__c : undefined }
                  valueClass={this.state.commStatusDidNotMeetOK || this.notEmpty('Did_not_meet_communication__c') ? '' : 'required'}
                  onChange={ this.handleSimpleFieldChange }
                  options={this.props.pickListFieldValues.Did_not_meet_communication__c.values}
                />
              </div>
            : '' }
            { this.notEmpty('Did_not_meet_communication__c') 
              && this.state.synopsisReport.Did_not_meet_communication__c === 'I did not connect with student and/or family for other reasons explained below' 
               && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
              ? <div className="survey-question-container"> 
                <TextArea
                  compClass={ this.state.howSupportRequiredOK || this.notEmpty('How_can_we_support_comm_required__c') ? 'title' : 'title required' }
                  compName="How_can_we_support_comm_required__c"
                  label="Additional Notes (Required)"
                  value={ this.srSafe('How_can_we_support_comm_required__c') ? this.state.synopsisReport.How_can_we_support_comm_required__c : undefined }
                  onChange={ this.handleTextAreaChange }
                  placeholder="Please provide any additional context to RA staff in order to help inform how we can best support"
                />
                </div>
              : '' }
            { this.notEmpty('Did_not_meet_communication__c')  
              && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
              && this.state.synopsisReport.Did_not_meet_communication__c !== 'I did not connect with student and/or family for other reasons explained below'
              ? <div className="survey-question-container"> 
              <TextArea
                compClass="title"
                compName="How_can_we_support_communication__c"
                label="Additional Notes (Optional)"
                value={ this.srSafe('How_can_we_support_communication__c') ? this.state.synopsisReport.How_can_we_support_communication__c : undefined }
                onChange={ this.handleTextAreaChange }
                placeholder="Please provide any additional context to RA staff in order to help inform how we can best support"
              />
              </div>
              : '' }
          { this.notEmpty('Did_not_meet_communication__c')
            && this.state.synopsisReport.Did_not_meet_communication__c === 'I communicated with the student and/or family but we weren’t able to have a check in' 
            && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
            ? <div className="survey-question-container">
                <DropDown
                  compName="Communication_Method_No_Check_In__c"
                  value={ this.srSafe('Communication_Method_No_Check_In__c') ? this.state.synopsisReport.Communication_Method_No_Check_In__c : undefined }
                  valueClass={this.state.commMethodNoCheckinOK || this.notEmpty('Communication_Method_No_Check_In__c') ? '' : 'required'}
                  onChange={ this.handleSimpleFieldChange }
                  options={this.props.pickListFieldValues.Communication_Method_No_Check_In__c.values}
                />
              </div>
            : '' }
      </div>
      </fieldset>
    );

    const oneTeamJSX = (
      <React.Fragment>
        <div className="title">
            <h5>ONE TEAM CONNECTIONS</h5>
        </div>
        <div>
            <p>(Connecting with your student’s core community is ONE Team in action! Please let RA staff know who you were able to connect with over the past week.)</p>
        </div>
        <fieldset>
          <div className="mentor-met-container">
            <DropDown
              compName="Family_Connection__c"
              label="Family Connection"
              value={ this.srSafe('Family_Connection__c')
                ? this.state.synopsisReport.Family_Connection__c
                : ''}
              valueClass={this.state.metWithFamilyOK || this.notEmpty('Family_Connection__c') ? '' : 'required'}
              onChange={ this.handleSimpleFieldChange}
              options={this.props.pickListFieldValues.Family_Connection__c.values}
            />
            <DropDown
              compName="Teacher_Connection__c"
              label="Teacher Connection"
              value={this.srSafe('Teacher_Connection__c')
                ? this.state.synopsisReport.Teacher_Connection__c
                : ''}
              valueClass={this.state.metWithTeacherOK || this.notEmpty('Teacher_Connection__c') ? '' : 'required'}
              onChange={ this.handleSimpleFieldChange}
              options={this.props.pickListFieldValues.Teacher_Connection__c.values}
            />
            <DropDown
              compName="Coach_Connection__c"
              label="Coach Connection"
              value={this.srSafe('Coach_Connection__c')
                ? this.state.synopsisReport.Coach_Connection__c
                : ''}
              valueClass={this.state.metWithCoachOK || this.notEmpty('Coach_Connection__c') ? '' : 'required'}
              onChange={ this.handleSimpleFieldChange}
              options={this.props.pickListFieldValues.Coach_Connection__c.values}
            />
          </div>
        </fieldset>
      </React.Fragment>
    );

    const identityStatementJSX = (
      <React.Fragment>
        <div className="title">
            <h5>IDENTITY STATEMENT EXPLORATION</h5>
        </div>
        <div>
          <p>Identity Statement Exploration is Self-Discovery in action! Statements will be added throughout the school year onto the top of each student&apos;s Identity Journal based on your discussions. The statements will change over the year as your topics of conversation change, focusing at first on the Introduction &amp; Values topic, then changing to the Community topic, then Race &amp; Ethnicity and so on.</p>
        </div>
        <div className="survey-question-container">
          <DropDown
            compName="Identity_Statement_Weekly_Status__c"
            value={this.srSafe('Identity_Statement_Weekly_Status__c')
              ? this.state.synopsisReport.Identity_Statement_Weekly_Status__c
              : ''}
            valueClass={this.state.identityStatusOK || this.notEmpty('Identity_Statement_Weekly_Status__c') ? '' : 'required'}
            onChange={ this.handleSimpleFieldChange}
            options={this.props.pickListFieldValues.Identity_Statement_Weekly_Status__c.values}
          />
        </div>
        { this.notEmpty('Identity_Statement_Weekly_Status__c') 
            && this.state.synopsisReport.Identity_Statement_Weekly_Status__c === 'Yes' 
          ? <div className="survey-question-container">
            <DropDown
              compName="Identity_Statement_Topic__c"
              value={this.srSafe('Identity_Statement_Topic__c')
                ? this.state.synopsisReport.Identity_Statement_Topic__c
                : ''}
              valueClass={this.state.identityTopicOK || this.notEmpty('Identity_Statement_Topic__c') ? '' : 'required'}
              onChange={ this.handleSimpleFieldChange}
              options={this.props.pickListFieldValues.Identity_Statement_Topic__c.values}
            />
            </div>
          : '' }
        { this.notEmpty('Identity_Statement_Weekly_Status__c')
            && this.state.synopsisReport.Identity_Statement_Weekly_Status__c === 'No' 
          ? <div className="survey-question-container">
            <TextArea
                compClass="title"
                compName="Identity_Statement_Why_Not__c"
                label="Why not?"
                value={ this.srSafe('Identity_Statement_Why_Not__c')
                  ? this.state.synopsisReport.Identity_Statement_Why_Not__c
                  : '' }
                onChange={ this.handleTextAreaChange }
                placeholder="Optional..."
              />
            </div>
          : '' }
        { this.notEmpty('Identity_Statement_Weekly_Status__c')
          && this.state.synopsisReport.Identity_Statement_Weekly_Status__c === 'Yes'
          && this.notEmpty('Identity_Statement_Topic__c')
          ? <div className="survey-question-container">
            <TextArea
                compClass={this.state.identityHighlightsOK
                && this.state.synopsisReport.Identity_Statement_Weekly_Status__c === 'Yes' ? 'title' : 'title required'}
                compName="Identity_Statement_Highlights__c"
                label="Identity Statement Highlights (Required)"
                value={ this.srSafe('Identity_Statement_Highlights__c')
                  ? this.state.synopsisReport.Identity_Statement_Highlights__c
                  : '' }
                onChange={ this.handleTextAreaChange }
                placeholder="What did your mentee share on this topic that they are open to sharing with their core community on their Identity Journal and over Basecamp?"
              />
          </div>
          : '' }
          { this.notEmpty('Identity_Statement_Weekly_Status__c')
          && this.state.synopsisReport.Identity_Statement_Weekly_Status__c === 'Yes'
          && this.notEmpty('Identity_Statement_Topic__c')
            ? <React.Fragment><div>
              <p>Your mentee might not be comfortable sharing all the same details with their core community that they share with you. Talk to them about what they are ready to share in order to continue working towards showing up as their authentic selves across their community.</p>
              </div>
              <div className="survey-question-container">
              <TextArea
                  compClass='title'
                  compName="Identity_Statement_Notes__c"
                  label="Identity Statement Notes (Optional)"
                  value={ this.srSafe('Identity_Statement_Notes__c')
                    ? this.state.synopsisReport.Identity_Statement_Notes__c
                    : '' }
                  onChange={ this.handleTextAreaChange }
                  placeholder="Please add any other notes that your mentee is not yet open to sharing with their core community."
                />
              </div></React.Fragment>
            : '' }
      </React.Fragment>
    );

    const { studentGrade } = this.state;

    const identityJournalJSX = (
      <fieldset>
        <div className="title">
          <h5>IDENTITY JOURNAL AND TEACHER CONVERSATIONS</h5>
        </div>
        <div className="mentor-met-container">
          <DropDown
            compName="Identity_Journal_Status__c"
            value={this.srSafe('Identity_Journal_Status__c')
              ? this.state.synopsisReport.Identity_Journal_Status__c
              : undefined}
            valueClass={this.state.identityJournalStatusOK || this.notEmpty('Identity_Journal_Status__c') ? '' : 'required'}
            onChange={ this.handleSimpleFieldChange}
            options={this.props.pickListFieldValues.Identity_Journal_Status__c.values}
          />
          {studentGrade > 5 && this.notEmpty('Identity_Journal_Status__c')
            && this.state.synopsisReport.Identity_Journal_Status__c === 'Turned in' 
            ? <DropDown
                compName="Identity_Journal_MS_Self_Reflection__c"
                value={this.srSafe('Identity_Journal_MS_Self_Reflection__c')
                  ? this.state.synopsisReport.Identity_Journal_MS_Self_Reflection__c
                  : undefined}
                valueClass={this.state.msSelfReflectionOK || this.notEmpty('Identity_Journal_MS_Self_Reflection__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Identity_Journal_MS_Self_Reflection__c.values}
              /> 
            : ''}
          {studentGrade <= 5 && this.notEmpty('Point_Sheet_Status__c')
            && this.state.synopsisReport.Identity_Journal_Status__c === 'Turned in'
            ? <DropDown
                compName="Identity_Journal_ES_Self_Reflection__c"
                value={this.srSafe('Identity_Journal_ES_Self_Reflection__c')
                  ? this.state.synopsisReport.Identity_Journal_ES_Self_Reflection__c
                  : undefined}
                valueClass={this.state.esSelfReflectionOK || this.notEmpty('Identity_Journal_ES_Self_Reflection__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Identity_Journal_ES_Self_Reflection__c.values}
              /> 
            : ''}
          {studentGrade > 5 && this.notEmpty('Identity_Journal_Status__c')
            && this.state.synopsisReport.Identity_Journal_Status__c === 'Turned in'
            && this.notEmpty('Identity_Journal_MS_Self_Reflection__c')
            ? <DropDown
                compName="Identity_Journal_Teacher_Convo_MS__c"
                value={this.srSafe('Identity_Journal_Teacher_Convo_MS__c')
                  ? this.state.synopsisReport.Identity_Journal_Teacher_Convo_MS__c
                  : undefined}
                valueClass={this.state.msTeacherConvoOK || this.notEmpty('Identity_Journal_Teacher_Convo_MS__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Identity_Journal_Teacher_Convo_MS__c.values}
              /> 
            : ''}
          {studentGrade <= 5 && this.notEmpty('Identity_Journal_Status__c')
            && this.state.synopsisReport.Identity_Journal_Status__c === 'Turned in'
            && this.notEmpty('Identity_Journal_ES_Self_Reflection__c')
            ? <DropDown
                compName="Identity_Journal_Teacher_Convo_ES__c"
                value={this.srSafe('Identity_Journal_Teacher_Convo_ES__c')
                  ? this.state.synopsisReport.Identity_Journal_Teacher_Convo_ES__c
                  : undefined}
                valueClass={this.state.esTeacherConvoOK || this.notEmpty('Identity_Journal_Teacher_Convo_ES__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Identity_Journal_Teacher_Convo_ES__c.values}
              /> 
            : ''}
          {this.notEmpty('Identity_Journal_Status__c') && this.state.synopsisReport.Identity_Journal_Status__c === 'Not turned in'
            ? <DropDown
                compName="No_Identity_Journal__c"
                value={this.srSafe('No_Identity_Journal__c')
                  ? this.state.synopsisReport.No_Identity_Journal__c
                  : undefined}
                valueClass={this.state.identityJournaltMissedReasonOK || this.notEmpty('No_Identity_Journal__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.No_Identity_Journal__c.values}
              /> 
            : ''}
            { this.notEmpty('Identity_Journal_Status__c') 
              && this.state.synopsisReport.Identity_Journal_Status__c === 'Not turned in' 
              && this.notEmpty('No_Identity_Journal__c') 
              && this.state.synopsisReport.No_Identity_Journal__c === 'Other'
              ? <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.identityJournalStatusNotesOK || this.notEmpty('No_Identity_Journal_What_Happened__c') ? '' : 'required'}`}
                    compName="No_Identity_Journal_What_Happened__c"
                    label="What happened?"
                    value={ this.srSafe('No_Identity_Journal_What_Happened__c')
                      ? this.state.synopsisReport.No_Identity_Journal_What_Happened__c
                      : undefined }
                    placeholder="Required..."
                    onChange={ this.handleTextAreaChange }
                    rows={ 3 }
                    cols={ 80 }
                  />
                </div>
              : '' }
            { this.notEmpty('Identity_Journal_Status__c')
            && (this.notEmpty('Identity_Journal_ES_Self_Reflection__c') || this.notEmpty('Identity_Journal_MS_Self_Reflection__c'))
            && (this.notEmpty('Identity_Journal_Teacher_Convo_ES__c') || this.notEmpty('Identity_Journal_Teacher_Convo_MS__c')) 
              ? <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.ijAndTeacherConvoOK || this.notEmpty('Identity_Journal_and_Teacher_Convo__c') ? '' : 'required'}`}
                    compName="Identity_Journal_and_Teacher_Convo__c"
                    label="Identity Journal and Teacher Conversations Update (Required)"
                    value={ this.srSafe('Identity_Journal_and_Teacher_Convo__c')
                      ? this.state.synopsisReport.Identity_Journal_and_Teacher_Convo__c
                      : undefined }
                    placeholder="Explain highlights from your discussion and especially regarding Identity Journal self-reflection and teacher conversations"
                    onChange={ this.handleTextAreaChange }
                    rows={ 3 }
                    cols={ 80 }
                  />
                </div>
              : ''}
        </div>
    </fieldset>
    );

    const sportsUpdateJSX = (
      <fieldset>
        <div className="title">
          <h5>SPORTS &amp; ACTIVITIES UPDATE</h5>
        </div>
        <div className="mentor-met-container">
          <DropDown
            compName="Weekly_Sports_and_Activities_Update__c"
            value={this.srSafe('Weekly_Sports_and_Activities_Update__c')
              ? this.state.synopsisReport.Weekly_Sports_Update__c
              : undefined}
              valueClass={this.state.sportsUpdateOK || this.notEmpty('Weekly_Sports_and_Activities_Update__c') ? '' : 'required'}
            onChange={ this.handleSimpleFieldChange}
            options={this.props.pickListFieldValues.Weekly_Sports_and_Activities_Update__c.values}
          />
          <div className="survey-question-container">
            <TextArea
              compClass="title"
              compName="Sports_and_Activities_Update__c"
              label="Sports &amp; Activities Update (Optional):"
              value={ this.srSafe('Sports_and_Activities_Update__c')
                ? this.state.synopsisReport.Sports_and_Activities_Update__c
                : undefined }
              onChange={ this.handleTextAreaChange }
              placeholder="Explain highlights from your conversation and especially the student&apos;s progress in sports and activities related goals discussed last week."
              rows={ 3 }
              cols={ 80 }
            />
          </div>
        </div>
      </fieldset>
    );

    const additionalCommentsJSX = (
      <fieldset>
        <div className="title">
          <h5>ADDITIONAL COMMENTS AND SUPPORT</h5>
        </div>
        <div className="mentor-met-container">
            <TextArea
              compClass="title"
              compName="Additional_Comments__c"
              label="Additional Comments to inform the core community (Optional)"
              value={ this.srSafe('Additional_Comments__c')
                ? this.state.synopsisReport.Additional_Comments__c
                : undefined }
              onChange={ this.handleTextAreaChange }
              placeholder="Explain highlights from your conversation and especially the student&apos;s progress in non-school related goals discussed last week."
              rows={ 3 }
              cols={ 80 }
            />
        </div>
      </fieldset>
    );

    const imageUploadJSX = (
      <React.Fragment>
        <div>
          <h5 className={ this.state.ijImageOK ? '' : 'required' }>IDENTITY JOURNAL AND IMAGE UPLOAD</h5>
          <p>Bring your check-in to life! Add a picture of your mentee&apos;s Identity Journal if they turned one in this week. Option to also add a picture of your mentee, yourself, or images that share the hightlights of your check-in.</p>
        </div>
        <ImagePreviews labelText="Upload Images" />
        {/* { !this.state.ijImageOrReasonOK || this.notEmpty('Missing_Point_Sheet_Image__c')
          ? <div className="mentor-met-container">
              <TextArea
                compClass={ this.state.psImageOrReasonOK || this.notEmpty('Missing_Point_Sheet_Image__c') ? 'title' : 'title required' }
                compName="Missing_Point_Sheet_Image__c"
                label="If no point sheet image, please explain:"
                value={ this.srSafe('Missing_Point_Sheet_Image__c')
                  ? this.state.synopsisReport.Missing_Point_Sheet_Image__c
                  : undefined }
                onChange={ this.handleTextAreaChange }
                placeholder="Required..."
                rows={ 3 }
                cols={ 80 }
              />
            </div>
          : ''} */}
      </React.Fragment>
    );

    const mentorSupportRequestJSX = (
      <fieldset>
        <div className="title">
          <h5>Mentor Support</h5>
          <p>The information you provide here is viewed by RA Staff only.</p>
        </div>
        <div className="mentor-met-container">
          <DropDown
            compName="Mentor_Support_Request__c"
            value={this.srSafe('Mentor_Support_Request__c')
              ? this.state.synopsisReport.Mentor_Support_Request__c
              : undefined}
            valueClass={this.state.mentorSupportRequestOK || this.notEmpty('Mentor_Support_Request__c') ? '' : 'required'}
            onChange={ this.handleSimpleFieldChange}
            options={this.props.pickListFieldValues.Mentor_Support_Request__c.values}
          />
          { this.notEmpty('Mentor_Support_Request__c') && this.state.synopsisReport.Mentor_Support_Request__c !== 'No'
            ? <div className="survey-question-container">
              <TextArea
                compClass={this.state.mentorSupportRequestNotesOK || this.notEmpty('Mentor_Support_Request_Notes__c') ? 'title' : 'title required'}
                compName="Mentor_Support_Request_Notes__c"
                label="Please explain:"
                value={ this.srSafe('Mentor_Support_Request_Notes__c')
                  ? this.state.synopsisReport.Mentor_Support_Request_Notes__c
                  : undefined }
                onChange={ this.handleTextAreaChange }
                placeholder="Required..."
                rows={ 3 }
                cols={ 80 }
              />
            </div>
            : '' }
        </div>
      </fieldset>
    );

    const formButtonOrMessage = () => { 
      const sr = this.props.synopsisReport;
      const studentName = sr.Student__r.Name.substr(0, sr.Student__r.Name.indexOf(' '));

      if (this.state.waitingOnImages) {
        return (<React.Fragment>
          <h3>Uploading images to Basecamp...</h3>
          <p>This may take a moment depending on image size(s).</p>
        </React.Fragment>);
      } 

      if (this.state.waitingOnSalesforce) {
        return (<h3>Saving synopsis report to Salesforce...</h3>);
      }

      if (!this.props.messageBoardUrl && this.props.projectCount > 0 && this.props.projectIdx < this.props.projectCount - 1) {
        return (<React.Fragment>
          <h5>{`Waiting on Basecamp. Scanning project ${this.props.projectIdx} of ${this.props.projectCount}...`}</h5>
        </React.Fragment>);
      }
      if (!this.props.messageBoardUrl) {
        return (<React.Fragment><h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Save to Salesforce</button></h5><p className="centered">(There&#39;s an issue retrieving Basecamp link to {studentName}&#39;s message board. Error status 404. Please alert an administrator.)</p></React.Fragment>);  
      }
      if (this.props.messageBoardUrl) {
        return (<h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Submit Full Report</button>  to {studentName}&#39;s Core Community</h5>);
      }
      
      if (!this.state.waitingOnSalesforce && this.state.savedToSalesforce && this.state.salesforceErrorStatus > 300) {
        return (<React.Fragment><h5 className="required centered">There was an error saving to Salesforce, error status {this.state.salesforceErrorStatus}. Please contact an administrator.</h5><h5><button onClick={ this.props.cancelClick } className="btn btn-secondary" id="error-close">Close</button></h5></React.Fragment>);
      }
      return null;
    };

    const synopsisReportFormJSX = this.props.synopsisReport
      ? (
      <div className="panel sr-modal">
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
                { headerJSX }
                { mentorMadeScheduledCheckinJSX }
                { oneTeamJSX }
                { identityStatementJSX }
                { identityJournalJSX }
                { sportsUpdateJSX }
                { additionalCommentsJSX }
                { imageUploadJSX }
                <hr />
                { mentorSupportRequestJSX }
                <div className="modal-footer">
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
        { this.state.savedToSalesforce && this.state.salesforceErrorStatus < 300
          ? <SynopsisReportSummary 
            synopsisReport={this.state.synopsisReport} 
            onClose={ this.props.saveClick }/> 
          : synopsisReportFormJSX }
      </div>
    );
  }
}

SynopsisReportForm.propTypes = {
  synopsisReport: PropTypes.object,
  handleChange: PropTypes.func,
  saveSynopsisReport: PropTypes.func,
  clearError: PropTypes.func,
  pickListFieldValues: PropTypes.object,
  projectCount: PropTypes.number,
  projectIdx: PropTypes.number,
  projectScanState: PropTypes.string,
  saveClick: PropTypes.func,
  cancelClick: PropTypes.func,
  content: PropTypes.object,
  myRole: PropTypes.string,
  messageBoardUrl: PropTypes.string,
  error: PropTypes.number,
  uploadImages: PropTypes.func,
  clearImages: PropTypes.func,
  imagePreviews: PropTypes.any,
  bcImages: PropTypes.any,
};

export default connect(mapStateToProps, mapDispatchToProps)(SynopsisReportForm);
