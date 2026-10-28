export const calculateAge = (dateOfBirth) => {
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) {
    throw new Error('Invalid date of birth provided');
  }

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

export const verifyAgeRequirement = (dateOfBirth, minimumAge = 18) => {
  const age = calculateAge(dateOfBirth);
  if (age < minimumAge) {
    return {
      isValid: false,
      age,
      message: `You must be at least ${minimumAge} years old to create an account.`
    };
  }
  return { isValid: true, age };
};
