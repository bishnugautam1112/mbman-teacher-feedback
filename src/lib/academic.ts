/**
 * Academic Calendar Utility
 * Based on: Winter (Dec-Mar) = Odd Semesters (1,3,5,7)
 * Summer (Apr-Oct) = Even Semesters (2,4,6,8)
 * November is treated as the start of Winter.
 */

export function getCurrentAcademicState(date = new Date()) {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth(); // 0 = Jan, 11 = Dec

  let yearStart = currentYear;
  let isSummer = false;

  if (currentMonth >= 0 && currentMonth <= 2) {
    // Jan, Feb, Mar belongs to the Winter that started the previous year
    yearStart = currentYear - 1;
    isSummer = false;
  } else if (currentMonth >= 3 && currentMonth <= 9) {
    // April to October is Summer
    yearStart = currentYear;
    isSummer = true;
  } else {
    // Nov, Dec is the start of Winter for the current year
    yearStart = currentYear;
    isSummer = false;
  }

  return { yearStart, isSummer };
}

/**
 * Calculates the exact current semester (1-8) based on a student's batch year.
 * Returns "PASSED_OUT" if they exceed 8 semesters.
 */
export function getCurrentSemester(batchYear: number): number | "PASSED_OUT" {
  const state = getCurrentAcademicState();
  
  let sem = (state.yearStart - batchYear) * 2;
  if (!state.isSummer) {
    sem += 1;
  }

  if (sem > 8) return "PASSED_OUT";
  if (sem < 1) return 1; // Fallback for edge cases
  
  return sem;
}

/**
 * Calculates a student's Batch Year based on what semester they claim to be in right now.
 * This anchors them to a specific batch, preventing their semester from becoming obsolete.
 */
export function calculateBatchYear(currentSemester: number): number {
  const state = getCurrentAcademicState();
  
  if (state.isSummer) {
    return state.yearStart - Math.floor(currentSemester / 2);
  } else {
    return state.yearStart - Math.floor((currentSemester - 1) / 2);
  }
}
