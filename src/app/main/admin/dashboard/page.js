"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
} from "react-bootstrap";
import {
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaChartLine,
  FaEye,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import AdminLayout from "@/components/Layout/AdminLayout";

export default function AdminDashboard() {
  // const { user } = useAuth();
  const [user, setUser] = useState("");

  const [stats, setStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      const statsResponse = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      const jobsResponse = await fetch("/api/admin/recent-jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsResponse.json();
      setRecentJobs(jobsData);

      const approvalsResponse = await fetch("/api/admin/pending-approvals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const approvalsData = await approvalsResponse.json();
      setPendingApprovals(approvalsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleJobApproval = async (jobId, approve) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/approve-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, approve }),
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating job approval:", error);
    }
  };

  return (
    <AdminLayout>
      <Container fluid className="p-4">
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Total Users</h6>
                    <h3 className="fw-bold">{stats.totalUsers || 0}</h3>
                    <small className="text-success">
                      <FaChartLine className="me-1" />
                      +12% this month
                    </small>
                  </div>
                  <div className="align-self-center">
                    <FaUsers size={24} className="text-primary" />
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
                    <h6 className="card-title text-muted mb-2">Total Jobs</h6>
                    <h3 className="fw-bold">{stats.totalJobs || 0}</h3>
                    <small className="text-success">
                      <FaChartLine className="me-1" />
                      +8% this month
                    </small>
                  </div>
                  <div className="align-self-center">
                    <FaBriefcase size={24} className="text-success" />
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
                      Pending Approvals
                    </h6>
                    <h3 className="fw-bold">{stats.pendingApprovals || 0}</h3>
                    <small className="text-warning">Needs attention</small>
                  </div>
                  <div className="align-self-center">
                    <FaFileAlt size={24} className="text-warning" />
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
                    <small className="text-success">
                      <FaChartLine className="me-1" />
                      +15% this month
                    </small>
                  </div>
                  <div className="align-self-center">
                    <FaFileAlt size={24} className="text-info" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Pending Approvals */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Pending Job Approvals</h5>
              </Card.Header>
              <Card.Body>
                {pendingApprovals.length === 0 ? (
                  <p className="text-muted text-center mb-0">
                    No pending approvals
                  </p>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Posted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingApprovals.map((job) => (
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
                            <td>{job.employer.companyName}</td>
                            <td>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() =>
                                    handleJobApproval(job.id, true)
                                  }
                                >
                                  <FaCheck />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    handleJobApproval(job.id, false)
                                  }
                                >
                                  <FaTimes />
                                </Button>
                                <Button variant="outline-primary" size="sm">
                                  <FaEye />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Jobs */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Recent Jobs</h5>
              </Card.Header>
              <Card.Body>
                {recentJobs.length === 0 ? (
                  <p className="text-muted text-center mb-0">No recent jobs</p>
                ) : (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Company</th>
                          <th>Status</th>
                          <th>Date</th>
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
                                  {job.jobType}
                                </small>
                              </div>
                            </td>
                            <td>{job.employer.companyName}</td>
                            <td>
                              <Badge
                                bg={job.isApproved ? "success" : "warning"}
                              >
                                {job.isApproved ? "Approved" : "Pending"}
                              </Badge>
                            </td>
                            <td>
                              {new Date(job.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
}
