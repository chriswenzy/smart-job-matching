"use client";

import AdminLayout from "@/components/Layout/AdminLayout";
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
  InputGroup,
  Modal,
} from "react-bootstrap";
import { FaSearch, FaEye, FaCheck, FaTimes, FaDownload } from "react-icons/fa";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
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
      const response = await fetch("/api/admin/applications", {
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
          app.student.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
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

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/update-application-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, status }),
      });

      if (response.ok) {
        fetchApplications(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
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

  if (loading) {
    return (
      <AdminLayout>
        <Container fluid className="p-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h2>Applications Management</h2>
            <p className="text-muted">View and manage job applications</p>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search applications by job, student, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
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
              <Col md={3}>
                <div className="d-grid">
                  <Button variant="primary">
                    <FaDownload className="me-2" />
                    Export Applications
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
                    <th>Student</th>
                    <th>Company</th>
                    <th>Match Score</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <strong>{app.job.title}</strong>
                        <br />
                        <small className="text-muted">{app.job.jobType}</small>
                      </td>
                      <td>
                        <div>
                          <strong>{app.student.fullName || "N/A"}</strong>
                          <br />
                          <small className="text-muted">
                            {app.student.email}
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
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewApplicationDetails(app)}
                          >
                            <FaEye />
                          </Button>

                          {app.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  updateApplicationStatus(app.id, "ACCEPTED")
                                }
                              >
                                <FaCheck />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  updateApplicationStatus(app.id, "REJECTED")
                                }
                              >
                                <FaTimes />
                              </Button>
                            </>
                          )}

                          {app.status === "REVIEWED" && (
                            <>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  updateApplicationStatus(app.id, "ACCEPTED")
                                }
                              >
                                <FaCheck />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  updateApplicationStatus(app.id, "REJECTED")
                                }
                              >
                                <FaTimes />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">No applications found</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Application Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Application Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedApplication && (
              <Row>
                <Col md={6}>
                  <h6>Job Information</h6>
                  <p>
                    <strong>Title:</strong> {selectedApplication.job.title}
                  </p>
                  <p>
                    <strong>Company:</strong>{" "}
                    {selectedApplication.job.employer.companyName}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedApplication.job.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedApplication.job.jobType}
                  </p>

                  <h6 className="mt-3">Application Details</h6>
                  <p>
                    <strong>Match Score:</strong>
                    <Badge
                      bg={
                        selectedApplication.matchScore > 80
                          ? "success"
                          : selectedApplication.matchScore > 60
                          ? "warning"
                          : "secondary"
                      }
                      className="ms-2"
                    >
                      {selectedApplication.matchScore}%
                    </Badge>
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <Badge
                      bg={getStatusVariant(selectedApplication.status)}
                      className="ms-2"
                    >
                      {selectedApplication.status}
                    </Badge>
                  </p>
                  <p>
                    <strong>Applied:</strong>{" "}
                    {new Date(selectedApplication.appliedAt).toLocaleString()}
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Student Information</h6>
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedApplication.student.fullName || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedApplication.student.email}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedApplication.student.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedApplication.student.location || "N/A"}
                  </p>

                  {selectedApplication.student.studentProfile && (
                    <>
                      <h6 className="mt-3">Student Profile</h6>
                      <p>
                        <strong>Institution:</strong>{" "}
                        {selectedApplication.student.studentProfile
                          .institution || "N/A"}
                      </p>
                      <p>
                        <strong>Degree:</strong>{" "}
                        {selectedApplication.student.studentProfile.degree ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>Skills:</strong>
                        <div className="mt-1">
                          {selectedApplication.student.studentProfile.skills?.map(
                            (skill, index) => (
                              <Badge
                                key={index}
                                bg="secondary"
                                className="me-1 mb-1"
                              >
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </p>
                    </>
                  )}
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={() =>
                  updateApplicationStatus(selectedApplication?.id, "ACCEPTED")
                }
              >
                <FaCheck className="me-2" />
                Accept
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  updateApplicationStatus(selectedApplication?.id, "REJECTED")
                }
              >
                <FaTimes className="me-2" />
                Reject
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
}
