"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Pagination,
} from "react-bootstrap";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFilter,
} from "react-icons/fa";
import PrivateLayout from "@/components/Layout/PrivateLayout";
import { useAuth } from "@/components/AuthContext/AuthContext";

export default function StudentJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [minMatchScore, setMinMatchScore] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [jobsResponse, appsResponse] = await Promise.all([
        fetch("/api/student/jobs/recommended", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/student/applications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const jobsData = await jobsResponse.json();
      const appsData = await appsResponse.json();

      setJobs(jobsData);
      setApplications(appsData);
    } catch (error) {
      console.error("Error fetching student data:", error);
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

  // Filter jobs
  const filteredJobs = jobs?.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employer.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      !locationFilter ||
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesJobType = !jobTypeFilter || job.jobType === jobTypeFilter;
    const matchesMinScore = job.matchScore >= minMatchScore;

    return (
      matchesSearch && matchesLocation && matchesJobType && matchesMinScore
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getJobTypeVariant = (jobType) => {
    const variants = {
      FULL_TIME: "success",
      PART_TIME: "warning",
      CONTRACT: "info",
      REMOTE: "primary",
      INTERNSHIP: "secondary",
    };
    return variants[jobType] || "secondary";
  };

  return (
    <PrivateLayout>
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>Recommended Jobs</h2>
            <p className="text-muted">
              Jobs matched to your profile and skills
            </p>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Jobs</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Job title or company"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City or state"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="REMOTE">Remote</option>
                    <option value="INTERNSHIP">Internship</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Min Match Score</Form.Label>
                  <Form.Select
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                  >
                    <option value={0}>Any Score</option>
                    <option value={60}>60%+</option>
                    <option value={70}>70%+</option>
                    <option value={80}>80%+</option>
                    <option value={90}>90%+</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <div className="d-grid w-100">
                  <Button variant="primary">
                    <FaFilter className="me-2" />
                    Apply Filters
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Jobs Grid */}
        <Row>
          {currentJobs.map((job) => (
            <Col key={job.id} lg={6} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg={getJobTypeVariant(job.jobType)}>
                      {job.jobType.replace("_", " ")}
                    </Badge>
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

                  <Card.Title className="h5">{job.title}</Card.Title>
                  <Card.Subtitle className="text-muted mb-3">
                    {job.employer.companyName}
                  </Card.Subtitle>

                  <div className="job-meta mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-muted me-2" />
                      <small>{job.location}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="text-muted me-2" />
                      <small>{job.jobType.replace("_", " ")}</small>
                    </div>
                  </div>

                  <Card.Text className="text-muted small mb-4">
                    {job.description.substring(0, 150)}...
                  </Card.Text>

                  <div className="d-grid gap-2">
                    <Button
                      variant="primary"
                      onClick={() => applyForJob(job.id)}
                      disabled={applications.some(
                        (app) => app.jobId === job.id
                      )}
                    >
                      {applications.some((app) => app.jobId === job.id)
                        ? "Applied"
                        : "Apply Now"}
                    </Button>
                    <Button variant="outline-secondary">View Details</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {currentJobs.length === 0 && (
          <div className="text-center py-5">
            <h5 className="text-muted">No jobs found</h5>
            <p className="text-muted">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
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
        )}
      </Container>
    </PrivateLayout>
  );
}
