import moment from "moment";

export const getDateRange = (option: string, tasksData: Task[],customStartDate:any,customEndDate:any) => {
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
      dateRange = { startDate: moment().add(1, 'months').startOf('month'), endDate: moment().add(1, 'months').endOf('month') };
      break;
    case 'This Year':
      dateRange = { startDate: moment().startOf('year'), endDate: moment().endOf('year') };
      break;
    case 'Custom':
      dateRange = { startDate: moment(customStartDate).startOf('day'), endDate: moment(customEndDate).endOf('day') };
    case 'All Time':
      const startDate = tasksData.reduce(
        (minDate, task) => (moment(task.createdAt).isBefore(minDate) ? moment(task.createdAt) : minDate),
        moment()
      );
      const endDate = tasksData.reduce(
        (maxDate, task) => (moment(task.dueDate).isAfter(maxDate) ? moment(task.dueDate) : maxDate),
        moment()
      );
      dateRange = { startDate, endDate };
      break;
    default:
      break;
  }

  return dateRange;
};
