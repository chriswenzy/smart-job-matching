import { hashPassword, generateToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export async function POST(req) {
  try {
    // For FormData, we need to parse it differently
    const formData = await req.formData();

    // Extract form values
    const email = formData.get("email");
    const password = formData.get("password");
    const fullName = formData.get("fullName");
    const phone = formData.get("phone");
    const location = formData.get("location");
    const cvFile = formData.get("cv");

    // Validate required fields
    if (!email || !password || !cvFile) {
      return Response.json(
        { message: "Email, password, and CV file are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return Response.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Process CV file - handle binary data properly
    let cvText = "";
    let parsedSkills = [];
    let parsedEducation = "";
    let parsedExperience = "";

    if (cvFile) {
      try {
        // Convert file to array buffer
        const arrayBuffer = await cvFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // For PDF files, we need to handle binary data carefully
        if (cvFile.type === "application/pdf") {
          // For PDFs, use a safer text extraction approach
          cvText = extractTextFromPDFBuffer(buffer);
        } else {
          // For text-based files (DOC, DOCX might still be binary)
          // Remove null bytes and non-printable characters before converting to text
          const cleanBuffer = buffer.filter(
            (byte) =>
              (byte !== 0x00 && byte >= 32) || byte === 10 || byte === 13
          );
          cvText = cleanBuffer.toString("utf-8").substring(0, 5000); // Limit length
        }

        // If we couldn't extract meaningful text, provide a default
        if (!cvText || cvText.trim().length < 10) {
          cvText = `CV uploaded: ${cvFile.name} (${cvFile.type})`;
        }

        // Basic parsing from the extracted text
        parsedSkills = extractSkillsFromText(cvText);
        parsedEducation = extractEducationFromText(cvText);
        parsedExperience = extractExperienceFromText(cvText);
      } catch (parseError) {
        console.error("CV parsing error:", parseError);
        cvText = `CV file: ${cvFile.name}`;
      }
    }

    // Clean the text data to ensure it's valid UTF-8
    const cleanCvText = cleanTextForDatabase(cvText);
    const cleanEducation = cleanTextForDatabase(parsedEducation);
    const cleanExperience = cleanTextForDatabase(parsedExperience);

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.trim(),
          passwordHash: hashedPassword,
          userType: "STUDENT",
          fullName: fullName?.trim() || "",
          phone: phone?.trim() || "",
          location: location?.trim() || "",
        },
      });

      // Create student profile from CV data - with cleaned text
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          cvText: cleanCvText,
          parsedSkills: parsedSkills,
          parsedEducation: cleanEducation,
          parsedExperience: cleanExperience,
          skills: parsedSkills,
          institution: extractInstitutionFromText(cleanCvText),
          degree: extractDegreeFromText(cleanCvText),
        },
      });

      return { user, studentProfile };
    });

    // Generate token
    const token = generateToken(result.user);

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = result.user;

    return Response.json(
      {
        message: "Student profile created successfully from CV",
        token,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CV registration error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2002") {
      return Response.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    return Response.json(
      { message: "Failed to create profile from CV" },
      { status: 500 }
    );
  }
}

// Helper function to clean text for database storage
function cleanTextForDatabase(text) {
  if (!text) return "";

  // Remove null bytes and other problematic characters
  return text
    .replace(/\0/g, "") // Remove null bytes
    .replace(/[^\x20-\x7E\n\r\t]/g, "") // Remove non-printable characters except newlines and tabs
    .substring(0, 5000); // Limit length for database
}

// Basic PDF text extraction (simplified)
function extractTextFromPDFBuffer(buffer) {
  try {
    // Simple approach: extract text between parentheses (common in PDF text objects)
    const bufferString = buffer.toString("binary");
    const textMatches = bufferString.match(/\(([^)]+)\)/g);

    if (textMatches) {
      return textMatches
        .map((match) =>
          match
            .slice(1, -1) // Remove parentheses
            .replace(/\\\(/g, "(") // Unescape characters
            .replace(/\\\)/g, ")")
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
        )
        .join(" ")
        .substring(0, 5000);
    }

    // Alternative: try to find readable text sequences
    const readableText = bufferString.match(
      /[A-Za-z0-9\s.,!?;:(){}\[\]\-_+=@#$%^&*|<>\/]{10,}/g
    );
    if (readableText) {
      return readableText.join(" ").substring(0, 5000);
    }

    return "PDF content extracted (limited text available)";
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "PDF file uploaded (text extraction failed)";
  }
}

// Helper functions for text extraction
function extractSkillsFromText(text) {
  const commonSkills = [
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
    "typescript",
    "aws",
    "docker",
    "git",
    "rest api",
    "graphql",
    "machine learning",
    "data analysis",
    "project management",
    "communication",
    "teamwork",
    "problem solving",
    "leadership",
    "next.js",
    "vue",
    "angular",
    "php",
    "c++",
    "c#",
    "ruby",
  ];

  const foundSkills = commonSkills.filter((skill) =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  return foundSkills.slice(0, 15); // Limit to 15 skills
}

function extractEducationFromText(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes("university") ||
      lowerLine.includes("college") ||
      lowerLine.includes("bachelor") ||
      lowerLine.includes("master") ||
      lowerLine.includes("phd") ||
      lowerLine.includes("degree")
    ) {
      return line.trim().substring(0, 200);
    }
  }
  return "Education information extracted from CV";
}

function extractExperienceFromText(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes("experience") ||
      lowerLine.includes("worked") ||
      lowerLine.includes("company") ||
      lowerLine.includes("role") ||
      lowerLine.includes("position") ||
      lowerLine.includes("employed")
    ) {
      return line.trim().substring(0, 200);
    }
  }
  return "Experience information extracted from CV";
}

function extractInstitutionFromText(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes("university") ||
      lowerLine.includes("college") ||
      lowerLine.includes("institute")
    ) {
      return line.trim().substring(0, 100);
    }
  }
  return null;
}

function extractDegreeFromText(text) {
  const lines = text.split("\n");
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes("bachelor") ||
      lowerLine.includes("master") ||
      lowerLine.includes("phd") ||
      lowerLine.includes("degree")
    ) {
      return line.trim().substring(0, 100);
    }
  }
  return null;
}
