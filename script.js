/**
 * Chronological Age Calculator - Script Logic
 * Author: AgeWise
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const ageForm = document.getElementById('ageForm');
  const dobInput = document.getElementById('dob');
  const asOfInput = document.getElementById('asOfDate');
  const btnCalculate = document.getElementById('btnCalculate');
  const btnReset = document.getElementById('btnReset');
  const errorBanner = document.getElementById('errorBanner');
  const errorMessage = document.getElementById('errorMessage');
  const resultsSection = document.getElementById('resultsSection');

  // Primary Result Elements
  const resYears = document.getElementById('resYears');
  const resMonths = document.getElementById('resMonths');
  const resDays = document.getElementById('resDays');
  const labelYears = document.getElementById('labelYears');
  const labelMonths = document.getElementById('labelMonths');
  const labelDays = document.getElementById('labelDays');
  const formattedSummaryText = document.getElementById('formattedSummaryText');
  const testFormatValue = document.getElementById('testFormatValue');
  const btnCopyTesting = document.getElementById('btnCopyTesting');
  const copyBtnText = document.getElementById('copyBtnText');

  // Information Card Elements
  const dayOfBirthText = document.getElementById('dayOfBirthText');
  const nextBirthdayDaysText = document.getElementById('nextBirthdayDaysText');
  const nextBirthdayDateText = document.getElementById('nextBirthdayDateText');

  // Breakdown Stat Elements
  const statTotalMonths = document.getElementById('statTotalMonths');
  const statTotalWeeks = document.getElementById('statTotalWeeks');
  const statTotalDays = document.getElementById('statTotalDays');
  const statTotalHours = document.getElementById('statTotalHours');
  const statTotalMinutes = document.getElementById('statTotalMinutes');
  const statTotalSeconds = document.getElementById('statTotalSeconds');

  // Initialize Default State
  const today = new Date();
  const todayFormatted = formatDateToInput(today);
  
  // Set default As Of date to today
  asOfInput.value = todayFormatted;
  dobInput.max = todayFormatted;

  // Event Listeners
  ageForm.addEventListener('submit', handleCalculate);
  btnReset.addEventListener('click', handleReset);

  if (btnCopyTesting) {
    btnCopyTesting.addEventListener('click', () => {
      if (!testFormatValue) return;
      const textToCopy = testFormatValue.textContent;
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy';
        }, 2000);
      }).catch(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy';
        }, 2000);
      });
    });
  }

  dobInput.addEventListener('input', clearError);
  asOfInput.addEventListener('input', () => {
    clearError();
    // Keep dob max constraint updated if asOf date changes
    if (asOfInput.value) {
      dobInput.max = asOfInput.value;
    }
  });

  /**
   * Main Calculation Handler
   */
  function handleCalculate(e) {
    e.preventDefault();
    clearError();

    const dobVal = dobInput.value;
    const asOfVal = asOfInput.value;

    // 1. Validation Checks
    if (!dobVal) {
      showError('Please enter a valid date of birth.');
      dobInput.focus();
      return;
    }

    const dobDate = parseLocalDate(dobVal);
    const asOfDate = asOfVal ? parseLocalDate(asOfVal) : new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (!isValidDate(dobDate)) {
      showError('Please enter a valid date of birth.');
      return;
    }

    if (!isValidDate(asOfDate)) {
      showError('Please enter a valid "Calculate Age As Of" date.');
      return;
    }

    if (dobDate > asOfDate) {
      showError('Date of birth cannot be after the "Calculate Age As Of" date.');
      return;
    }

    // 2. Perform Age Calculation
    const ageResult = calculateChronologicalAge(dobDate, asOfDate);

    // 3. Render Results
    renderResults(dobDate, asOfDate, ageResult);
  }

  /**
   * Chronological Age Algorithm
   */
  function calculateChronologicalAge(dob, asOf) {
    const y1 = dob.getFullYear();
    const m1 = dob.getMonth();
    const d1 = dob.getDate();

    const y2 = asOf.getFullYear();
    const m2 = asOf.getMonth();
    const d2 = asOf.getDate();

    let years = y2 - y1;
    let months = m2 - m1;
    let days = d2 - d1;

    // Borrow days from previous month if days < 0
    if (days < 0) {
      const prevMonth = m2 === 0 ? 11 : m2 - 1;
      const prevYear = m2 === 0 ? y2 - 1 : y2;
      const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
      days += daysInPrevMonth;
      months -= 1;
    }

    // Borrow months from previous year if months < 0
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    // Lifetime Metrics Calculations
    const diffMs = asOf.getTime() - dob.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;

    return {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      totalHours,
      totalMinutes,
      totalSeconds
    };
  }

  /**
   * Render All Calculation Outputs to UI
   */
  function renderResults(dob, asOf, res) {
    // Primary Age Hero Display
    resYears.textContent = res.years;
    resMonths.textContent = res.months;
    resDays.textContent = res.days;

    labelYears.textContent = res.years === 1 ? 'Year' : 'Years';
    labelMonths.textContent = res.months === 1 ? 'Month' : 'Months';
    labelDays.textContent = res.days === 1 ? 'Day' : 'Days';

    formattedSummaryText.textContent = `${res.years} ${labelYears.textContent}, ${res.months} ${labelMonths.textContent}, ${res.days} ${labelDays.textContent}`;

    // Standardized Testing Clinical Format (Y;MM;DD)
    if (testFormatValue) {
      const mmStr = String(res.months).padStart(2, '0');
      const ddStr = String(res.days).padStart(2, '0');
      testFormatValue.textContent = `${res.years};${mmStr};${ddStr}`;
    }

    // Day of Birth
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bornDayName = weekdays[dob.getDay()];
    dayOfBirthText.textContent = `You were born on ${bornDayName}.`;

    // Next Birthday Logic
    calculateNextBirthday(dob, asOf);

    // Lifetime Breakdown Metrics
    statTotalMonths.textContent = formatNumber(res.totalMonths);
    statTotalWeeks.textContent = formatNumber(res.totalWeeks);
    statTotalDays.textContent = formatNumber(res.totalDays);
    statTotalHours.textContent = formatNumber(res.totalHours);
    statTotalMinutes.textContent = formatNumber(res.totalMinutes);
    statTotalSeconds.textContent = formatNumber(res.totalSeconds);

    // Show Results Section
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Next Birthday Calculations
   */
  function calculateNextBirthday(dob, asOf) {
    const dobMonth = dob.getMonth();
    const dobDay = dob.getDate();

    // Check if today is the birthday
    if (dobMonth === asOf.getMonth() && dobDay === asOf.getDate()) {
      nextBirthdayDaysText.innerHTML = 'Happy Birthday! 🎉';
      nextBirthdayDateText.textContent = 'Your birthday is today!';
      return;
    }

    let targetYear = asOf.getFullYear();
    let nextBday = createValidBirthdayDate(targetYear, dobMonth, dobDay);

    // If birthday has already passed this year, get birthday for next year
    if (nextBday < asOf) {
      targetYear += 1;
      nextBday = createValidBirthdayDate(targetYear, dobMonth, dobDay);
    }

    const diffMs = nextBday.getTime() - asOf.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      nextBirthdayDaysText.innerHTML = 'Happy Birthday! 🎉';
      nextBirthdayDateText.textContent = 'Your birthday is today!';
    } else {
      nextBirthdayDaysText.textContent = `Your next birthday is in ${diffDays} day${diffDays === 1 ? '' : 's'}.`;
      const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedBdayDate = nextBday.toLocaleDateString('en-US', dateOptions);
      nextBirthdayDateText.textContent = `Date: ${formattedBdayDate}`;
    }
  }

  /**
   * Handles leap years for Feb 29 birthdates when calculating next birthday in a non-leap year
   */
  function createValidBirthdayDate(year, month, day) {
    if (month === 1 && day === 29 && !isLeapYear(year)) {
      // In a non-leap year, Feb 29 is celebrated on March 1 (or Feb 28). March 1 is standard.
      return new Date(year, 2, 1);
    }
    return new Date(year, month, day);
  }

  /**
   * Helper Utility Functions
   */
  function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  function formatDateToInput(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function getDaysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorBanner.classList.remove('hidden');
  }

  function clearError() {
    errorBanner.classList.add('hidden');
  }

  /**
   * Reset Handler
   */
  function handleReset() {
    dobInput.value = '';
    asOfInput.value = todayFormatted;
    dobInput.max = todayFormatted;
    clearError();
    if (testFormatValue) {
      testFormatValue.textContent = '0;00;00';
    }
    if (copyBtnText) {
      copyBtnText.textContent = 'Copy';
    }
    resultsSection.classList.add('hidden');
    dobInput.focus();
  }
});
