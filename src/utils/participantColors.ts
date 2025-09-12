/**
 * Utility function to get background color based on participant GroupType
 * @param groupType - The participant's group type ('Study', 'Controlled', or null)
 * @returns Tailwind CSS class for background color
 */
export const getParticipantBackgroundColor = (groupType: string | null): string => {
  if (groupType === 'Study') {
    return 'bg-[#EBF6D6]'; // Study Group color
  } else if (groupType === 'Controlled') {
    return 'bg-[#FFE8DA]'; // Controlled Group color
  } else {
    return 'bg-[#D2EBF8]'; // Null/Unassigned color
  }
};

/**
 * Color mapping for reference:
 * - Study Group: bg-[#EBF6D6] (light green)
 * - Controlled Group: bg-[#FFE8DA] (light orange/peach)
 * - Null/Unassigned: bg-[#D2EBF8] (light blue)
 */
