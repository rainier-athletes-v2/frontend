import moment from 'moment';

const renderIf = (test, trueComponent, falseComponent = null) => {
  return test ? trueComponent : falseComponent;
};

const devLogger = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    return console.log(...args); // eslint-disable-line
  }
  return null;
};

const cookieFetch = (key) => {
  const cookies = document.cookie
    .split(';')
    .map(str => str.split('='))
    .reduce((acc, cur) => {
      const cookieKey = cur[0].trim();
      const cookieVal = cur[1];

      acc[cookieKey] = cookieVal;
      return acc;
    }, {});
  return cookies[key];
};

const cookieDelete = (key) => {
  const firstDot = process.env.CLIENT_URL.indexOf('.');
  const domain = firstDot > 0 ? process.env.CLIENT_URL.slice(firstDot) : null;
  if (domain) {
    document.cookie = `${key}=; expires=0; domain=${domain}`;
  } else {
    document.cookie = `${key}=; expires=0`;
  }
};

const convertDateToValue = (inputDate) => {
  let date;
  const dateFormat = 'YYYY[-]MM[-]DD';

  if (!inputDate) return null;

  if (inputDate instanceof Date) {
    date = inputDate.toISOString();
  } else {
    date = inputDate;
  }

  const dateOnly = date.replace(/T.+/, ''); // strip off time portion

  date = moment(dateOnly);

  const formattedDate = date.format(dateFormat);

  return formattedDate;
};

const getReportingPeriods = () => {
  let monday = moment().startOf('isoweek').subtract(7, 'days');
  let sunday = moment(monday).add(6, 'days');

  const reportingPeriods = [];
  const dateFormat = 'YYYY[-]MM[-]DD';
  for (let i = 0; i < 3; i++) {
    reportingPeriods.push(`${monday.format(dateFormat)} to ${sunday.format(dateFormat)}`);
    monday = monday.add(7, 'days');
    sunday = sunday.add(7, 'days');
  }

  return reportingPeriods;
};

export {
  renderIf,
  devLogger,
  cookieFetch,
  cookieDelete,
  convertDateToValue,
  getReportingPeriods,
};
