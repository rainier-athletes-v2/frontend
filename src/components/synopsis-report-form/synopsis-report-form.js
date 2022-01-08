import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SynopsisReportSummary from '../synopsis-report-summary/synopsis-report-summary';
import DropDown from '../drop-down/drop-down';
import TextArea from '../text-area/text-area';
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
      newState.identityPromptOK = true;
      newState.pointSheetStatusOK = true;
      newState.msSelfReflectionOK = true;
      newState.esSelfReflectionOK = true;
      newState.msTeacherConvoOK = true;
      newState.esTeacherConvoOK = true;
      newState.pointSheetMissedReasonOK = true;
      newState.pointSheetStatusNotesOK = true;
      newState.psAndSchoolUpdateOK = true;
      newState.sportsUpdateOK = true;
      newState.psImageOrReasonOK = true;
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

  srSafe = prop => !!(this.state.synopsisReport && this.state.synopsisReport[prop]);

  notEmpty = prop => this.srSafe(prop) && !!this.state.synopsisReport[prop] && this.state.synopsisReport[prop] !== 'X';


  validMentorInput = (sr) => {
    const met = sr.Weekly_Check_In_Status__c === 'Met';
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
      || sr.Communication_Method_No_Check_In__c !== 'I did not connect with student and/or family for other reasons explained below'
      || (sr.Weekly_Check_In_Status__c === 'Did not meet'
      && sr.Communication_Method_No_Check_In__c === 'I did not connect with student and/or family for other reasons explained below'
      && this.notEmpty('How_can_we_support_required__c'));
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
    const identityPromptOK = emptyIdStatement || idNo || this.notEmpty('Identity_Statement_Prompts__c');

    const emptyPsStatus = !this.notEmpty('Point_Sheet_Status__c');
    const psTurnedIn = sr.Point_Sheet_Status__c === 'Turned in';
    const psNotTurnedIn = sr.Point_Sheet_Status__c === 'Not turned in';
    const psMs = this.state.studentGrade > 5;
    const psEs = this.state.studentGrade <= 5;
    const pointSheetStatusOK = this.notEmpty('Point_Sheet_Status__c');
    const msSelfReflectionOK = emptyPsStatus || psNotTurnedIn || psEs
      || (psMs && this.notEmpty('Point_Sheet_MS_Self_Reflection__c'));
    const esSelfReflectionOK = emptyPsStatus || psNotTurnedIn || psMs
      || (psEs && this.notEmpty('Point_Sheet_ES_Self_Reflection__c'));
    const msTeacherConvoOK = emptyPsStatus || psEs || psNotTurnedIn
      || (psMs && psTurnedIn && this.notEmpty('Point_Sheet_Teacher_Convo_MS__c')); 
    const esTeacherConvoOK = emptyPsStatus || psMs || psNotTurnedIn
      || (psEs && psTurnedIn && this.notEmpty('Point_Sheet_Teacher_Convo_ES__c')); 
    const pointSheetMissedReasonOK = emptyPsStatus || psTurnedIn
      || (psNotTurnedIn && this.notEmpty('No_Point_Sheet__c'));
    const pointSheetStatusNotesOK = emptyPsStatus || psTurnedIn
      || (psNotTurnedIn && sr.No_Point_Sheet__c !== 'Other')
      || (psNotTurnedIn && sr.No_Point_Sheet__c === 'Other' && this.notEmpty('No_Point_Sheet_What_Happened__c'));
    const psAndSchoolUpdateOK = this.notEmpty('Point_Sheet_and_School_Update__c');

    const sportsUpdateOK = this.notEmpty('Weekly_Sports_Update__c');

    const psImageOrReasonOK = sr.Point_Sheet_Status__c === 'Not turned in'
      || (sr.Point_Sheet_Status__c === 'Turned in' && this.props.imagePreviews && this.props.imagePreviews.length)
      || (sr.Point_Sheet_Status__c === 'Turned in' && this.notEmpty('Missing_Point_Sheet_Image__c'));

    const mentorSupportRequestOK = this.notEmpty('Mentor_Support_Request__c');
    const mentorSupportRequestNotesOK = sr.Mentor_Support_Request__c === 'No' 
      || (sr.Mentor_Support_Request__c !== 'No' && this.notEmpty('Mentor_Support_Request_Notes__c'));

    this.setState({
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
      identityPromptOK,
      pointSheetStatusOK,
      msSelfReflectionOK,
      esSelfReflectionOK,
      msTeacherConvoOK,
      esTeacherConvoOK,
      pointSheetMissedReasonOK,
      pointSheetStatusNotesOK,
      psAndSchoolUpdateOK,
      sportsUpdateOK,
      psImageOrReasonOK,
      mentorSupportRequestOK,
      mentorSupportRequestNotesOK,
    });

    return weeklyCheckinStatusOK 
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
      && identityPromptOK
      && pointSheetStatusOK
      && msSelfReflectionOK
      && esSelfReflectionOK
      && msTeacherConvoOK
      && esTeacherConvoOK
      && pointSheetMissedReasonOK
      && pointSheetStatusNotesOK
      && psAndSchoolUpdateOK
      && sportsUpdateOK
      && psImageOrReasonOK
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
        this.props.uploadImages(this.props.imagePreviews.map(preview => (preview.file))); // justs end file objects
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
        <DropDown
          compName="Weekly_Check_In_Status__c"
          value={ this.srSafe('Weekly_Check_In_Status__c') ? this.state.synopsisReport.Weekly_Check_In_Status__c : undefined}
          valueClass={this.state.weeklyCheckinStatusOK || this.notEmpty('Weekly_Check_In_Status__c') ? '' : 'required'}
          onChange={ this.handleSimpleFieldChange}
          options={this.props.pickListFieldValues.Weekly_Check_In_Status__c.values}
          />
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
          { this.notEmpty('Communication_Method_No_Check_In__c') 
            && this.state.synopsisReport.Communication_Method_No_Check_In__c === 'I did not connect with student and/or family for other reasons explained below' 
            && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
            ? <div className="survey-question-container"> 
            <TextArea
              compClass={ this.state.howSupportRequiredOK || this.notEmpty('How_can_we_support_required__c') ? 'title' : 'title required' }
              compName="How_can_we_support_required__c"
              label="Please provide any additional context to RA staff in order to help inform how we can best support"
              value={ this.srSafe('How_can_we_support_required__c') ? this.state.synopsisReport.How_can_we_support_required__c : undefined }
              onChange={ this.handleTextAreaChange }
              placeholder="Required..."
            />
            </div>
            : '' }
            { this.notEmpty('Communication_Method_No_Response__c') 
            && this.state.synopsisReport.Communication_Method_No_Response__c === 'I did not connect with student and/or family for reasons explained below' 
            && this.state.synopsisReport.Weekly_Check_In_Status__c !== 'Met'
              ? <div className="survey-question-container"> 
              <TextArea
                compClass={ this.state.howSupportOK || this.notEmpty('How_can_we_support__c') ? 'title' : 'title required' }
                compName="How_can_we_support__c"
                label="Please provide any additional context to RA staff in order to help inform how we can best support"
                value={ this.srSafe('How_can_we_support__c') ? this.state.synopsisReport.How_can_we_support__c : undefined }
                onChange={ this.handleTextAreaChange }
                placeholder="Required..."
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
              value={ this.srSafe('Family_Connection__c')
                ? this.state.synopsisReport.Family_Connection__c
                : ''}
              valueClass={this.state.metWithFamilyOK || this.notEmpty('Family_Connection__c') ? '' : 'required'}
              onChange={ this.handleSimpleFieldChange}
              options={this.props.pickListFieldValues.Family_Connection__c.values}
            />
            <DropDown
              compName="Teacher_Connection__c"
              value={this.srSafe('Teacher_Connection__c')
                ? this.state.synopsisReport.Teacher_Connection__c
                : ''}
              valueClass={this.state.metWithTeacherOK || this.notEmpty('Teacher_Connection__c') ? '' : 'required'}
              onChange={ this.handleSimpleFieldChange}
              options={this.props.pickListFieldValues.Teacher_Connection__c.values}
            />
            <DropDown
              compName="Coach_Connection__c"
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
            <h5>IDENTITY STATEMENT</h5>
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
              compName="Identity_Statement_Prompts__c"
              value={this.srSafe('Identity_Statement_Prompts__c')
                ? this.state.synopsisReport.Identity_Statement_Prompts__c
                : ''}
              valueClass={this.state.identityPromptOK || this.notEmpty('Identity_Statement_Prompts__c') ? '' : 'required'}
              onChange={ this.handleSimpleFieldChange}
              options={this.props.pickListFieldValues.Identity_Statement_Prompts__c.values}
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
        <div className="survey-question-container">
            <TextArea
                compClass="title"
                compName="Identity_Statement_Highlights__c"
                label="Identity Statement Highlights (Optional)"
                value={ this.srSafe('Identity_Statement_Highlights__c')
                  ? this.state.synopsisReport.Identity_Statement_Highlights__c
                  : '' }
                onChange={ this.handleTextAreaChange }
                placeholder="Optional..."
              />
        </div>
      </React.Fragment>
    );

    const { studentGrade } = this.state;

    const pointSheetStatusJSX = (
      <fieldset>
        <div className="title">
          <h5>POINT SHEET AND SCHOOL UPDATE</h5>
        </div>
        <div className="mentor-met-container">
          <DropDown
            compName="Point_Sheet_Status__c"
            value={this.srSafe('Point_Sheet_Status__c')
              ? this.state.synopsisReport.Point_Sheet_Status__c
              : undefined}
            valueClass={this.state.pointSheetStatusOK || this.notEmpty('Point_Sheet_Status__c') ? '' : 'required'}
            onChange={ this.handleSimpleFieldChange}
            options={this.props.pickListFieldValues.Point_Sheet_Status__c.values}
          />
          {studentGrade > 5 && this.notEmpty('Point_Sheet_Status__c')
            && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in' 
            ? <DropDown
                compName="Point_Sheet_MS_Self_Reflection__c"
                value={this.srSafe('Point_Sheet_MS_Self_Reflection__c')
                  ? this.state.synopsisReport.Point_Sheet_MS_Self_Reflection__c
                  : undefined}
                valueClass={this.state.msSelfReflectionOK || this.notEmpty('Point_Sheet_MS_Self_Reflection__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Point_Sheet_MS_Self_Reflection__c.values}
              /> 
            : ''}
          {studentGrade <= 5 && this.notEmpty('Point_Sheet_Status__c')
            && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in'
            ? <DropDown
                compName="Point_Sheet_ES_Self_Reflection__c"
                value={this.srSafe('Point_Sheet_ES_Self_Reflection__c')
                  ? this.state.synopsisReport.Point_Sheet_ES_Self_Reflection__c
                  : undefined}
                valueClass={this.state.esSelfReflectionOK || this.notEmpty('Point_Sheet_ES_Self_Reflection__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Point_Sheet_ES_Self_Reflection__c.values}
              /> 
            : ''}
          {studentGrade > 5 && this.notEmpty('Point_Sheet_Status__c')
            && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in'
            && this.notEmpty('Point_Sheet_MS_Self_Reflection__c')
            ? <DropDown
                compName="Point_Sheet_Teacher_Convo_MS__c"
                value={this.srSafe('Point_Sheet_Teacher_Convo_MS__c')
                  ? this.state.synopsisReport.Point_Sheet_Teacher_Convo_MS__c
                  : undefined}
                valueClass={this.state.msTeacherConvoOK || this.notEmpty('Point_Sheet_Teacher_Convo_MS__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Point_Sheet_Teacher_Convo_MS__c.values}
              /> 
            : ''}
          {studentGrade <= 5 && this.notEmpty('Point_Sheet_Status__c')
            && this.state.synopsisReport.Point_Sheet_Status__c === 'Turned in'
            && this.notEmpty('Point_Sheet_ES_Self_Reflection__c')
            ? <DropDown
                compName="Point_Sheet_Teacher_Convo_ES__c"
                value={this.srSafe('Point_Sheet_Teacher_Convo_ES__c')
                  ? this.state.synopsisReport.Point_Sheet_Teacher_Convo_ES__c
                  : undefined}
                valueClass={this.state.esTeacherConvoOK || this.notEmpty('Point_Sheet_Teacher_Convo_ES__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.Point_Sheet_Teacher_Convo_ES__c.values}
              /> 
            : ''}
          {this.notEmpty('Point_Sheet_Status__c') && this.state.synopsisReport.Point_Sheet_Status__c === 'Not turned in'
            ? <DropDown
                compName="No_Point_Sheet__c"
                value={this.srSafe('No_Point_Sheet__c')
                  ? this.state.synopsisReport.No_Point_Sheet__c
                  : undefined}
                valueClass={this.state.pointSheetMissedReasonOK || this.notEmpty('No_Point_Sheet__c') ? '' : 'required'}
                onChange={ this.handleSimpleFieldChange}
                options={this.props.pickListFieldValues.No_Point_Sheet__c.values}
              /> 
            : ''}
            { this.notEmpty('Point_Sheet_Status__c') 
              && this.state.synopsisReport.Point_Sheet_Status__c === 'Not turned in' 
              && this.notEmpty('No_Point_Sheet__c') 
              && this.state.synopsisReport.No_Point_Sheet__c === 'Other'
              ? <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.pointSheetStatusNotesOK || this.notEmpty('No_Point_Sheet_What_Happened__c') ? '' : 'required'}`}
                    compName="No_Point_Sheet_What_Happened__c"
                    label="What happened?"
                    value={ this.srSafe('No_Point_Sheet_What_Happened__c')
                      ? this.state.synopsisReport.No_Point_Sheet_What_Happened__c
                      : undefined }
                    placeholder="Required..."
                    onChange={ this.handleTextAreaChange }
                    rows={ 3 }
                    cols={ 80 }
                  />
                </div>
              : '' }
            <div className="survey-question-container">
                  <TextArea
                    compClass={`title ${this.state.psAndSchoolUpdateOK || this.notEmpty('Point_Sheet_and_School_Update__c') ? '' : 'required'}`}
                    compName="Point_Sheet_and_School_Update__c"
                    label="Point Sheet and School Update (Required)"
                    value={ this.srSafe('Point_Sheet_and_School_Update__c')
                      ? this.state.synopsisReport.Point_Sheet_and_School_Update__c
                      : undefined }
                    placeholder="Required..."
                    onChange={ this.handleTextAreaChange }
                    rows={ 3 }
                    cols={ 80 }
                  />
                </div>
        </div>
    </fieldset>
    );

    const sportsUpdateJSX = (
      <fieldset>
        <div className="title">
          <h5>SPORTS UPDATE</h5>
        </div>
        <div className="mentor-met-container">
          <DropDown
            compName="Weekly_Sports_Update__c"
            value={this.srSafe('Weekly_Sports_Update__c')
              ? this.state.synopsisReport.Weekly_Sports_Update__c
              : undefined}
              valueClass={this.state.sportsUpdateOK || this.notEmpty('Weekly_Sports_Update__c') ? '' : 'required'}
            onChange={ this.handleSimpleFieldChange}
            options={this.props.pickListFieldValues.Weekly_Sports_Update__c.values}
          />
          <div className="survey-question-container">
            <TextArea
              compClass="title"
              compName="Sports_Update__c"
              label="Sports Update (Optional):"
              value={ this.srSafe('Sports_Update__c')
                ? this.state.synopsisReport.Sports_Update__c
                : undefined }
              onChange={ this.handleTextAreaChange }
              placeholder="Optional..."
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
          <h5>ADDITIONAL COMMENTS</h5>
        </div>
        <div className="mentor-met-container">
            <TextArea
              compClass="title"
              compName="Additional_Comments__c"
              label="Additional Comments for the core community:"
              value={ this.srSafe('Additional_Comments__c')
                ? this.state.synopsisReport.Additional_Comments__c
                : undefined }
              onChange={ this.handleTextAreaChange }
              placeholder="Optional..."
              rows={ 3 }
              cols={ 80 }
            />
        </div>
      </fieldset>
    );

    const pointSheetImageOrCommentsJSX = (
      <React.Fragment>
        <div className={ this.state.psImageOrReasonOK ? 'title' : 'title required' }>
          <h5>Point Sheet Upload</h5>
        </div>
        <ImagePreviews />
        { !this.state.psImageOrReasonOK || this.notEmpty('Missing_Point_Sheet_Image__c')
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
          : ''}
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
      if (this.state.waitingOnImages) {
        return (<React.Fragment>
          <h3>Uploading images to Basecamp...</h3>
          <p>This may take a moment depending on image size(s).</p>
        </React.Fragment>);
      } 
      if (this.state.waitingOnSalesforce) {
        return (<h3>Saving synopsis report to Salesforce...</h3>);
      }
      if (this.state.waitingOnBasecamp || !this.props.messageBoardUrl) {
        return (<React.Fragment>
          <h5>{`Waiting on Basecamp. Scanning project ${this.props.projectIdx} of ${this.props.projectCount}...`}</h5>
          <p>If the submit button doesn&#39;t appear soon contact an administrator.</p>
        </React.Fragment>);
      }
      const sr = this.props.synopsisReport;
      const studentName = sr.Student__r.Name.substr(0, sr.Student__r.Name.indexOf(' '));
      if (!(this.state.waitingOnSalesforce && this.state.savedToSalesforce) && !this.state.waitingOnBasecamp
        && this.state.salesforceErrorStatus < 300) {
        if (this.props.messageBoardUrl) {
          return (<h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Submit Full Report</button>  to {studentName}&#39;s Core Community</h5>);
        }
        return (<React.Fragment><h5><button onClick={ this.handleFullReportSubmit } className="btn btn-secondary" id="full-report" type="submit">Save to Salesforce</button></h5><p className="centered">(There&#39;s an issue retrieving Basecamp link to {studentName}&#39;s message board. Error status {this.state.basecampErrorStatus}. Please alert an administrator.)</p></React.Fragment>);  
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
                { pointSheetStatusJSX }
                { sportsUpdateJSX }
                { additionalCommentsJSX }
                { pointSheetImageOrCommentsJSX }
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
  // clearMsgBoardUrl: PropTypes.func,
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
