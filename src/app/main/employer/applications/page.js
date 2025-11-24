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
  Form,
  Modal,
} from "react-bootstrap";
import { FaSearch, FaEye, FaCheck, FaTimes, FaDownload } from "react-icons/fa";
import PrivateLayout from "@/components/Layout/PrivateLayout";
import { useAuth } from "@/components/AuthContext/AuthContext";

export default function EmployerApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [appsResponse, jobsResponse] = await Promise.all([
        fetch("/api/employer/applications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/employer/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const appsData = await appsResponse.json();
      const jobsData = await jobsResponse.json();

      setApplications(appsData);
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.student.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (jobFilter !== "all") {
      filtered = filtered.filter((app) => app.jobId === parseInt(jobFilter));
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employer/applications/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, status }),
      });

      if (response.ok) {
        fetchData();
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

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, jobFilter]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PrivateLayout>
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>Candidate Applications</h2>
            <p className="text-muted">Review and manage job applications</p>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Candidates</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, or job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
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
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Job</Form.Label>
                  <Form.Select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                  >
                    <option value="all">All Jobs</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <div className="d-grid w-100">
                  <Button variant="primary">
                    <FaSearch className="me-2" />
                    Filter
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
                    <th>Candidate</th>
                    <th>Job Title</th>
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
                        <div>
                          <strong>{app.student.fullName || "N/A"}</strong>
                          <br />
                          <small className="text-muted">
                            {app.student.email}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{app.job.title}</strong>
                          <br />
                          <small className="text-muted">
                            {app.job.location}
                          </small>
                        </div>
                      </td>
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
                  <h6>Candidate Information</h6>
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
                      <h6 className="mt-3">Education</h6>
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
                        <strong>Field:</strong>{" "}
                        {selectedApplication.student.studentProfile
                          .fieldOfStudy || "N/A"}
                      </p>
                    </>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Application Details</h6>
                  <p>
                    <strong>Job:</strong> {selectedApplication.job.title}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {selectedApplication.job.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {selectedApplication.job.jobType}
                  </p>

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

                  {selectedApplication.student.studentProfile && (
                    <>
                      <h6 className="mt-3">Skills</h6>
                      <div>
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
    </PrivateLayout>
  );
}
