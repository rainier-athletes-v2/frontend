export default (state = null, { type, payload }) => {
  switch (type) {
    case 'SET_SR_SUMMARY_STATUS':
      return payload;
    case 'CLEAR_SR_SUMMARY_STATUS':
      return null;
    default:
      return state;
  }
};
