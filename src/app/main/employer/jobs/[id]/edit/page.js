"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Badge,
  Modal,
} from "react-bootstrap";
import { Formik } from "formik";
import { useRouter, useParams } from "next/navigation";
import {
  FaArrowLeft,
  FaSave,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock,
  FaTrash,
  FaEye,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import Link from "next/link";
import PrivateLayout from "@/components/Layout/PrivateLayout";

export default function EditJob() {
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const params = useParams();

  const jobId = params.id;

  // Fetch job data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
        } else {
          setError("Failed to load job data");
        }
      } catch (error) {
        setError("Failed to load job data");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setJob(data.job);

        if (data.requiresReapproval) {
          setTimeout(() => {
            router.push("/main/employer/jobs");
          }, 3000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError("Failed to update job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push("/main/employer/jobs");
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError("Failed to delete job");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const toggleJobStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...job,
          isActive: !job.isActive,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
        setSuccess(
          `Job ${data.job.isActive ? "activated" : "deactivated"} successfully`
        );
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError("Failed to update job status");
    }
  };

  // Job type options
  const jobTypeOptions = [
    { value: "FULL_TIME", label: "Full Time", badge: "primary" },
    { value: "PART_TIME", label: "Part Time", badge: "success" },
    { value: "INTERNSHIP", label: "Internship", badge: "warning" },
    { value: "CONTRACT", label: "Contract", badge: "info" },
    { value: "REMOTE", label: "Remote", badge: "secondary" },
  ];

  if (loading) {
    return (
      <PrivateLayout>
        <Container className="py-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </PrivateLayout>
    );
  }

  if (!job) {
    return (
      <PrivateLayout>
        <Container className="py-4">
          <Alert variant="danger">Job not found</Alert>
          <Link href="/main/employer/jobs" className="btn btn-primary">
            Back to Jobs
          </Link>
        </Container>
      </PrivateLayout>
    );
  }

  // Convert requirements JSON back to text for the form
  const getRequirementsText = () => {
    if (!job.requirements || !job.requirements.requirements) return "";
    return job.requirements.requirements.map((req) => `• ${req}`).join("\n");
  };

  return (
    <PrivateLayout>
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center">
                <Link
                  href="/main/employer/jobs"
                  className="btn btn-outline-secondary me-3"
                >
                  <FaArrowLeft className="me-2" />
                  Back to Jobs
                </Link>
                <div>
                  <h1 className="h3 mb-1">Edit Job</h1>
                  <p className="text-muted mb-0">
                    Update your job posting details
                  </p>
                </div>
              </div>

              {/* Job Status Badges */}
              <div className="d-flex align-items-center gap-2">
                <Badge bg={job.isApproved ? "success" : "warning"}>
                  {job.isApproved ? "Approved" : "Pending Approval"}
                </Badge>
                <Badge bg={job.isActive ? "success" : "secondary"}>
                  {job.isActive ? "Active" : "Inactive"}
                </Badge>
                {job.isPromoted && <Badge bg="info">Promoted</Badge>}
              </div>
            </div>

            <Card className="shadow-sm">
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {/* Job Actions */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
                  <div>
                    <strong>Job Actions:</strong>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant={job.isActive ? "warning" : "success"}
                      size="sm"
                      onClick={toggleJobStatus}
                    >
                      {job.isActive ? (
                        <FaToggleOff className="me-1" />
                      ) : (
                        <FaToggleOn className="me-1" />
                      )}
                      {job.isActive ? "Deactivate" : "Activate"}
                    </Button>

                    <Link
                      href={`/jobs/${jobId}`}
                      className="btn btn-info btn-sm"
                      target="_blank"
                    >
                      <FaEye className="me-1" />
                      Preview
                    </Link>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FaTrash className="me-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                <Formik
                  initialValues={{
                    title: job.title || "",
                    description: job.description || "",
                    requirements: getRequirementsText(),
                    location: job.location || "",
                    jobType: job.jobType || "FULL_TIME",
                    salaryRange: job.salaryRange || "",
                    isActive: job.isActive,
                  }}
                  validate={(values) => {
                    const errors = {};
                    if (!values.title) errors.title = "Job title is required";
                    if (!values.description)
                      errors.description = "Job description is required";
                    if (!values.location)
                      errors.location = "Location is required";
                    if (!values.jobType)
                      errors.jobType = "Job type is required";

                    if (values.title.length < 5) {
                      errors.title = "Title should be at least 5 characters";
                    }

                    if (values.description.length < 50) {
                      errors.description =
                        "Description should be at least 50 characters";
                    }

                    return errors;
                  }}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                  }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={8}>
                          <Form.Group className="mb-3">
                            <Form.Label>Job Title *</Form.Label>
                            <Form.Control
                              type="text"
                              name="title"
                              value={values.title}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.title && errors.title}
                              placeholder="e.g., Senior Software Engineer"
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.title}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Job Type *</Form.Label>
                            <Form.Select
                              name="jobType"
                              value={values.jobType}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.jobType && errors.jobType}
                              required
                            >
                              {jobTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                              {errors.jobType}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Location *</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FaMapMarkerAlt />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="location"
                                value={values.location}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                isInvalid={touched.location && errors.location}
                                placeholder="e.g., Lagos, Nigeria or Remote"
                                required
                              />
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                              {errors.location}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>

                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Salary Range</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FaMoneyBillWave />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="salaryRange"
                                value={values.salaryRange}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="e.g., ₦500,000 - ₦800,000 per month"
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Job Description *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          name="description"
                          value={values.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.description && errors.description}
                          placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.description}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {values.description.length}/50 characters minimum
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Requirements & Qualifications</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="requirements"
                          value={values.requirements}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="List the required skills, qualifications, and experience..."
                        />
                        <Form.Text className="text-muted">
                          Use bullet points (•) or separate lines for better
                          formatting.
                        </Form.Text>
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center border-top pt-4">
                        <div>
                          <small className="text-muted">
                            * Required fields. Significant changes may require
                            re-approval.
                          </small>
                        </div>
                        <div>
                          <Button
                            variant="outline-secondary"
                            className="me-2"
                            onClick={() => router.push("/main/employer/jobs")}
                            type="button"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />
                                Updating Job...
                              </>
                            ) : (
                              <>
                                <FaSave className="me-2" />
                                Update Job
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>

            {/* Job Statistics */}
            <Card className="mt-4">
              <Card.Header>
                <h6 className="mb-0">Job Statistics</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3} className="text-center">
                    <h4 className="text-primary">
                      {job._count?.applications || 0}
                    </h4>
                    <p className="text-muted mb-0">Applications</p>
                  </Col>
                  <Col md={3} className="text-center">
                    <h4 className="text-success">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </h4>
                    <p className="text-muted mb-0">Created</p>
                  </Col>
                  <Col md={3} className="text-center">
                    <h4 className="text-info">
                      {new Date(job.updatedAt).toLocaleDateString()}
                    </h4>
                    <p className="text-muted mb-0">Last Updated</p>
                  </Col>
                  <Col md={3} className="text-center">
                    <h4
                      className={
                        job.isActive ? "text-success" : "text-secondary"
                      }
                    >
                      {job.isActive ? "Live" : "Paused"}
                    </h4>
                    <p className="text-muted mb-0">Status</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this job? This action cannot be
            undone.
            {job._count?.applications > 0 && (
              <Alert variant="warning" className="mt-2">
                <strong>Warning:</strong> This job has {job._count.applications}{" "}
                application(s). Deleting it will remove all associated
                applications.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Job
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </PrivateLayout>
  );
}
