"use client";
import AdminLayout from "@/components/Layout/AdminLayout";
import PrivateLayout from "@/components/Layout/PrivateLayout";
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
  Pagination,
} from "react-bootstrap";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.employer.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        filtered = filtered.filter((job) => job.isApproved);
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((job) => !job.isApproved);
      } else if (statusFilter === "active") {
        filtered = filtered.filter((job) => job.isActive);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((job) => !job.isActive);
      }
    }

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
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
        fetchJobs(); // Refresh data
      }
    } catch (error) {
      console.error("Error updating job approval:", error);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/toggle-job-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchJobs(); // Refresh data
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  const deleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchJobs(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const viewJobDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <PrivateLayout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h2>Jobs Management</h2>
            <p className="text-muted">Manage and approve job postings</p>
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
                    placeholder="Search jobs by title or company..."
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
                  <option value="all">All Jobs</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <div className="d-grid">
                  <Button variant="primary">Export Jobs</Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Jobs Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Jobs ({filteredJobs.length})</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div>
                          <strong>{job.title}</strong>
                          {job.isPromoted && (
                            <Badge bg="info" className="ms-2">
                              Promoted
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>{job.employer.companyName}</td>
                      <td>{job.location}</td>
                      <td>
                        <Badge bg="secondary">{job.jobType}</Badge>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <Badge bg={job.isApproved ? "success" : "warning"}>
                            {job.isApproved ? "Approved" : "Pending"}
                          </Badge>
                          <Badge bg={job.isActive ? "success" : "secondary"}>
                            {job.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewJobDetails(job)}
                          >
                            <FaEye />
                          </Button>

                          {!job.isApproved && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleJobApproval(job.id, true)}
                            >
                              <FaCheck />
                            </Button>
                          )}

                          {job.isApproved && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleJobApproval(job.id, false)}
                            >
                              <FaTimes />
                            </Button>
                          )}

                          <Button
                            variant={
                              job.isActive
                                ? "outline-danger"
                                : "outline-success"
                            }
                            size="sm"
                            onClick={() =>
                              toggleJobStatus(job.id, job.isActive)
                            }
                          >
                            {job.isActive ? "Deactivate" : "Activate"}
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteJob(job.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">No jobs found</p>
              </div>
            )}
          </Card.Body>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card.Footer className="bg-white">
              <div className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => paginate(currentPage - 1)}
                  />

                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => paginate(currentPage + 1)}
                  />
                </Pagination>
              </div>
            </Card.Footer>
          )}
        </Card>

        {/* Job Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Job Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedJob && (
              <Row>
                <Col md={6}>
                  <h6>Job Information</h6>
                  <p>
                    <strong>Title:</strong> {selectedJob.title}
                  </p>
                  <p>
                    <strong>Company:</strong> {selectedJob.employer.companyName}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedJob.location}
                  </p>
                  <p>
                    <strong>Job Type:</strong> {selectedJob.jobType}
                  </p>
                  <p>
                    <strong>Salary Range:</strong>{" "}
                    {selectedJob.salaryRange || "Not specified"}
                  </p>

                  <h6 className="mt-3">Status</h6>
                  <p>
                    <strong>Approval:</strong>
                    <Badge
                      bg={selectedJob.isApproved ? "success" : "warning"}
                      className="ms-2"
                    >
                      {selectedJob.isApproved ? "Approved" : "Pending"}
                    </Badge>
                  </p>
                  <p>
                    <strong>Active:</strong>
                    <Badge
                      bg={selectedJob.isActive ? "success" : "secondary"}
                      className="ms-2"
                    >
                      {selectedJob.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                  {selectedJob.isPromoted && (
                    <p>
                      <strong>Promoted:</strong>
                      <Badge bg="info" className="ms-2">
                        Yes
                      </Badge>
                    </p>
                  )}
                </Col>
                <Col md={6}>
                  <h6>Requirements</h6>
                  {selectedJob.requirements?.skills && (
                    <div className="mb-3">
                      <strong>Skills:</strong>
                      <div className="mt-1">
                        {selectedJob.requirements.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            bg="secondary"
                            className="me-1 mb-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <h6>Description</h6>
                  <p className="text-muted">{selectedJob.description}</p>

                  <h6>Timeline</h6>
                  <p>
                    <strong>Posted:</strong>{" "}
                    {new Date(selectedJob.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(selectedJob.updatedAt).toLocaleString()}
                  </p>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </PrivateLayout>
  );
}
