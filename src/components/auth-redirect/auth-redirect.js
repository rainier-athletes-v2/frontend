import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import * as routes from '../../lib/routes';

const mapStateToProps = state => ({
  token: state.salesforceToken,
});

class AuthRedirect extends React.Component {
  renderFinalDestination = (token) => {
      if (token) {
        console.log('AuthRedirect returning navigate to mentor route');
        return <Navigate to={routes.MENTOR_ROUTE} />;
      }
      return <Navigate to={routes.ROOT_ROUTE} />;
  }

  render() {
    const { token } = this.props;
    console.log('AuthRedirect', this.props);
    return (
      <div className="auth-redirect">
        { this.renderFinalDestination(token) }
      </div>
    );
  }
}

AuthRedirect.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
  token: PropTypes.string,
};

export default connect(mapStateToProps)(AuthRedirect);
