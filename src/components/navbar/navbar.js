import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as authActions from '../../actions/auth';
import * as routes from '../../lib/routes';
import googleBtn from '../../assets/google-btn.png';
import rainierBtn from '../../assets/rainier-logo-horizontal.png';

import './navbar.scss';

import * as profileActions from '../../actions/profile';
import * as pointTrackerActions from '../../actions/point-tracker';

const mapStateToProps = state => ({
  loggedIn: !!state.token,
  myProfile: state.myProfile,
});

const mapDispatchToProps = dispatch => ({
  doLogout: () => dispatch(authActions.logout()),
  fetchMyProfile: profile => dispatch(profileActions.fetchMyProfileReq(profile)),
  fetchStudents: studentIds => dispatch(profileActions.fetchStudents(studentIds)),
  fetchTeachers: studentIds => dispatch(profileActions.fetchTeachers(studentIds)),
  fetchPointTrackers: studentIds => dispatch(pointTrackerActions.fetchPointTrackers(studentIds)),
});

class Navbar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dropdown: false,
    };
  }

  setGoogleOAuthUrl = () => {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const redirect = `redirect_uri=${API_URL}/oauth/google`;
    const scope = 'scope=openid%20email%20profile%20https://www.googleapis.com/auth/drive';
    const clientId = `client_id=${GOOGLE_OAUTH_ID.trim()}`;
    const prompt = 'prompt=consent%20select_account';
    const responseType = 'response_type=code';

    return `${baseUrl}?${redirect}&${scope}&${clientId}&${prompt}&${responseType}&access_type=offline`;
  }

  componentDidMount() {
    Promise.all([
      this.props.fetchMyProfile(),
      this.props.fetchStudents(),
      this.props.fetchTeachers(),
      this.props.fetchPointTrackers(),
    ])
      .then(console.log)
      .catch(console.error);
  }

  handleClickOutside = () => {
    this.setState({
      dropdown: false,
    });
  }

  handleDropDownToggle = () => {
    this.setState(prevState => ({
      dropdown: !prevState.dropdown,
    }));
  }

  renderMentor = () => {
    return <li className="nav-item"><Link to="/mentor" className="nav-link">Mentor</Link></li>;
  }

  renderAdmin = () => {
    return <React.Fragment><li className="nav-item"><Link to="/mentor" className="nav-link">Mentor</Link></li><li className="nav-item"><Link to="/admin" className="nav-link">Admin</Link></li></React.Fragment>;
  }

  determineRole = () => {
    if (this.props.myProfile) {
      console.log(this.props.myProfile.role);
      return this.props.myProfile.role === 'mentor' ? this.renderMentor() : this.renderAdmin();
    }
    return null;
  }

  renderJSX = (loggedIn) => {
    const JSXNotLoggedIn = (
      <React.Fragment>
        <a className="navbar-brand"><Link to={routes.ROOT_ROUTE}><img className="rainier-logo" src={ rainierBtn } /></Link></a>
        <span className="login nav-content"><a href={ this.setGoogleOAuthUrl() }><img className="google-btn" src={ googleBtn } /></a></span>
      </React.Fragment>
    );

    const name = this.props.myProfile ? this.props.myProfile.firstName : null;

    const JSXLoggedIn = (
      <React.Fragment>
        <a className="navbar-brand"><Link to={routes.ROOT_ROUTE}><img className="rainier-logo" src={ rainierBtn } /></Link></a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto nav-content">
            {
              this.props.myProfile ? this.determineRole() : null
            }
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Welcome, { name }
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" onClick={ this.props.doLogout }>Logout</a>
              </div>
            </li>
          </ul>
        </div>
      </React.Fragment>
    );

    return loggedIn ? JSXLoggedIn : JSXNotLoggedIn;
  }

  render() {
    const { loggedIn } = this.props;
    return (
      <header className="header">
        <nav className="navbar navbar-expand-lg navbar-dark">
          {this.renderJSX(loggedIn)}
        </nav>
      </header>
    );
  }
}

Navbar.propTypes = {
  loggedIn: PropTypes.bool,
  doLogout: PropTypes.func,
  fetchMyProfile: PropTypes.func,
  myProfile: PropTypes.object,
  fetchProfile: PropTypes.func,
  fetchStudents: PropTypes.func,
  fetchTeachers: PropTypes.func,
  fetchPointTrackers: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
