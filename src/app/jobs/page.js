"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Pagination,
} from "react-bootstrap";
import Link from "next/link";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaClock,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, locationFilter, jobTypeFilter]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs/public");
      const jobsData = await response.json();
      setJobs(jobsData);
    } catch (error) {
      console.error("Error fetching jobs:", error);
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
            .includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (jobTypeFilter) {
      filtered = filtered.filter((job) => job.jobType === jobTypeFilter);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

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

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <Layout>
      <Container className="py-5">
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold">Browse Jobs</h1>
            <p className="text-muted">Find your next career opportunity</p>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Search Jobs</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Job title, company, or keywords"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
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
              <Col md={3}>
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
              <Col md={2} className="d-flex align-items-end">
                <Button variant="primary" className="w-100">
                  <FaSearch className="me-2" />
                  Search
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Jobs Grid */}
        <Row>
          {currentJobs.map((job) => (
            <Col key={job.id} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm job-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <Badge bg={getJobTypeVariant(job.jobType)}>
                      {job.jobType.replace("_", " ")}
                    </Badge>
                    {job.isPromoted && <Badge bg="info">Featured</Badge>}
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
                    {job.salaryRange && (
                      <div className="d-flex align-items-center mb-2">
                        <FaMoneyBillWave className="text-muted me-2" />
                        <small>{job.salaryRange}</small>
                      </div>
                    )}
                    <div className="d-flex align-items-center">
                      <FaClock className="text-muted me-2" />
                      <small>
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>

                  <Card.Text className="text-muted small">
                    {job.description.substring(0, 120)}...
                  </Card.Text>

                  <div className="d-grid gap-2">
                    <Button
                      as={Link}
                      href={`/jobs/${job.id}`}
                      variant="outline-primary"
                    >
                      View Details
                    </Button>
                    <Button
                      as={Link}
                      href="/student/register"
                      variant="primary"
                    >
                      Apply Now
                    </Button>
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

      <style jsx>{`
        .job-card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease-in-out;
        }
      `}</style>
    </Layout>
  );
}
