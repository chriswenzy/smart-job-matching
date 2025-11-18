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
  Pagination,
} from "react-bootstrap";
import Link from "next/link";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaEye, FaEdit, FaTrash, FaSearch } from "react-icons/fa";

export default function EmployerJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employer/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((job) => job.isActive && job.isApproved);
      } else if (statusFilter === "pending") {
        filtered = filtered.filter((job) => !job.isApproved);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((job) => !job.isActive);
      }
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const deleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/employer/jobs/toggle-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>Manage Jobs</h2>
            <p className="text-muted">View and manage your job postings</p>
          </Col>
          <Col xs="auto">
            <Button as={Link} href="/employer/jobs/new" variant="primary">
              <FaPlus className="me-2" />
              Post New Job
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
                    placeholder="Search jobs by title..."
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
                  <option value="active">Active</option>
                  <option value="pending">Pending Approval</option>
                  <option value="inactive">Inactive</option>
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

        {/* Jobs Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Your Jobs ({filteredJobs.length})</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Applications</th>
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
                          <br />
                          <small className="text-muted">{job.jobType}</small>
                        </div>
                      </td>
                      <td>{job.location}</td>
                      <td>
                        <Badge bg="primary">
                          {job._count?.applications || 0}
                        </Badge>
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
                          <Button variant="outline-primary" size="sm">
                            <FaEye />
                          </Button>
                          <Button variant="outline-warning" size="sm">
                            <FaEdit />
                          </Button>
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

            {currentJobs.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">No jobs found</p>
                <Button as={Link} href="/employer/jobs/new" variant="primary">
                  Post Your First Job
                </Button>
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
      </Container>
    </Layout>
  );
}
