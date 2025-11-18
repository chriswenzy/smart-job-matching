// pages/student/applications.js
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
} from "react-bootstrap";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { FaSearch, FaEye, FaFileDownload } from "react-icons/fa";

export default function StudentApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appsData = await response.json();
      setApplications(appsData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job.employer.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusVariant = (status) => {
    const variants = {
      PENDING: "warning",
      REVIEWED: "info",
      ACCEPTED: "success",
      REJECTED: "danger",
    };
    return variants[status] || "secondary";
  };

  const exportApplications = () => {
    // Simple CSV export implementation
    const headers = [
      "Job Title",
      "Company",
      "Status",
      "Applied Date",
      "Match Score",
    ];
    const csvData = filteredApplications.map((app) => [
      app.job.title,
      app.job.employer.companyName,
      app.status,
      new Date(app.appliedAt).toLocaleDateString(),
      app.matchScore + "%",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-applications.csv";
    link.click();
    window.URL.revokeObjectURL(url);
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
    <Layout>
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>My Applications</h2>
            <p className="text-muted">Track your job applications</p>
          </Col>
          <Col xs="auto">
            <Button variant="outline-primary" onClick={exportApplications}>
              <FaFileDownload className="me-2" />
              Export
            </Button>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Search by job title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <div className="d-grid">
                  <Button variant="primary">
                    <FaSearch className="me-2" />
                    Search
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Applications Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">
              Applications ({filteredApplications.length})
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div>
                          <strong>{app.job.title}</strong>
                          <br />
                          <small className="text-muted">
                            {app.job.jobType}
                          </small>
                        </div>
                      </td>
                      <td>{app.job.employer.companyName}</td>
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
                        <Badge bg={getStatusVariant(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          <FaEye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">No applications found</p>
                <Button variant="primary" href="/student/jobs">
                  Browse Jobs
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Application Statistics */}
        {applications.length > 0 && (
          <Row className="mt-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h4 className="text-primary">{applications.length}</h4>
                  <p className="text-muted mb-0">Total Applications</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h4 className="text-warning">
                    {
                      applications.filter((app) => app.status === "PENDING")
                        .length
                    }
                  </h4>
                  <p className="text-muted mb-0">Pending</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h4 className="text-success">
                    {
                      applications.filter((app) => app.status === "ACCEPTED")
                        .length
                    }
                  </h4>
                  <p className="text-muted mb-0">Accepted</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h4 className="text-info">
                    {
                      applications.filter((app) => app.status === "REVIEWED")
                        .length
                    }
                  </h4>
                  <p className="text-muted mb-0">Under Review</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </Layout>
  );
}
