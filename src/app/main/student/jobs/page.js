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
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaFilter,
  FaMoneyBillWave,
  FaBuilding,
} from "react-icons/fa";
import PrivateLayout from "@/components/Layout/PrivateLayout";
import { useAuth } from "@/components/AuthContext/AuthContext";

export default function StudentJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemsPerPage] = useState(6);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (locationFilter) queryParams.append("location", locationFilter);
      if (jobTypeFilter) queryParams.append("jobType", jobTypeFilter);
      if (industryFilter) queryParams.append("industry", industryFilter);
      queryParams.append("page", currentPage.toString());
      queryParams.append("limit", itemsPerPage.toString());

      const [jobsResponse, appsResponse] = await Promise.all([
        fetch(`/api/student/jobs?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/student/applications", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!jobsResponse.ok) {
        throw new Error("Failed to fetch jobs");
      }

      if (!appsResponse.ok) {
        throw new Error("Failed to fetch applications");
      }

      const jobsData = await jobsResponse.json();
      const appsData = await appsResponse.json();

      // Set jobs from the jobs property of the response
      setJobs(jobsData.jobs || []);
      setFilters(jobsData.filters || {});
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load jobs. Please try again.");
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
        fetchStudentData(); // Refresh data to update application status
        alert("Application submitted successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error applying for job");
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Error applying for job");
    }
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchStudentData();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setJobTypeFilter("");
    setIndustryFilter("");
    setCurrentPage(1);
  };

  // Filter jobs locally (if you want additional client-side filtering)
  const filteredJobs = Array.isArray(jobs)
    ? jobs.filter((job) => {
        const matchesSearch =
          !searchTerm ||
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.employer?.companyName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesLocation =
          !locationFilter ||
          job.location?.toLowerCase().includes(locationFilter.toLowerCase());

        const matchesJobType = !jobTypeFilter || job.jobType === jobTypeFilter;

        const matchesIndustry =
          !industryFilter ||
          job.employer?.industry
            ?.toLowerCase()
            .includes(industryFilter.toLowerCase());

        return (
          matchesSearch && matchesLocation && matchesJobType && matchesIndustry
        );
      })
    : [];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = filteredJobs.slice(
    indexOfFirstItem,
    indexOfFirstItem + itemsPerPage
  );
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

  const getApplicationStatus = (jobId) => {
    const application = applications.find((app) => app.jobId === jobId);
    return application ? application.status : null;
  };

  const hasApplied = (jobId) => {
    return applications.some((app) => app.jobId === jobId);
  };

  useEffect(() => {
    fetchStudentData();
  }, [currentPage]); // Refetch when page changes

  if (loading) {
    return (
      <PrivateLayout>
        <Container className="py-4">
          <div className="text-center">
            <Spinner animation="border" role="status" className="me-2" />
            <span>Loading jobs...</span>
          </div>
        </Container>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>Browse Jobs</h2>
            <p className="text-muted">
              Find opportunities that match your skills and interests
            </p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Jobs</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Job title, company, or keywords"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleFilterChange()
                    }
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleFilterChange()
                    }
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
                    {filters.jobTypes?.map((type) => (
                      <option key={type} value={type}>
                        {type.replace("_", " ")}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Industry</Form.Label>
                  <Form.Select
                    value={industryFilter}
                    onChange={(e) => setIndustryFilter(e.target.value)}
                  >
                    <option value="">All Industries</option>
                    {filters.industries?.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end gap-2">
                <div className="d-flex gap-2 w-100">
                  <Button
                    variant="primary"
                    onClick={handleFilterChange}
                    className="flex-grow-1"
                  >
                    <FaFilter className="me-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline-secondary" onClick={resetFilters}>
                    Reset
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
              <Card className="h-100 shadow-sm hover-shadow">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg={getJobTypeVariant(job.jobType)}>
                      {job.jobType.replace("_", " ")}
                    </Badge>
                    {job.hasApplied && (
                      <Badge
                        bg={
                          getApplicationStatus(job.id) === "APPROVED"
                            ? "success"
                            : "warning"
                        }
                      >
                        {getApplicationStatus(job.id) || "Applied"}
                      </Badge>
                    )}
                  </div>

                  <Card.Title className="h5 mb-2">{job.title}</Card.Title>
                  <Card.Subtitle className="text-muted mb-3 d-flex align-items-center">
                    <FaBuilding className="me-2" />
                    {job.employer?.companyName || "Company"}
                  </Card.Subtitle>

                  <div className="job-meta mb-3 flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <FaMapMarkerAlt className="text-muted me-2" />
                      <small>{job.location}</small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaBriefcase className="text-muted me-2" />
                      <small>{job.jobType.replace("_", " ")}</small>
                    </div>
                    {job.salaryRange && (
                      <div className="d-flex align-items-center mb-2">
                        <FaMoneyBillWave className="text-muted me-2" />
                        <small>{job.salaryRange}</small>
                      </div>
                    )}
                    {job.employer?.industry && (
                      <div className="mb-2">
                        <Badge
                          bg="outline-secondary"
                          className="text-dark border"
                        >
                          {job.employer.industry}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Card.Text className="text-muted small mb-3">
                    {job.description?.substring(0, 120)}...
                  </Card.Text>

                  <div className="d-grid gap-2 mt-auto">
                    <Button
                      variant={
                        hasApplied(job.id) ? "outline-success" : "primary"
                      }
                      onClick={() => applyForJob(job.id)}
                      disabled={hasApplied(job.id)}
                    >
                      {hasApplied(job.id) ? "Already Applied" : "Apply Now"}
                    </Button>
                    {/* <Button
                      variant="outline-secondary"
                      as="a"
                      href={`/jobs/${job.id}`}
                      target="_blank"
                    >
                      View Details
                    </Button> */}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {currentJobs.length === 0 && !loading && (
          <div className="text-center py-5">
            <h5 className="text-muted">No jobs found</h5>
            <p className="text-muted">
              Try adjusting your search criteria or check back later
            </p>
            <Button variant="primary" onClick={resetFilters}>
              Reset Filters
            </Button>
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

      <style jsx>{`
        .hover-shadow:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease-in-out;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </PrivateLayout>
  );
}
