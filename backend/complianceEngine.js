// Utility to get the difference in hours between two dates
const getHoursDifference = (start, end) => {
  return (new Date(end) - new Date(start)) / (1000 * 60 * 60);
};

export const checkCompliance = (logs, year, month) => {
  // Define STCW rules
  const MIN_REST_24H = 10;
  const MAX_WORK_24H = 14;
  const MIN_REST_7D = 77;

  // Initialize days array for the given month
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthlyRecord = {
    year,
    month,
    days: []
  };

  // Pre-fill days matrix
  for (let i = 1; i <= daysInMonth; i++) {
    monthlyRecord.days.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      dayNum: i,
      work: 0,
      rest: 24, // Assumed resting unless working
      compliant: true,
      violations: [],
      logs: []
    });
  }

  // Sort logs chronologically to pair INs and OUTs
  const sortedLogs = logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Process pairs to calculate daily work
  let currentIn = null;

  for (const log of sortedLogs) {
    if (log.type === 'IN') {
      currentIn = log;
    } else if (log.type === 'OUT' && currentIn) {
      const inTime = new Date(currentIn.timestamp);
      const outTime = new Date(log.timestamp);
      
      const inDay = inTime.getDate();
      const outDay = outTime.getDate();
      
      // Handle shifts crossing midnight (basic support)
      if (inDay === outDay) {
        const hours = getHoursDifference(inTime, outTime);
        monthlyRecord.days[inDay - 1].work += hours;
        monthlyRecord.days[inDay - 1].rest -= hours;
        monthlyRecord.days[inDay - 1].logs.push({ in: inTime, out: outTime, hours });
      } else {
        // Split shift at midnight
        const midnight = new Date(outTime);
        midnight.setHours(0, 0, 0, 0);
        
        const hoursBeforeMidnight = getHoursDifference(inTime, midnight);
        const hoursAfterMidnight = getHoursDifference(midnight, outTime);

        monthlyRecord.days[inDay - 1].work += hoursBeforeMidnight;
        monthlyRecord.days[inDay - 1].rest -= hoursBeforeMidnight;
        monthlyRecord.days[inDay - 1].logs.push({ in: inTime, out: midnight, hours: hoursBeforeMidnight });

        monthlyRecord.days[outDay - 1].work += hoursAfterMidnight;
        monthlyRecord.days[outDay - 1].rest -= hoursAfterMidnight;
        monthlyRecord.days[outDay - 1].logs.push({ in: midnight, out: outTime, hours: hoursAfterMidnight });
      }
      currentIn = null;
    }
  }

  // Evaluate Compliance Constraints
  let rolling7DayRest = 0;

  for (let i = 0; i < daysInMonth; i++) {
    const dayRecord = monthlyRecord.days[i];
    
    // Round to 1 decimal place for cleaner reporting
    dayRecord.work = Math.round(dayRecord.work * 10) / 10;
    dayRecord.rest = Math.round(dayRecord.rest * 10) / 10;

    // Rule 1: Minimum 10 hours rest (Maximum 14 hours work) in any 24h
    if (dayRecord.rest < MIN_REST_24H || dayRecord.work > MAX_WORK_24H) {
      dayRecord.compliant = false;
      dayRecord.violations.push(`STCW Rule: Minimum 10h rest in 24h failed. Rested: ${dayRecord.rest}h`);
    }

    // Rule 2: 77 hours rest in any 7-day period
    rolling7DayRest += dayRecord.rest;
    
    // Once we have a 7-day window
    if (i >= 6) {
      if (rolling7DayRest < MIN_REST_7D) {
        dayRecord.compliant = false;
        dayRecord.violations.push(`STCW Rule: Minimum 77h rest in 7-days failed. Last 7 days rest: ${Math.round(rolling7DayRest * 10) / 10}h`);
      }
      // Subtract the day falling out of the sliding window for the next iteration
      rolling7DayRest -= monthlyRecord.days[i - 6].rest;
    }
  }

  // Overall Month Compliance
  monthlyRecord.overallCompliant = monthlyRecord.days.every(d => d.compliant);

  return monthlyRecord;
};
