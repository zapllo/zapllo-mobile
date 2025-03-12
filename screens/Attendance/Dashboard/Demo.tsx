'use client';

import CustomDatePicker from '@/components/globals/date-picker';
import { startOfWeek, endOfWeek, subWeeks, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@/components/ui/dialog';
import axios from 'axios';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import Loader from '@/components/ui/loader';

// Generate all weekdays of a selected month, excluding weekends (Saturday, Sunday)
const generateWeekdaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const weekdays = [];
  while (date.getMonth() === month) {
    // Exclude weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      weekdays.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return weekdays;
};

// Client-side: generateMonthOptions function
const generateMonthOptions = () => {
  const months = [
    { name: 'Jan', value: '01' },
    { name: 'Feb', value: '02' },
    { name: 'Mar', value: '03' },
    { name: 'Apr', value: '04' },
    { name: 'May', value: '05' },
    { name: 'Jun', value: '06' },
    { name: 'Jul', value: '07' },
    { name: 'Aug', value: '08' },
    { name: 'Sep', value: '09' },
    { name: 'Oct', value: '10' },
    { name: 'Nov', value: '11' },
    { name: 'Dec', value: '12' }
  ];

  const currentYear = new Date().getFullYear();

  // Return an array with both the display format and the actual value
  return months.map((month) => ({
    display: ${month.name}-${currentYear.toString().slice(-2)}, // e.g., Sep-24
    value: ${currentYear}-${month.value} // e.g., 2024-09
  }));
};

interface AttendanceEntry {
  date: string;
  day: string;
  present: number;
  leave: number;
  absent: number;
  total: number;
  holiday: number;
}

interface LeaveEntry {
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: string;
}

interface HolidayEntry {
  holidayName: string;
  holidayDate: string;
}
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  reportingManager?: string;
}

interface UserwiseReport {
  user: string;
  present: number;
  leave: number;
  absent: number;
  reportingManager: string;
}

interface ReportEntry {
  user: string;
  status: string;
  loginTime: string;
  logoutTime: string;
  totalDuration: string;
}

interface AttendanceEntry {
  date: string;
  day: string;
  present: number;
  leave: number;
  absent: number;
  total: number;
}

let startDate: Date | undefined;
let endDate: Date | undefined;


const AttendanceDashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [leaves, setLeaves] = useState<LeaveEntry[]>([]); // State for leaves
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]); // State for holidays
  const [holidaysCumulative, setHolidaysCumulative] = useState<number>(0); // State for holidays
  // const [selectedDate, setSelectedDate] = useState<string>('2024-09');
  const [totalDays, setTotalDays] = useState<number>(0);
  const [totalCumulativeDays, setTotalCumulativeDays] = useState<number>(0);
  const [presentCount, setPresentCount] = useState<number>(0);
  const [leaveCount, setLeaveCount] = useState<number>(0);
  const [absentCount, setAbsentCount] = useState<number>(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [workingDays, setWorkingDays] = useState<number>(0);
  const [holidayCount, setHolidayCount] = useState<number>(0);
  const [period, setPeriod] = useState('thisWeek');
  const [report, setReport] = useState<UserwiseReport[]>([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [managerId, setManagerId] = useState('');
  const [managers, setManagers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const monthOptions = generateMonthOptions(); // Generate months dynamically
  const [selectedDate, setSelectedDate] = useState<string>(Date());
  const [isDateSelected, setIsDateSelected] = useState<boolean>(false); // Track whether the user manually selects a date
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0'); // Formats month as two digits
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(${currentYear}-${currentMonth});
  const [dailyReport, setDailyReport] = useState<ReportEntry[]>([]);
  const [employeeId, setEmployeeId] = useState<string | undefined>(undefined);
  const [weekOffs, setWeekOffs] = useState<number>(0);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean | null>(true);
  // const [totalDailyDays, setTotalDailyDays] = useState(1); // Total days for daily report (default 1)
  // const [holidaysDaily, setHolidaysDaily] = useState(0);   // Number of holidays in the daily report
  // const [weekOffsDaily, setWeekOffsDaily] = useState(0);   // Number of week offs (0 or 1)
  const [dailytotalCount, setDailyTotalCount] = useState<number>(0);
  const [dailypresentCount, setDailyPresentCount] = useState<number>(0);
  const [dailyonLeaveCount, setDailyOnLeaveCount] = useState<number>(0);
  const [dailyabsentCount, setDailyAbsentCount] = useState<number>(0);
  const [monthlyReport, setMonthlyReport] = useState<AttendanceEntry[]>([]);
  const [role, setRole] = useState<any>();





  useEffect(() => {
    const computeCounts = () => {
      setDailyTotalCount(dailyReport?.length || 0);

      setDailyPresentCount(dailyReport?.filter(entry => entry.status === 'Present').length || 0);
      setDailyOnLeaveCount(dailyReport?.filter(entry => entry.status === 'On Leave').length || 0);
      setDailyAbsentCount(dailyReport?.filter(entry => entry.status === 'Absent').length || 0);
    };

    computeCounts();
  }, [dailyReport]);




  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/organization");
        const result = await response.json();

        if (response.ok) {
          setManagers(result.data);
          setEmployees(result.data);
        } else {
          console.error("Error fetching users:", result.error);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);




  useEffect(() => {
    const fetchCumulativeReport = async () => {
      let startDate: Date;
      let endDate: Date;

      if (period === 'thisMonth') {
        startDate = startOfMonth(new Date());
        endDate = new Date();
      } else if (period === 'lastMonth') {
        startDate = startOfMonth(subMonths(new Date(), 1));
        endDate = endOfMonth(subMonths(new Date(), 1));
      } else if (period === 'thisWeek') {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        endDate = new Date();
      } else if (period === 'lastWeek') {
        startDate = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
      } else {
        console.error("Invalid period specified.");
        return;
      }

      try {
        const res = await fetch('/api/reports/cumulative', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            managerId,
            employeeId,
          }),
        });
        const data = await res.json();
        setReport(data.report);
        setTotalCumulativeDays(data.totalDays);
        setWorkingDays(data.workingDays);
        setHolidaysCumulative(data.holidays.length);
        setWeekOffs(data.weekOffs);
      } catch (error) {
        console.error('Error fetching cumulative report:', error);
      }
    };


    if (period) fetchCumulativeReport();
  }, [managerId, period, employeeId]);

  // Fetch attendance, leave, and holiday data for the entire organization
  // Fetch attendance, leave, and holiday data for the entire organization
  useEffect(() => {
    async function fetchAttendanceData() {
      setAttendanceLoading(true);
      try {
        const response = await fetch(/api/attendance?date=${selectedAttendanceDate});
        const data = await response.json();

        // Update leaves and holidays
        setLeaves(data.leaves);
        setHolidays(data.holidays);

        // Parse the selected month and year
        const [selectedYearStr, selectedMonthStr] = selectedAttendanceDate.split('-');
        const selectedYear = parseInt(selectedYearStr, 10);
        const selectedMonth = parseInt(selectedMonthStr, 10) - 1; // JavaScript months are 0-based

        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to midnight
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        // Determine startDate and endDate
        // Determine startDate and endDate
        const startDate = new Date(selectedYear, selectedMonth, 1);
        let endDate: Date;

        if (selectedYear === currentYear && selectedMonth === currentMonth) {
          // Selected month is current month, so end date is end of today
          endDate = endOfDay(today); // Set to 23:59:59 of today
        } else {
          // Selected month is not current month, so end date is end of selected month
          const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the selected month
          endDate = endOfDay(lastDayOfMonth); // Set to 23:59:59 of the last day
        }


        // Generate all days from startDate to endDate
        const allDaysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

        // Exclude weekends if necessary
        const weekdaysInMonth = allDaysInMonth.filter((day: any) => !isWeekend(day));

        // Set totalDays
        setTotalDays(weekdaysInMonth.length);

        // Filter monthlyReport to include only dates up to endDate
        const filteredMonthlyReport = data.monthlyReport.filter((day: AttendanceEntry) => {
          const dayDate = new Date(day.date);
          return dayDate >= startDate && dayDate <= endDate;
        });

        // Update state with the filtered report
        setMonthlyReport(filteredMonthlyReport);

        setAttendanceLoading(false);

        // Calculate summary counts using filteredMonthlyReport
        let totalPresent = 0;
        let totalLeave = 0;
        let totalAbsent = 0;
        let totalHoliday = 0;

        filteredMonthlyReport.forEach((day: any) => {
          totalPresent += day.present;
          totalLeave += day.leave;
          totalAbsent += day.absent;
          totalHoliday += day.holiday;
        });

        setPresentCount(totalPresent);
        setLeaveCount(totalLeave);
        setAbsentCount(totalAbsent);
        setHolidayCount(totalHoliday);

        // Update workingDays accordingly
        setWorkingDays(weekdaysInMonth.length - totalHoliday);

      } catch (error) {
        console.error('Error fetching attendance data:', error);
      }
    }

    fetchAttendanceData();
  }, [selectedAttendanceDate]);


  // useEffect(() => {
  //   async function fetchAttendanceData() {
  //     setAttendanceLoading(true);
  //     try {
  //       const response = await fetch(/api/userAttendance?date=${selectedAttendanceDate});
  //       const data = await response.json();

  //       // Update state with the user-specific report
  //       setMonthlyReport(data.monthlyReport);
  //       setAttendanceLoading(false);

  //     } catch (error) {
  //       console.error('Error fetching attendance data:', error);
  //     }
  //   }

  //   fetchAttendanceData();
  // }, [selectedAttendanceDate]);

  // Function to fetch the daily report from the server
  const fetchDailyReport = async (date: string) => {
    try {
      setAttendanceLoading(true)
      const res = await fetch('/api/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date, managerId,
          employeeId,
        }),
      });
      const data = await res.json();
      setDailyReport(data.report);
      setAttendanceLoading(false)
    } catch (error) {
      console.error('Error fetching daily report:', error);
    }
  };

  // Fetch the report when the date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchDailyReport(selectedDate);
    }
  }, [selectedDate, employeeId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]); // Convert to YYYY-MM-DD string format
    setIsDateSelected(true);
  };

  const handleCloseDialog = () => {
    setIsDatePickerOpen(false); // Close the dialog
  };

  const allowedRoles = ['orgAdmin', 'manager'];
  const adminRoles = ['orgAdmin'];
  const disallowedRoles = ['member'];

  useEffect(() => {
    const getUserDetails = async () => {
      const res = await axios.get('/api/users/me')
      setRole(res.data.data.role);
    }
    getUserDetails();
  }, [])


  if (attendanceLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6 h-screen overflow-y-scroll scrollbar-hide">
      {attendanceLoading && (
        <div className="absolute w-screen h-screen z-[100]  inset-0 dark:bg-[#04061e] bg-[#FEFEFE] -900  bg-opacity-90 rounded-xl flex justify-center items-center">
          <div
            className=" z-[100]  max-h-screen max-w-screen text-[#D0D3D3] w-[100%] rounded-lg ">
            <div className="">
              <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-4 pointer-events-none text-3xl text-center md:text-4xl lg:text-7xl">
                <img src="/logo/loader.png" className="h-[15%] animate-pulse" />
                <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b text-sm from-white/80 to-white/20">
                  Loading...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {allowedRoles.includes(role) && (
        <div className='mb-12  gap-2'>
          {adminRoles.includes(role) && (
            <div className="mb-4 flex gap-2 justify-center w-full">

              <select
                className="border rounded text-xs border-[] dark:bg-[#04061E]  outline-none p-2"
                onChange={(e) => setManagerId(e.target.value)}
              >
                <option value="">Select Manager</option>
                {managers?.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.firstName} {manager.lastName}
                  </option>
                ))}
              </select>
              {/* <label htmlFor="employee" className="mr-2">Employee:</label> */}
              <select
                className="border-[#] border outline-none dark:bg-[#04061E] text-xs  rounded p-2"
                id="employee"
                onChange={(e) => setEmployeeId(e.target.value)} // Update selected employee
              >
                <option value="">Select Employee</option>
                {employees?.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
              {/* <button onClick={fetchCumulativeReport} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg">
                Fetch Report
              </button> */}
            </div>
          )}
          <div className='grid grid-cols-2 gap-2'>
            <div className="flex-1 border  shadow-md rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium ">Daily Report</h3>
                <div>
                  {/* <span className="text-sm mr-2">Date:</span> */}
                  {/* <input
                    type="date"
                    className="border rounded-lg p-2 text-xs"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  /> */}
                  <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <DialogTrigger>
                      <Button
                        type="button"
                        onClick={() => setIsDatePickerOpen(true)}
                        className=" rounded  border border-[#] bg-[#] hover:bg-primary hover:text-white dark:hover:bg-[#37384B] text-black dark:text-white px-3 flex gap-1 py-2"
                      >
                        <Calendar className="h-5 text-sm" />
                        {/* // Show the selected date if the user has interacted */}
                        <h1 className='text-xs'> {format(selectedDate, 'PPP')}</h1>

                        {/* <h1 className="text-xs">Select Date & Time</h1> */}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="z-[100] scale-90 bg-[#0a0d28] flex justify-center ">
                      <div className="z-[20] rounded-lg  scale-[80%] max-w-4xl flex justify-center items-center w-full relative">
                        <div className="w-full flex mb-4 justify-between">
                          <CustomDatePicker
                            selectedDate={new Date(selectedDate)} // Convert the string to a Date object
                            onDateChange={handleDateChange}
                            onCloseDialog={handleCloseDialog} // Close the dialog on date selection
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="flex justify-center space-x-4 mb-4">
                <div className="flex gap-2 items-center  dark:text-white border p-2 text-xs  rounded">
                  All: {dailytotalCount}
                </div>
                <div className="flex flex-col items-center text-green-500 dark:text-green-400 border p-2 text-xs  rounded">
                  Present : {dailypresentCount}
                </div>
                <div className="flex flex-col items-center text-yellow-500  dark:text-yellow-400   border p-2 text-xs  rounded">
                  On Leave : {dailyonLeaveCount}
                </div>
                <div className="flex flex-col items-center dark:text-red-500 text-red-400  border p-2 text-xs  rounded">
                  Absent : {dailyabsentCount}
                </div>
              </div>
              <div className=' border rounded-xl w-full '>
                <table className="table- dark:bg-[#0A0D28] rounded-xl w-full ">
                  <thead className=' rounded-xl'>
                    <tr className="text-xs   rounded-xl ">
                      <th className=" px-4 text-muted-foreground py-2 text-left">Name</th>
                      <th className=" px-4 py-2 text-left text-muted-foreground">Status</th>
                      <th className=" px-4 py-2 text-left text-muted-foreground">Login Time</th>
                      <th className=" px-4 py-2 text-left text-muted-foreground">Logout Time</th>
                      <th className=" px-4 py-2  text-muted-foreground text-left">Total Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReport?.map((entry, index) => (
                      <tr key={index} className='border-t'>
                        <td className="px-4 text-xs py-2">{entry.user}</td>
                        <td
                          className={`px-4 text-xs py-2 ${entry.status === 'Present'
                            ? 'text-green-600'
                            : entry.status === 'On Leave'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                            }`}
                        >
                          {entry.status}
                        </td>
                        <td className="text-xs px-4 py-2">
                          {entry.loginTime !== 'N/A' && !isNaN(new Date(entry.loginTime).getTime())
                            ? format(new Date(entry.loginTime), 'hh:mm a')
                            : 'N/A'}

                        </td>
                        <td className="text-xs px-4 py-2">
                          {entry.logoutTime !== 'N/A' && !isNaN(new Date(entry.logoutTime).getTime())
                            ? format(new Date(entry.logoutTime), 'hh:mm a')
                            : 'N/A'}
                        </td>
                        <td className="text-xs px-4 py-2">{entry.totalDuration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex-1 border b  shadow-md rounded-3xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium">Cumulative Report</h3>

                <div>
                  <select
                    className="border-[#] dark:bg-[#04061E] border-2 outline-none text-xs rounded p-2"
                    onChange={(e) => setPeriod(e.target.value)}
                  >
                    <option value="thisWeek">This Week</option>
                    <option value="lastWeek">Last Week</option>
                    <option value="thisMonth">This Month</option>
                    <option value="lastMonth">Last Month</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-4 justify-center mb-2 mt-2">
                <span className="border text-xs text-blue-400 text-= p-2 rounded">Total Days: {totalCumulativeDays}</span>
                <span className="border text-xs text-yellow-400  p-2 rounded">Working: {workingDays}</span>
                <span className="border text-xs text-green-400  p-2 rounded">Week Offs: {weekOffs}</span>
                <span className="border text-xs text-red-500  p-2 rounded">Holidays: {holidaysCumulative}</span>
              </div>
              <div className=' border dark:bg-[#0A0D28] rounded-xl w-full '>
                <table className="table-  rounded-xl w-full ">
                  <thead className=' rounded'>
                    <tr className="text-muted-foreground text-xs">
                      <th className=" px-4 py-2 text-left">Name</th>
                      <th className=" px-4 py-2 text-left">Present</th>
                      <th className=" px-4 py-2 text-left">Leave</th>
                      <th className=" px-4 py-2 text-left">Absent</th>
                      <th className=" px-4 py-2 text-left">Reporting Manager</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report?.map((entry, index) => (
                      <tr className='text-xs border-t' key={index}>
                        <td className=" px-4 py-2">{entry.user}</td>
                        <td className=" px-4 py-2 text-center">{entry.present}</td>
                        <td className=" px-4 py-2 text-center">{entry.leave}</td>
                        <td className=" px-4 py-2 text-center">{entry.absent}</td>
                        <td className=" px-4 py-2">{entry.reportingManager || "Not Assigned"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {disallowedRoles.includes(role) && (
        <div className="mb-4 flex gap-2 w-full">
          <div className='flex gap-2 w-full'>
            <div>
              <h2 className="text-lg font-semibold 4">My Report</h2>
            </div>
          </div>
        </div>
      )}
      {disallowedRoles.includes(role) && (
        <div className="relative mt-2 mb-12">
          <div className="h-full rounded-md">
            <div className='dark:bg-[#0A0D28] border rounded-xl w-full '>
              <table className="table-  rounded-xl w-full ">
                <thead className='border-b text-muted-foreground'>
                  <tr>
                    <th className="rounded-l text-sm font-medium text-start p-2 w-24 px-4">Date</th>
                    <th className="text-sm text-start font-medium w-24 p-2 px-4">Day</th>
                    <th className="text-sm text-start w-24 font-medium p-2 px-4">Present</th>
                    <th className="text-sm text-start w-24 font-medium p-2 px-4">Leave</th>
                    <th className="text-sm text-start w-24 font-medium p-2 px-4">Holiday</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.map((day, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2 text-xs">
                        {format(new Date(day.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-2 text-xs">{day.day}</td>
                      <td className="px-4 py-2 text-start">
                        <input type="checkbox" className='text-[#017a5b]' checked={!!day.present} readOnly />
                      </td>
                      <td className="px-4 py-2 text-start">
                        <input type="checkbox" checked={!!day.leave} readOnly />
                      </td>
                      <td className="px-4 py-2 text-start">
                        <input type="checkbox" checked={!!day.holiday} readOnly />
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {allowedRoles.includes(role) && (
        <div className=" flex gap-2 w-full">
          <div className='flex gap-2 w-full'>
            <div>
              <h2 className="text-lg font-semibold 4">Monthly Report</h2>
            </div>
            <div className="flex items-center  ">
              {/* Month selector */}
              <select
                className="p-2 text-sm border-2 outline-none w-24 border-[#] dark:bg-[#04061E] rounded"
                value={selectedAttendanceDate}
                onChange={(e) => setSelectedAttendanceDate(e.target.value)}
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.display}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>
      )}
      {/* Summary */}
      {allowedRoles.includes(role) && (
        <div className="mb-4 mt-4 flex w-full justify-start space-x-2">
          <span className="border text-xs bg-blue-900 text-white p-2 rounded">
            Total Days: {totalDays}
          </span>
          <span className="border text-xs bg-yellow-600 text-white p-2 rounded">
            Total Employees: {employees.length}
          </span>
          <span className="border text-xs bg-green-700 text-white p-2 rounded">
            Present: {presentCount}
          </span>
          <span className="border text-xs bg-red-700 text-white p-2 rounded">
            Leave: {leaveCount}
          </span>
          <span className="border text-xs bg-gray-700 text-white p-2 rounded">
            Absent: {absentCount}
          </span>
          <span className="border text-xs bg-purple-700 text-white p-2 rounded">
            Holidays: {holidayCount}
          </span>
        </div>
      )}
      {/* // Table rendering */}

      {/* Monthly Attendance Report */}
      {allowedRoles.includes(role) && (
        <div className="relative mt-2 mb-12">
          <div className="h-full  rounded-md">
            <div className='dark:bg-[#0A0D28] border rounded-xl w-full '>
              <table className="table-  rounded-xl w-full ">
                <thead className='border-b text-muted-foreground'>
                  <th className="rounded-l text-sm font-medium text-end p-2 w-24 px-4">Date</th>
                  <th className="text-sm text-end font-medium w-24 p-2 px-4">Day</th>
                  <th className="text-sm text-end w-24 font-medium p-2 px-4">Present</th>
                  <th className="text-sm text-end w-24 font-medium p-2 px-4">Leave</th>
                  <th className="text-sm text-end w-24 font-medium p-2 px-4">Absent</th>
                  <th className="text-sm text-end w-24 font-medium p-2 px-4">Holiday</th>
                  <th className="text-sm w-24 text-end rounded-r font-medium p-2 px-4">Total</th>
                </thead>
                <tbody>
                  {monthlyReport.map((day, index) => (
                    <tr key={index} className="border-b text-end">
                      <td className="px-4 py-2 text-xs">
                        {format(new Date(day.date), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-2 text-end text-xs">{day.day}</td>
                      <td className="px-4 py-2 text-end text-xs">{day.present}</td>
                      <td className="px-4 py-2 text-end text-xs">{day.leave}</td>
                      <td className="px-4 py-2 text-end  text-xs">{day.absent}</td>
                      <td className="px-4 py-2 text-end text-xs">{day.holiday}</td>
                      <td className="px-4 py-2 text-end text-xs">{day.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


        </div>
      )}
    </div>
  );
};

export default AttendanceDashboard;