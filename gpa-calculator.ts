// Define the structure of the grade points object
const gradePoints = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0,
    'F': 0.0
};

// Create a type that represents the valid keys of our gradePoints object
type Grade = keyof typeof gradePoints;

export function calculateGPA(subjects: { grade: string, creditHours: number }[]): string {
    let totalPoints = 0;
    let totalCreditHours = 0;

    for (const subject of subjects) {
        // Coerce the input string to our Grade type
        const grade = subject.grade.toUpperCase() as Grade;
        const creditHours = subject.creditHours;

        // Check if the coerced grade is a valid key in our gradePoints object
        if (gradePoints[grade] !== undefined && !isNaN(creditHours) && creditHours > 0) {
            totalPoints += gradePoints[grade] * creditHours;
            totalCreditHours += creditHours;
        } else {
            return `Error: Invalid input found. Please use a valid grade (A, B+, C-, etc.) and a positive number for credit hours.`;
        }
    }

    if (totalCreditHours === 0) {
        return "No valid subjects were provided to calculate the GPA.";
    }

    const gpa = totalPoints / totalCreditHours;
    return `Your calculated GPA is **${gpa.toFixed(2)}** based on ${totalCreditHours} credit hours.`;
}