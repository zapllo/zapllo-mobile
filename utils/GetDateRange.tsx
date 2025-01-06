import moment from 'moment';

// Function to get date range based on option
const getDateRange = (option:any) => {
  let dateRange = { startDate: {}, endDate: {} };

  switch (option) {
    case 'Today':
      dateRange = { startDate: moment().startOf('day'), endDate: moment().endOf('day') };
      break;
    case 'Yesterday':
      dateRange = { startDate: moment().subtract(1, 'days').startOf('day'), endDate: moment().subtract(1, 'days').endOf('day') };
      break;
    case 'This Week':
      dateRange = { startDate: moment().startOf('week'), endDate: moment().endOf('week') };
      break;
    case 'Last Week':
      dateRange = { startDate: moment().subtract(1, 'weeks').startOf('week'), endDate: moment().subtract(1, 'weeks').endOf('week') };
      break;
    case 'Next Week':
      dateRange = { startDate: moment().add(1, 'weeks').startOf('week'), endDate: moment().add(1, 'weeks').endOf('week') };
      break;
    case 'This Month':
      dateRange = { startDate: moment().startOf('month'), endDate: moment().endOf('month') };
      break;
    case 'Next Month':
      dateRange = { startDate: moment().add(1, 'month').startOf('month'), endDate: moment().add(1, 'month').endOf('month') };
      break;
    case 'This Year':
      dateRange = { startDate: moment().startOf('year'), endDate: moment().endOf('year') };
      break;
    default:
      break;
  }

  return dateRange;
};

export default getDateRange;
