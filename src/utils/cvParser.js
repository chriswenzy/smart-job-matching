// utils/cvParser.js
import * as pdfParse from "pdf-parse";
import * as mammoth from "mammoth";
import natural from "natural";

const { WordTokenizer } = natural;

// Common skills database for Nigerian graduates
const COMMON_SKILLS = [
  "javascript",
  "python",
  "java",
  "react",
  "node.js",
  "html",
  "css",
  "sql",
  "mongodb",
  "express",
  "vue",
  "angular",
  "typescript",
  "php",
  "laravel",
  "django",
  "flask",
  "spring",
  "c#",
  "c++",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "github",
  "rest api",
  "graphql",
  "firebase",
  "mysql",
  "postgresql",
  "redis",
  "machine learning",
  "data analysis",
  "excel",
  "power bi",
  "digital marketing",
  "seo",
  "social media",
  "content writing",
  "project management",
  "agile",
  "scrum",
  "communication",
  "problem solving",
  "teamwork",
  "leadership",
];

// Nigerian universities and institutions
const NIGERIAN_INSTITUTIONS = [
  "university of lagos",
  "university of ibadan",
  "university of nigeria",
  "obafemi awolowo university",
  "ahmadu bello university",
  "federal university of technology",
  "covenant university",
  "university of benin",
  "university of ilorin",
  "bayero university",
  "university of port harcourt",
  "nnamdi azikiwe university",
  "university of maiduguri",
  "university of agriculture",
  "federal university of lafia",
  "polytechnic",
  "college of education",
];

// export async function parseCV(fileBuffer, fileType) {
//   try {
//     let text = "";

//     // Read file based on type
//     if (fileType === "application/pdf") {
//       const data = await pdfParse.default(fileBuffer);
//       text = data.text;
//     } else if (fileType.includes("word") || fileType.includes("document")) {
//       const result = await mammoth.extractRawText({ buffer: fileBuffer });
//       text = result.value;
//     } else if (fileType === "text/plain") {
//       text = fileBuffer.toString("utf8");
//     }

//     // If no text was extracted, return empty data
//     if (!text || text.trim().length === 0) {
//       return {
//         text: "No text extracted from CV",
//         skills: [],
//         education: [],
//         experience: "0 years",
//         institution: "Not specified",
//         degree: "Not specified",
//         fieldOfStudy: "Not specified",
//         experienceText: "No experience information found",
//       };
//     }

//     // Extract information from CV text
//     const skills = extractSkills(text);
//     const education = extractEducation(text);
//     const experience = extractExperience(text);
//     const institution = extractInstitution(text);
//     const degree = extractDegree(text);

//     return {
//       text: text.substring(0, 2000), // Limit text length
//       skills,
//       education,
//       experience,
//       institution,
//       degree,
//       fieldOfStudy: extractFieldOfStudy(text),
//       experienceText: extractExperienceText(text),
//     };
//   } catch (error) {
//     console.error("CV parsing error:", error);
//     throw new Error("Failed to parse CV: " + error.message);
//   }
// }

// Alternative approach with dynamic imports
export async function parseCV(fileBuffer, fileType) {
  try {
    let text = "";

    if (fileType === "application/pdf") {
      // Dynamically import pdf-parse
      const pdfParse = await import("pdf-parse");
      const data = await pdfParse.default(fileBuffer);
      text = data.text;
    } else if (fileType.includes("word") || fileType.includes("document")) {
      // Dynamically import mammoth
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else if (fileType === "text/plain") {
      text = fileBuffer.toString("utf8");
    }

    // ... rest of the parsing logic
  } catch (error) {
    console.error("CV parsing error:", error);
    throw new Error("Failed to parse CV: " + error.message);
  }
}
function extractSkills(text) {
  const foundSkills = new Set();

  // Direct skill matching
  COMMON_SKILLS.forEach((skill) => {
    const regex = new RegExp(`\\b${skill}\\b`, "i");
    if (regex.test(text)) {
      foundSkills.add(skill);
    }
  });

  // Look for skills section
  const skillIndicators = [
    "skills",
    "technologies",
    "proficient in",
    "experience with",
    "technical skills",
    "programming languages",
  ];

  skillIndicators.forEach((indicator) => {
    const index = text.toLowerCase().indexOf(indicator);
    if (index !== -1) {
      const skillSection = text
        .substring(index, Math.min(index + 1000, text.length))
        .toLowerCase();
      COMMON_SKILLS.forEach((skill) => {
        const regex = new RegExp(`\\b${skill}\\b`, "i");
        if (regex.test(skillSection)) {
          foundSkills.add(skill);
        }
      });
    }
  });

  return Array.from(foundSkills);
}

function extractEducation(text) {
  const education = new Set();
  const educationIndicators = [
    { pattern: /b\.?sc\.?/i, name: "B.Sc" },
    { pattern: /b\.?eng\.?/i, name: "B.Eng" },
    { pattern: /b\.?tech\.?/i, name: "B.Tech" },
    { pattern: /b\.?a\.?/i, name: "B.A" },
    { pattern: /b\.?ed\.?/i, name: "B.Ed" },
    { pattern: /bachelors?/i, name: "Bachelor's" },
    { pattern: /m\.?sc\.?/i, name: "M.Sc" },
    { pattern: /m\.?eng\.?/i, name: "M.Eng" },
    { pattern: /m\.?tech\.?/i, name: "M.Tech" },
    { pattern: /m\.?a\.?/i, name: "M.A" },
    { pattern: /masters?/i, name: "Master's" },
    { pattern: /ph\.?d/i, name: "PhD" },
    { pattern: /doctorate/i, name: "Doctorate" },
    { pattern: /hnd/i, name: "HND" },
    { pattern: /ond/i, name: "OND" },
    { pattern: /ssc/i, name: "SSC" },
    { pattern: /waec/i, name: "WAEC" },
    { pattern: /neco/i, name: "NECO" },
  ];

  educationIndicators.forEach(({ pattern, name }) => {
    if (pattern.test(text)) {
      education.add(name);
    }
  });

  return Array.from(education);
}

function extractInstitution(text) {
  const lowerText = text.toLowerCase();
  for (const institution of NIGERIAN_INSTITUTIONS) {
    if (lowerText.includes(institution)) {
      // Capitalize each word
      return institution
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  // Try to find any university mention
  const universityMatch = text.match(
    /(university|polytechnic|college|institute)/i
  );
  if (universityMatch) {
    return "University (Not specified)";
  }

  return "Not specified";
}

function extractDegree(text) {
  const degreePatterns = [
    { pattern: /b\.?sc\.?/i, name: "B.Sc" },
    { pattern: /b\.?eng\.?/i, name: "B.Eng" },
    { pattern: /b\.?tech\.?/i, name: "B.Tech" },
    { pattern: /b\.?a\.?/i, name: "B.A" },
    { pattern: /m\.?sc\.?/i, name: "M.Sc" },
    { pattern: /m\.?eng\.?/i, name: "M.Eng" },
    { pattern: /m\.?tech\.?/i, name: "M.Tech" },
    { pattern: /m\.?a\.?/i, name: "M.A" },
    { pattern: /ph\.?d/i, name: "PhD" },
    { pattern: /doctorate/i, name: "Doctorate" },
    { pattern: /hnd/i, name: "HND" },
    { pattern: /ond/i, name: "OND" },
  ];

  for (const { pattern, name } of degreePatterns) {
    if (pattern.test(text)) {
      return name;
    }
  }

  return "Not specified";
}

function extractFieldOfStudy(text) {
  const fields = [
    "computer science",
    "software engineering",
    "information technology",
    "electrical engineering",
    "mechanical engineering",
    "civil engineering",
    "business administration",
    "economics",
    "accounting",
    "marketing",
    "mathematics",
    "statistics",
    "physics",
    "chemistry",
    "biology",
    "medicine",
    "law",
    "political science",
    "sociology",
    "psychology",
  ];

  const lowerText = text.toLowerCase();
  for (const field of fields) {
    if (lowerText.includes(field)) {
      return field
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

  return "Not specified";
}

function extractExperience(text) {
  const experiencePatterns = [
    /(\d+)\s*years?/i,
    /experience.*?(\d+)/i,
    /(\d+)\+?\s*years?/i,
    /(\d+)\s*yr/i,
  ];

  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match && parseInt(match[1]) > 0) {
      const years = parseInt(match[1]);
      return years === 1 ? "1 year" : `${years} years`;
    }
  }

  // Check for internship/fresh graduate indicators
  const freshGraduateIndicators = [
    /fresh graduate/i,
    /recent graduate/i,
    /entry level/i,
    /internship/i,
    /nysc/i,
    /corp member/i,
  ];

  for (const indicator of freshGraduateIndicators) {
    if (indicator.test(text)) {
      return "0 years";
    }
  }

  return "0 years";
}

function extractExperienceText(text) {
  const experienceIndicators = [
    "experience",
    "work history",
    "employment history",
    "professional experience",
    "work experience",
  ];

  for (const indicator of experienceIndicators) {
    const index = text.toLowerCase().indexOf(indicator);
    if (index !== -1) {
      const start = Math.max(0, index - 200); // Include some context before
      const end = Math.min(index + 800, text.length); // Limit length
      return text.substring(start, end).trim();
    }
  }

  // If no experience section found, return first part of text
  return text.substring(0, Math.min(500, text.length)).trim();
}
