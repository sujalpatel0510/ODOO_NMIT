/**
 * Utility functions for generating and formatting Login IDs
 */

/**
 * Extracts the first two letters of the first name and first two letters of the last name.
 * Handles single names, short names, and multiple middle names.
 * @param {string} fullName 
 * @returns {string} 4-character uppercase initials
 */
export function generateInitials(fullName) {
  if (!fullName) return 'XXXX';
  
  const parts = fullName.trim().split(/\s+/);
  let first = parts[0] || '';
  let last = parts[parts.length - 1] || '';

  if (parts.length === 1) {
    const single = parts[0].toUpperCase();
    if (single.length >= 4) {
      return single.slice(0, 4);
    }
    return single.padEnd(4, 'X');
  }

  // Get first 2 letters and pad if too short
  let firstPart = first.slice(0, 2).toUpperCase().padEnd(2, 'X');
  let lastPart = last.slice(0, 2).toUpperCase().padEnd(2, 'X');

  return firstPart + lastPart;
}

/**
 * Formats a Login ID from its components
 * @param {string} companyCode 
 * @param {string} initials 
 * @param {number|string} year 
 * @param {number} serial 
 * @returns {string} concatenated uppercase Login ID
 */
export function formatLoginId(companyCode, initials, year, serial) {
  const cleanCode = (companyCode || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cleanInitials = (initials || 'XXXX').toUpperCase();
  const paddedSerial = String(serial || 1).padStart(3, '0');
  
  return `${cleanCode}${cleanInitials}${year}${paddedSerial}`;
}

/**
 * Convenient helper to generate a formatted Login ID from an object
 */
export function generateLoginId({ companyCode, fullName, joiningYear = new Date().getFullYear(), sequenceNumber = 1 }) {
  const initials = generateInitials(fullName);
  return formatLoginId(companyCode, initials, joiningYear, sequenceNumber);
}

/**
 * Queries the database for the next sequential serial number for a company in a given year.
 * @param {object} supabase - Supabase client
 * @param {string} companyId - UUID of the company
 * @param {number} year - Joining year
 * @returns {Promise<number>} next serial number (starts at 1)
 */
export async function getNextSerial(supabase, companyId, year) {
  const { data, error } = await supabase
    .from('profiles')
    .select('login_id')
    .eq('company_id', companyId)
    .eq('joining_year', year);

  if (error) {
    throw new Error(`Database error generating serial: ${error.message}`);
  }

  let maxSerial = 0;
  if (data && data.length > 0) {
    data.forEach((p) => {
      const loginId = p.login_id;
      if (loginId && loginId.length >= 3) {
        // Extract the last 3 digits
        const serialStr = loginId.slice(-3);
        const serialNum = parseInt(serialStr, 10);
        if (!isNaN(serialNum) && serialNum > maxSerial) {
          maxSerial = serialNum;
        }
      }
    });
  }

  return maxSerial + 1;
}
