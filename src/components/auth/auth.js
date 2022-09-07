import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Mentor from '../mentor/mentor';

const mapStateToProps = state => ({
  role: state.role,
});

const Auth = (component, roles) => (Component) => {
  // class HaveAuth extends React.Component {
    // function HaveAuth(props) {
      const roleAsciiAdmin = 'admin'; 
      const roleAsciiMentor = 'mentor';
      if (roles.includes(roleAsciiAdmin) || roles.includes(roleAsciiMentor)) {
        return <Component { ...roles } />;
      }
      return null;
    // }
  // }

  // HaveAuth.propTypes = {
  //   role: PropTypes.string,
  // };

  // return <HaveAuth />;
  // return connect(mapStateToProps, null)(HaveAuth);
  // return HaveAuth('mentor');
  // return <Mentor />;
};

export default Auth;
