// Fall 2023 Closing Merits
const closingMerits = {
    'BSCS': 85.5,
    'BSEngineering': 82.1,
    'BSCyberSecurity': 84.0,
    'BSAI': 84.9,
    'BBA': 78.5,
    'BSPsychology': 75.0,
};
export function calculateAggregate(ssc_percentage, hssc_percentage, test_score) {
    const sscWeight = 0.30;
    const hsscWeight = 0.40;
    const testWeight = 0.30;
    const aggregate = (ssc_percentage * sscWeight) + (hssc_percentage * hsscWeight) + (test_score * testWeight);
    return parseFloat(aggregate.toFixed(2));
}
export function predictAdmissionChance(aggregate, program) {
    const formattedProgramKey = `BS${program.replace(/\s+/g, '').toUpperCase()}`;
    // Find the key in a type-safe way
    const programKey = Object.keys(closingMerits).find(k => k.toUpperCase() === formattedProgramKey);
    if (!programKey) {
        return `I don't have the closing merit data for ${program}. However, your calculated aggregate is **${aggregate}%**. You can compare this with the data on the official university website.`;
    }
    const closingMerit = closingMerits[programKey];
    const difference = aggregate - closingMerit;
    let analysis = `Your calculated aggregate is **${aggregate}%**. The closing merit for ${program} last year was **${closingMerit}%**.\n\n`;
    if (difference >= 2) {
        analysis += "✅ **High Chance:** Your aggregate is comfortably above last year's closing merit. You have a very strong chance of getting admitted.";
    }
    else if (difference >= 0) {
        analysis += "👍 **Good Chance:** Your aggregate is above the closing merit. You have a good chance, but admission depends on this year's applicant pool.";
    }
    else if (difference > -2) {
        analysis += "⚠️ **Borderline Chance:** Your aggregate is slightly below last year's closing merit. You are a borderline case. Admission will depend on the merit of other applicants this year. It's recommended to have backup options.";
    }
    else {
        analysis += "❌ **Low Chance:** Your aggregate is significantly below last year's closing merit. It's unlikely you will be admitted to this program based on this data. Consider applying to other programs or improving your test score.";
    }
    analysis += "\n\n*Disclaimer: This is just an estimation based on past data and a standard weighting formula. Actual closing merits and weightings can vary each year. Always refer to official university announcements.*";
    return analysis;
}
