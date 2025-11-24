// pages/api/admin/stats.js

import { verifyToken } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.userType !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get all stats in parallel
    const [
      totalUsers,
      totalJobs,
      pendingApprovals,
      totalApplications,
      studentCount,
      employerCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { isApproved: false } }),
      prisma.application.count(),
      prisma.user.count({ where: { userType: "STUDENT" } }),
      prisma.user.count({ where: { userType: "EMPLOYER" } }),
    ]);

    res.status(200).json({
      totalUsers,
      totalJobs,
      pendingApprovals,
      totalApplications,
      studentCount,
      employerCount,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
