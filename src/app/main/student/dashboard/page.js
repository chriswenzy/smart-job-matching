"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Form,
} from "react-bootstrap";
import {
  FaSync,
  FaUpload,
  FaBriefcase,
  FaUser,
  FaChartLine,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";
import { useAuth } from "@/components/AuthContext/AuthContext";
import PrivateLayout from "@/components/Layout/PrivateLayout";

export default function StudentDashboard() {
  // const { user } = useAuth();
  const [user, setUser] = useState("");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [jobsResponse, appsResponse, profileResponse, statsResponse] =
        await Promise.all([
          fetch("/api/student/jobs/recommended", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/student/applications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/student/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/student/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const jobsData = await jobsResponse.json();
      const appsData = await appsResponse.json();
      const profileData = await profileResponse.json();
      const statsData = await statsResponse.json();

      setJobs(jobsData);
      setApplications(appsData);
      setProfile(profileData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/applications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        fetchStudentData();
        alert("Application submitted successfully!");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Error applying for job");
    }
  };

  const updateCV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/profile/cv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("CV updated successfully!");
        fetchStudentData();
      }
    } catch (error) {
      alert("Error updating CV");
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container className="py-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading your dashboard...</p>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <PrivateLayout>
      <Container className="py-4">
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <h2>Welcome back, {profile?.fullName || user?.email}!</h2>
            <p className="text-muted">Here are your personalized job matches</p>
          </Col>
          <Col xs="auto">
            <Button variant="outline-primary" onClick={fetchStudentData}>
              <FaSync className="me-2" />
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">
                      Recommended Jobs
                    </h6>
                    <h3 className="fw-bold">{stats.recommendedJobs || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <FaBriefcase size={24} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Applications</h6>
                    <h3 className="fw-bold">{stats.totalApplications || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <FaUser size={24} className="text-success" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Interviews</h6>
                    <h3 className="fw-bold">{stats.interviews || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <FaChartLine size={24} className="text-warning" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Match Rate</h6>
                    <h3 className="fw-bold">{stats.avgMatchRate || 0}%</h3>
                  </div>
                  <div className="align-self-center">
                    <FaChartLine size={24} className="text-info" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Recommended Jobs */}
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recommended Jobs</h5>
                <small>{jobs.length} matches found</small>
              </Card.Header>
              <Card.Body>
                {jobs.length === 0 ? (
                  <Alert variant="info">
                    <h6>No job matches found yet</h6>
                    <p className="mb-2">This could be because:</p>
                    <ul className="mb-3">
                      <li>Your profile is still being processed</li>
                      <li>No jobs match your current skills</li>
                      <li>Try updating your CV with more skills</li>
                    </ul>
                    <Form.Group>
                      <Form.Label>Update your CV:</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={updateCV}
                      />
                    </Form.Group>
                  </Alert>
                ) : (
                  <div className="job-list">
                    {jobs.slice(0, 5).map((job) => (
                      <div
                        key={job.id}
                        className="job-item border-bottom pb-3 mb-3"
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">{job.title}</h6>
                            <p className="text-muted mb-1">
                              {job.employer.companyName}
                            </p>
                          </div>
                          <Badge
                            bg={
                              job.matchScore > 80
                                ? "success"
                                : job.matchScore > 60
                                ? "warning"
                                : "info"
                            }
                          >
                            {job.matchScore}% Match
                          </Badge>
                        </div>

                        <div className="d-flex text-muted small mb-2">
                          <span className="me-3">
                            <FaBriefcase className="me-1" />
                            {job.jobType}
                          </span>
                          <span>
                            <FaChartLine className="me-1" />
                            {job.location}
                          </span>
                        </div>

                        <p className="small text-muted mb-3">
                          {job.description.substring(0, 120)}...
                        </p>

                        <div className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => applyForJob(job.id)}
                            disabled={applications.some(
                              (app) => app.jobId === job.id
                            )}
                          >
                            {applications.some((app) => app.jobId === job.id)
                              ? "Applied"
                              : "Apply Now"}
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}

                    {jobs.length > 5 && (
                      <div className="text-center mt-3">
                        <Button variant="outline-primary" href="/student/jobs">
                          View All Recommended Jobs
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Actions & Profile */}
          <Col lg={4}>
            {/* Profile Summary */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">Profile Summary</h6>
              </Card.Header>
              <Card.Body>
                {profile ? (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span>Profile Completeness</span>
                      <Badge bg="success">85%</Badge>
                    </div>

                    <div className="mb-3">
                      <strong>Skills:</strong>
                      <div className="mt-1">
                        {profile.skills?.slice(0, 5).map((skill, index) => (
                          <Badge
                            key={index}
                            bg="secondary"
                            className="me-1 mb-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {profile.skills?.length > 5 && (
                          <Badge bg="light" text="dark">
                            +{profile.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="d-grid">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={updateCV}
                        id="cv-upload"
                        style={{ display: "none" }}
                      />
                      <Button
                        variant="outline-primary"
                        onClick={() =>
                          document.getElementById("cv-upload").click()
                        }
                      >
                        <FaUpload className="me-2" />
                        Update CV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">Loading profile...</p>
                )}
              </Card.Body>
            </Card>

            {/* Recent Applications */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0">Recent Applications</h6>
              </Card.Header>
              <Card.Body>
                {applications.length === 0 ? (
                  <p className="text-muted text-center">No applications yet</p>
                ) : (
                  <div>
                    {applications.slice(0, 3).map((app) => (
                      <div key={app.id} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong className="small">{app.job.title}</strong>
                            <br />
                            <small className="text-muted">
                              {app.job.employer.companyName}
                            </small>
                          </div>
                          <Badge
                            bg={
                              app.status === "ACCEPTED"
                                ? "success"
                                : app.status === "REJECTED"
                                ? "danger"
                                : "warning"
                            }
                          >
                            {app.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {applications.length > 3 && (
                      <div className="text-center">
                        <Button
                          variant="link"
                          size="sm"
                          href="/student/applications"
                        >
                          View All Applications
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </PrivateLayout>
  );
}
