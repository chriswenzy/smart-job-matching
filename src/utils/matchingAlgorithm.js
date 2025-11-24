import { prisma } from "@/lib/prisma/prisma";
import natural from "natural";

const { TfIdf } = natural;

export async function calculateStudentJobMatches(studentId) {
  try {
    // Get student profile with skills (as scalar field)
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        studentProfile: true, // Remove the skills include
      },
    });

    if (!student || !student.studentProfile) {
      throw new Error("Student profile not found");
    }

    // Parse skills from the scalar field
    const studentSkills = student.studentProfile.skills || [];
    // If skills is a JSON string, you might need to parse it:
    // const studentSkills = JSON.parse(student.studentProfile.skills || '[]');

    // Get active, approved jobs
    const jobs = await prisma.job.findMany({
      where: {
        isApproved: true,
        isActive: true,
      },
      include: {
        employer: {
          include: {
            employerProfile: {
              select: {
                companyName: true,
                industry: true,
                companySize: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    // Calculate matches based on skills and profile
    const matches = jobs.map((job) => {
      let score = 0;

      // Basic matching logic
      if (studentSkills.length > 0 && job.requirements) {
        const normalizedStudentSkills = studentSkills.map((s) =>
          s.toLowerCase().trim()
        );

        // Handle requirements - could be JSON, string, or array
        let jobRequirements = [];
        if (typeof job.requirements === "string") {
          try {
            jobRequirements = JSON.parse(job.requirements).requirements || [];
          } catch {
            // If it's not JSON, treat as raw text
            jobRequirements = job.requirements.split(",").map((r) => r.trim());
          }
        } else if (job.requirements.requirements) {
          jobRequirements = job.requirements.requirements;
        } else if (Array.isArray(job.requirements)) {
          jobRequirements = job.requirements;
        }

        // Calculate skill match
        const matchedSkills = jobRequirements.filter((req) =>
          normalizedStudentSkills.some(
            (skill) =>
              req.toLowerCase().includes(skill) ||
              skill.includes(req.toLowerCase())
          )
        );

        score =
          (matchedSkills.length / Math.max(jobRequirements.length, 1)) * 100;
      }

      // Add some randomness for demo (remove in production)
      score = Math.min(score + Math.random() * 20, 95);

      return {
        job,
        matchScore: Math.round(score),
      };
    });

    // Sort by match score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error("Error in matching algorithm:", error);
    throw error;
  }
}

export async function calculateMatchScore(student, job) {
  const studentProfile = student.studentProfile;
  const studentSkills =
    studentProfile.parsedSkills?.length > 0
      ? studentProfile.parsedSkills
      : studentProfile.skills;
  const studentExperience =
    studentProfile.parsedExperience || studentProfile.experience || "";

  const jobRequirements = job.requirements || {};
  const requiredSkills = jobRequirements.skills || [];
  const requiredEducation = jobRequirements.education || "";

  let score = 0;

  // Skill matching (40% weight)
  const skillScore = calculateSkillMatch(studentSkills, requiredSkills);
  score += skillScore * 0.4;

  // Education matching (20% weight)
  const educationScore = calculateEducationMatch(
    studentProfile,
    requiredEducation
  );
  score += educationScore * 0.2;

  // Semantic matching (30% weight)
  const semanticScore = await calculateSemanticMatch(studentProfile, job);
  score += semanticScore * 0.3;

  // Location matching (10% weight)
  const locationScore = calculateLocationMatch(student.location, job.location);
  score += locationScore * 0.1;

  return Math.round(score);
}

function calculateSkillMatch(studentSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) return 50;

  const studentSkillSet = new Set(studentSkills.map((s) => s.toLowerCase()));
  let matchedSkills = 0;

  requiredSkills.forEach((reqSkill) => {
    if (studentSkillSet.has(reqSkill.toLowerCase())) {
      matchedSkills++;
    }
  });

  return (matchedSkills / requiredSkills.length) * 100;
}

function calculateEducationMatch(studentProfile, requiredEducation) {
  if (!requiredEducation) return 50;

  const studentEdLevel = getEducationLevel(studentProfile);
  const requiredEdLevel = getEducationLevelFromString(requiredEducation);

  return studentEdLevel >= requiredEdLevel ? 100 : 50;
}

function getEducationLevel(studentProfile) {
  const levels = {
    phd: 4,
    "m.sc": 3,
    "m.eng": 3,
    masters: 3,
    "b.sc": 2,
    "b.eng": 2,
    "b.tech": 2,
    bachelors: 2,
    hnd: 2,
    ond: 1,
    ssc: 0,
  };

  const degree = studentProfile.degree?.toLowerCase() || "";
  for (const [key, value] of Object.entries(levels)) {
    if (degree.includes(key)) {
      return value;
    }
  }

  return 1; // Default to some education
}

function getEducationLevelFromString(education) {
  const levels = {
    phd: 4,
    masters: 3,
    bachelors: 2,
    degree: 2,
    diploma: 1,
    secondary: 0,
  };

  const ed = education.toLowerCase();
  for (const [key, value] of Object.entries(levels)) {
    if (ed.includes(key)) {
      return value;
    }
  }

  return 1;
}

function calculateLocationMatch(studentLocation, jobLocation) {
  if (!studentLocation || !jobLocation) return 50;

  const studentLoc = studentLocation.toLowerCase();
  const jobLoc = jobLocation.toLowerCase();

  if (studentLoc.includes("remote") || jobLoc.includes("remote")) return 100;
  if (studentLoc.includes(jobLoc) || jobLoc.includes(studentLoc)) return 100;
  if (studentLoc.includes("lagos") && jobLoc.includes("lagos")) return 100;

  return 30; // Basic score for different locations
}

async function calculateSemanticMatch(studentProfile, job) {
  const studentText = [
    ...(studentProfile.parsedSkills || studentProfile.skills || []),
    studentProfile.parsedExperience || studentProfile.experience || "",
    studentProfile.parsedEducation || studentProfile.degree || "",
  ].join(" ");

  const jobText = [job.description, ...(job.requirements?.skills || [])].join(
    " "
  );

  return new Promise((resolve) => {
    const tfidf = new TfIdf();
    tfidf.addDocument(studentText);
    tfidf.addDocument(jobText);

    const scores = [];
    tfidf.tfidfs(jobText, (i, measure) => {
      if (i === 0) scores.push(measure);
    });

    const avgScore =
      scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;
    const normalizedScore = Math.min(Math.max((avgScore + 5) * 10, 0), 100);
    resolve(normalizedScore);
  });
}
