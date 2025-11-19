// app/api/student/profile/cv/route.js
import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";
import { parseCV } from "@/utils/cvParser";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "STUDENT") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    // Handle form data with file upload
    const formData = await req.formData();
    const cvFile = formData.get("cvFile");
    const cvText = formData.get("cvText");

    let parsedData;

    if (cvFile && cvFile instanceof File) {
      // Handle file upload
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      const fileType = cvFile.type;
      parsedData = await parseCV(buffer, fileType);
    } else if (cvText) {
      // Handle text input
      parsedData = await parseCV(Buffer.from(cvText), "text/plain");
    } else {
      return Response.json(
        { message: "Either CV file or CV text is required" },
        { status: 400 }
      );
    }

    // Update student profile with parsed CV data
    const updatedProfile = await prisma.studentProfile.upsert({
      where: { userId: decoded.userId },
      update: {
        cvText: parsedData.text,
        parsedSkills: parsedData.skills,
        parsedEducation: parsedData.education?.join(", ") || "",
        parsedExperience: parsedData.experience,
        skills: parsedData.skills,
        institution: parsedData.institution,
        degree: parsedData.degree,
        fieldOfStudy: parsedData.fieldOfStudy,
        experience: parsedData.experienceText,
        cvUploadedAt: new Date(),
      },
      create: {
        userId: decoded.userId,
        cvText: parsedData.text,
        parsedSkills: parsedData.skills,
        parsedEducation: parsedData.education?.join(", ") || "",
        parsedExperience: parsedData.experience,
        skills: parsedData.skills,
        institution: parsedData.institution,
        degree: parsedData.degree,
        fieldOfStudy: parsedData.fieldOfStudy,
        experience: parsedData.experienceText,
        cvUploadedAt: new Date(),
      },
    });

    return Response.json({
      message: "CV uploaded and processed successfully",
      skills: parsedData.skills,
      education: parsedData.education,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error uploading CV:", error);

    if (error.message.includes("Failed to parse CV")) {
      return Response.json(
        { message: "Failed to process CV. Please ensure it's a valid format." },
        { status: 400 }
      );
    }

    return Response.json({ message: "Failed to process CV" }, { status: 500 });
  }
}

// Optional: GET method to retrieve CV data
export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "STUDENT") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: decoded.userId },
      select: {
        cvText: true,
        skills: true,
        institution: true,
        degree: true,
        fieldOfStudy: true,
        experience: true,
        cvUploadedAt: true,
      },
    });

    if (!profile || !profile.cvText) {
      return Response.json({ message: "No CV found" }, { status: 404 });
    }

    return Response.json({
      cvData: profile,
    });
  } catch (error) {
    console.error("Error fetching CV:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

// Optional: DELETE method to remove CV
export async function DELETE(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return Response.json({ message: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "STUDENT") {
      return Response.json({ message: "Access denied" }, { status: 403 });
    }

    await prisma.studentProfile.update({
      where: { userId: decoded.userId },
      data: {
        cvText: null,
        parsedSkills: [],
        parsedEducation: null,
        parsedExperience: null,
        cvUploadedAt: null,
      },
    });

    return Response.json({
      message: "CV removed successfully",
    });
  } catch (error) {
    console.error("Error deleting CV:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
