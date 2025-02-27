import React, { useState, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import moment from 'moment';
import CustomDropdown from '../customDropDown';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface DateRangeDropdownProps {
  onRangeChange: (range: DateRange) => void;
  initialValue?: string;
  placeholder?: string;
  includeNext?: boolean;
}

export const DATE_RANGE_OPTIONS = [
  { label: 'Today', value: 'Today' },
  { label: 'Yesterday', value: 'Yesterday' },
  { label: 'This Week', value: 'This Week' },
  { label: 'Last Week', value: 'Last Week' },
  { label: 'Next Week', value: 'Next Week' },
  { label: 'This Month', value: 'This Month' },
  { label: 'Last Month', value: 'Last Month' },
  { label: 'Next Month', value: 'Next Month' },
  { label: 'This Year', value: 'This Year' },
  { label: 'All Time', value: 'All Time' },
  { label: 'Custom', value: 'Custom' },
];

const DateRangeDropdown: React.FC<DateRangeDropdownProps> = ({
  onRangeChange,
  initialValue = 'This Week',
  placeholder = 'Select Date Range',
  includeNext = true,
}) => {
  const [selectedRange, setSelectedRange] = useState(initialValue);
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Filter out "Next" options if includeNext is false
  const filteredOptions = DATE_RANGE_OPTIONS.filter(option => 
    includeNext ? true : !option.value.startsWith('Next')
  );

  const calculateDateRange = useCallback((rangeType: string): DateRange => {
    const now = moment();
    let startDate: moment.Moment;
    let endDate: moment.Moment;

    switch (rangeType) {
      case 'Today':
        startDate = now.clone().startOf('day');
        endDate = now.clone().endOf('day');
        break;

      case 'Yesterday':
        startDate = now.clone().subtract(1, 'day').startOf('day');
        endDate = now.clone().subtract(1, 'day').endOf('day');
        break;

      case 'This Week':
        startDate = now.clone().startOf('week');
        endDate = now.clone().endOf('week');
        break;

      case 'Last Week':
        startDate = now.clone().subtract(1, 'week').startOf('week');
        endDate = now.clone().subtract(1, 'week').endOf('week');
        break;

      case 'Next Week':
        startDate = now.clone().add(1, 'week').startOf('week');
        endDate = now.clone().add(1, 'week').endOf('week');
        break;

      case 'This Month':
        startDate = now.clone().startOf('month');
        endDate = now.clone().endOf('month');
        break;

      case 'Last Month':
        startDate = now.clone().subtract(1, 'month').startOf('month');
        endDate = now.clone().subtract(1, 'month').endOf('month');
        break;

      case 'Next Month':
        startDate = now.clone().add(1, 'month').startOf('month');
        endDate = now.clone().add(1, 'month').endOf('month');
        break;

      case 'This Year':
        startDate = now.clone().startOf('year');
        endDate = now.clone().endOf('year');
        break;

      case 'All Time':
        startDate = moment('2000-01-01').startOf('day');
        endDate = moment('2099-12-31').endOf('day');
        break;

      default:
        startDate = now.clone().startOf('week');
        endDate = now.clone().endOf('week');
    }

    return {
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      label: rangeType
    };
  }, []);

  const handleRangeSelection = useCallback((value: string) => {
    setSelectedRange(value);
    
    if (value === 'Custom') {
      setIsCustomDateModalVisible(true);
    } else {
      const dateRange = calculateDateRange(value);
      onRangeChange(dateRange);
    }
  }, [calculateDateRange, onRangeChange]);

  const handleCustomDateSelection = useCallback((startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setIsCustomDateModalVisible(false);

    const customRange: DateRange = {
      startDate,
      endDate,
      label: 'Custom'
    };
    
    onRangeChange(customRange);
  }, [onRangeChange]);

  // Set initial date range on mount
  useEffect(() => {
    if (initialValue && initialValue !== 'Custom') {
      const initialRange = calculateDateRange(initialValue);
      onRangeChange(initialRange);
    }
  }, [initialValue, calculateDateRange, onRangeChange]);

  return (
    <View>
      <CustomDropdown
        data={filteredOptions}
        placeholder={placeholder}
        selectedValue={selectedRange}
        onSelect={handleRangeSelection}
      />

      <CustomDateRangeModal
        isVisible={isCustomDateModalVisible}
        onClose={() => {
          setIsCustomDateModalVisible(false);
          setSelectedRange(initialValue);
        }}
        onApply={handleCustomDateSelection}
        initialStartDate={customStartDate || new Date()}
        initialEndDate={customEndDate || new Date()}
      />
    </View>
  );
};

export default DateRangeDropdown;