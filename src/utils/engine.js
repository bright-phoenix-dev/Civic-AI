/**
 * Determines the appropriate municipal department based on the complaint description.
 *
 * @param {string} description - The complaint text or AI-generated description.
 * @returns {string} The name of the routed department.
 * @throws {TypeError} If the input is not a valid string.
 */
export function routeDepartment(description) {
  if (typeof description !== 'string') {
    throw new TypeError(`Invalid input: Expected string but received ${typeof description}`);
  }
  
  const desc = description.toLowerCase();
  if (desc.includes('pothole') || desc.includes('road') || desc.includes('street')) {
    return 'Public Works';
  }
  if (desc.includes('water') || desc.includes('leak') || desc.includes('pipe') || desc.includes('drain')) {
    return 'Water & Sewage Board';
  }
  if (desc.includes('garbage') || desc.includes('trash') || desc.includes('waste')) {
    return 'Sanitation';
  }
  if (desc.includes('light') || desc.includes('park') || desc.includes('tree')) {
    return 'Parks & Recreation';
  }
  return 'General Services';
}

/**
 * Determines if a complaint is overdue based on its age (simulated days).
 * Returns specific escalation string statuses.
 * Evaluates boundary condition exactly at >= 5.0.
 * 
 * @param {number} pendingDays - The number of days the complaint has been pending.
 * @returns {string} Escalation status flag ('URGENT_ESCALATION' or 'NORMAL').
 * @throws {TypeError} If pendingDays is not a number.
 */
export function checkEscalation(pendingDays) {
  if (typeof pendingDays !== 'number' || isNaN(pendingDays)) {
    throw new TypeError(`Invalid input: Expected number but received ${typeof pendingDays}`);
  }
  
  if (pendingDays >= 5.0) {
    return 'URGENT_ESCALATION';
  }
  return 'NORMAL';
}

/**
 * Calculates priority based on complaint type and current simulated weather conditions.
 * 
 * @param {string} type - The general category of the complaint (e.g. 'water leak').
 * @param {string} weather - Current simulated weather ('Clear' or 'Heavy Rain').
 * @returns {string} 'CRITICAL' or 'STANDARD'.
 * @throws {TypeError} If type or weather is not a string.
 */
export function calculatePriority(type, weather) {
  if (typeof type !== 'string' || typeof weather !== 'string') {
    throw new TypeError('Invalid input: Expected string arguments');
  }

  const t = type.toLowerCase();
  if (weather === 'Heavy Rain' && (t.includes('water') || t.includes('leak') || t.includes('flood') || t.includes('drain'))) {
    return 'CRITICAL';
  }
  return 'STANDARD';
}
