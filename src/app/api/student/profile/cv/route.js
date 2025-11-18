// pages/api/student/profile/cv.js
import { verifyToken } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { parseCV } from "../../../../utils/cvParser";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "STUDENT") {
      return res.status(403).json({ message: "Access denied" });
    }

    // For file uploads, you would typically use a library like multer
    // This is a simplified version
    const formData = await new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        resolve(body);
      });
      req.on("error", reject);
    });

    // In a real implementation, you would handle file upload properly
    // For now, we'll assume the CV text is sent in the request
    const { cvText } = JSON.parse(formData);

    if (!cvText) {
      return res.status(400).json({ message: "CV text is required" });
    }

    // Parse CV and extract information
    const cvData = await parseCV(Buffer.from(cvText), "text/plain");

    // Update student profile with parsed CV data
    await prisma.studentProfile.upsert({
      where: { userId: decoded.userId },
      update: {
        cvText: cvData.text,
        parsedSkills: cvData.skills,
        parsedEducation: cvData.education.join(", "),
        parsedExperience: cvData.experience,
        skills: cvData.skills,
        institution: cvData.institution,
        degree: cvData.degree,
        fieldOfStudy: cvData.fieldOfStudy,
        experience: cvData.experienceText,
      },
      create: {
        userId: decoded.userId,
        cvText: cvData.text,
        parsedSkills: cvData.skills,
        parsedEducation: cvData.education.join(", "),
        parsedExperience: cvData.experience,
        skills: cvData.skills,
        institution: cvData.institution,
        degree: cvData.degree,
        fieldOfStudy: cvData.fieldOfStudy,
        experience: cvData.experienceText,
      },
    });

    res.status(200).json({
      message: "CV uploaded and processed successfully",
      skills: cvData.skills,
    });
  } catch (error) {
    console.error("Error uploading CV:", error);
    res.status(500).json({ message: "Failed to process CV" });
  }
}
