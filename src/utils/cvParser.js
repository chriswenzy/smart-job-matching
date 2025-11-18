// utils/cvParser.js
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
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

export async function parseCV(fileBuffer, fileType) {
  try {
    let text = "";

    // Read file based on type
    if (fileType === "application/pdf") {
      const data = await pdfParse(fileBuffer);
      text = data.text;
    } else if (fileType.includes("word") || fileType.includes("document")) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    }

    // Extract information from CV text
    const skills = extractSkills(text);
    const education = extractEducation(text);
    const experience = extractExperience(text);
    const institution = extractInstitution(text);
    const degree = extractDegree(text);

    return {
      text,
      skills,
      education,
      experience,
      institution,
      degree,
      fieldOfStudy: extractFieldOfStudy(text),
      experienceText: extractExperienceText(text),
    };
  } catch (error) {
    console.error("CV parsing error:", error);
    throw new Error("Failed to parse CV");
  }
}

function extractSkills(text) {
  const foundSkills = [];

  COMMON_SKILLS.forEach((skill) => {
    if (text.toLowerCase().includes(skill)) {
      foundSkills.push(skill);
    }
  });

  // Also look for skills mentioned in context
  const skillIndicators = [
    "skills",
    "technologies",
    "proficient in",
    "experience with",
  ];
  skillIndicators.forEach((indicator) => {
    const index = text.toLowerCase().indexOf(indicator);
    if (index !== -1) {
      const skillSection = text.substring(index, index + 500).toLowerCase();
      COMMON_SKILLS.forEach((skill) => {
        if (skillSection.includes(skill) && !foundSkills.includes(skill)) {
          foundSkills.push(skill);
        }
      });
    }
  });

  return [...new Set(foundSkills)]; // Remove duplicates
}

function extractEducation(text) {
  const education = [];
  const educationIndicators = [
    "b.sc",
    "b.eng",
    "b.tech",
    "b.a",
    "b.ed",
    "bachelors",
    "m.sc",
    "m.eng",
    "m.tech",
    "m.a",
    "masters",
    "phd",
    "ond",
    "hnd",
    "ssc",
    "waec",
    "neco",
  ];

  educationIndicators.forEach((indicator) => {
    if (text.toLowerCase().includes(indicator)) {
      education.push(indicator.toUpperCase());
    }
  });

  return education;
}

function extractInstitution(text) {
  for (const institution of NIGERIAN_INSTITUTIONS) {
    if (text.toLowerCase().includes(institution)) {
      return institution;
    }
  }
  return "Not specified";
}

function extractDegree(text) {
  const degreePatterns = [
    /b\.?sc\.?/i,
    /b\.?eng\.?/i,
    /b\.?tech\.?/i,
    /b\.?a\.?/i,
    /m\.?sc\.?/i,
    /m\.?eng\.?/i,
    /m\.?tech\.?/i,
    /m\.?a\.?/i,
    /phd/i,
    /doctorate/i,
    /hnd/i,
    /ond/i,
  ];

  for (const pattern of degreePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].toUpperCase();
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
  ];

  for (const field of fields) {
    if (text.toLowerCase().includes(field)) {
      return field;
    }
  }

  return "Not specified";
}

function extractExperience(text) {
  const experiencePatterns = [
    /(\d+)\s* years?/i,
    /experience.*?(\d+)/i,
    /(\d+)\+?\s*years?/i,
  ];

  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] + " years";
    }
  }

  return "0 years";
}

function extractExperienceText(text) {
  const experienceIndicators = ["experience", "work history", "employment"];

  for (const indicator of experienceIndicators) {
    const index = text.toLowerCase().indexOf(indicator);
    if (index !== -1) {
      return text.substring(index, Math.min(index + 1000, text.length));
    }
  }

  return text.substring(0, Math.min(500, text.length));
}
