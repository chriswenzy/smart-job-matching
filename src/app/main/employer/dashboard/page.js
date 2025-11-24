"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Table,
} from "react-bootstrap";
import Link from "next/link";
import {
  FaPlus,
  FaBriefcase,
  FaUsers,
  FaChartLine,
  FaEye,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";
import PrivateLayout from "@/components/Layout/PrivateLayout";

export default function EmployerDashboard() {
  // const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const fetchEmployerData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [statsResponse, jobsResponse, appsResponse] = await Promise.all([
        fetch("/api/employer/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/employer/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/employer/applications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData = await statsResponse.json();
      const jobsData = await jobsResponse.json();
      const appsData = await appsResponse.json();

      setStats(statsData);
      setRecentJobs(jobsData.slice(0, 5));
      setRecentApplications(appsData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching employer data:", error);
    } finally {
      setLoading(false);
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
            <h2>Employer Dashboard</h2>
            <p className="text-muted">
              Manage your job postings and candidates
            </p>
          </Col>
          <Col xs="auto">
            <Button as={Link} href="/employer/jobs/new" variant="primary">
              <FaPlus className="me-2" />
              Post New Job
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
                    <h6 className="card-title text-muted mb-2">Active Jobs</h6>
                    <h3 className="fw-bold">{stats.activeJobs || 0}</h3>
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
                    <h6 className="card-title text-muted mb-2">
                      Total Applications
                    </h6>
                    <h3 className="fw-bold">{stats.totalApplications || 0}</h3>
                  </div>
                  <div className="align-self-center">
                    <FaUsers size={24} className="text-success" />
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
                    <h6 className="card-title text-muted mb-2">
                      New Candidates
                    </h6>
                    <h3 className="fw-bold">{stats.newApplications || 0}</h3>
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
                    <h6 className="card-title text-muted mb-2">
                      Avg Match Score
                    </h6>
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
          {/* Recent Jobs */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Jobs</h5>
                <Button
                  as={Link}
                  href="/employer/jobs"
                  variant="link"
                  size="sm"
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                {recentJobs.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No jobs posted yet</p>
                    <Button
                      as={Link}
                      href="/employer/jobs/new"
                      variant="primary"
                    >
                      Post Your First Job
                    </Button>
                  </div>
                ) : (
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Job Title</th>
                        <th>Applications</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <div>
                              <strong>{job.title}</strong>
                              <br />
                              <small className="text-muted">
                                {job.location}
                              </small>
                            </div>
                          </td>
                          <td>{job._count?.applications || 0}</td>
                          <td>
                            <Badge bg={job.isApproved ? "success" : "warning"}>
                              {job.isApproved ? "Active" : "Pending"}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Applications */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Applications</h5>
                <Button
                  as={Link}
                  href="/employer/applications"
                  variant="link"
                  size="sm"
                >
                  View All
                </Button>
              </Card.Header>
              <Card.Body className="p-0">
                {recentApplications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No applications yet</p>
                  </div>
                ) : (
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Candidate</th>
                        <th>Job</th>
                        <th>Match</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <div>
                              <strong>{app.student.fullName || "N/A"}</strong>
                              <br />
                              <small className="text-muted">
                                {app.student.email}
                              </small>
                            </div>
                          </td>
                          <td>{app.job.title}</td>
                          <td>
                            <Badge
                              bg={
                                app.matchScore > 80
                                  ? "success"
                                  : app.matchScore > 60
                                  ? "warning"
                                  : "secondary"
                              }
                            >
                              {app.matchScore}%
                            </Badge>
                          </td>
                          <td>
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center mb-3">
                    <Button
                      as={Link}
                      href="/employer/jobs/new"
                      variant="outline-primary"
                      className="w-100 h-100 py-3"
                    >
                      <FaPlus size={24} className="mb-2" />
                      <br />
                      Post New Job
                    </Button>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <Button
                      as={Link}
                      href="/employer/jobs"
                      variant="outline-success"
                      className="w-100 h-100 py-3"
                    >
                      <FaBriefcase size={24} className="mb-2" />
                      <br />
                      Manage Jobs
                    </Button>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <Button
                      as={Link}
                      href="/employer/applications"
                      variant="outline-warning"
                      className="w-100 h-100 py-3"
                    >
                      <FaUsers size={24} className="mb-2" />
                      <br />
                      View Applications
                    </Button>
                  </Col>
                  <Col md={3} className="text-center mb-3">
                    <Button
                      as={Link}
                      href="/employer/profile"
                      variant="outline-info"
                      className="w-100 h-100 py-3"
                    >
                      <FaChartLine size={24} className="mb-2" />
                      <br />
                      Company Profile
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </PrivateLayout>
  );
}
