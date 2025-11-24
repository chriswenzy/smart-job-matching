"use client";
import { useState } from "react";
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
} from "react-bootstrap";
import { Formik } from "formik";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaPlus,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import Link from "next/link";
import PrivateLayout from "@/components/Layout/PrivateLayout";

export default function CreateJob() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");
      const response = await fetch("/api/employer/jobs/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setTimeout(() => {
          router.push("/main/employer/jobs");
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError("Failed to create job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Job type options matching your Prisma schema
  const jobTypeOptions = [
    { value: "FULL_TIME", label: "Full Time", badge: "primary" },
    { value: "PART_TIME", label: "Part Time", badge: "success" },
    { value: "INTERNSHIP", label: "Internship", badge: "warning" },
    { value: "CONTRACT", label: "Contract", badge: "info" },
    { value: "REMOTE", label: "Remote", badge: "secondary" },
  ];

  return (
    <PrivateLayout>
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col lg={10}>
            {/* Header */}
            <div className="d-flex align-items-center mb-4">
              <Link
                href="/main/employer/jobs"
                className="btn btn-outline-secondary me-3"
              >
                <FaArrowLeft className="me-2" />
                Back to Jobs
              </Link>
              <div>
                <h1 className="h3 mb-1">Post a New Job</h1>
                <p className="text-muted mb-0">
                  Fill in the details below to create a new job posting
                </p>
              </div>
            </div>

            <Card className="shadow-sm">
              <Card.Body className="p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Formik
                  initialValues={{
                    title: "",
                    description: "",
                    requirements: "",
                    location: "",
                    jobType: "FULL_TIME",
                    salaryRange: "",
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

                    if (values.location.length < 3) {
                      errors.location = "Please provide a valid location";
                    }

                    return errors;
                  }}
                  onSubmit={handleSubmit}
                >
                  {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    setFieldValue,
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
                              placeholder="e.g., Senior Software Engineer, Marketing Manager"
                              required
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.title}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              Be specific about the role and level
                            </Form.Text>
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
                            <Form.Text className="text-muted">
                              Specify currency and time period (monthly,
                              annually)
                            </Form.Text>
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
                          placeholder="Describe the role, responsibilities, company culture, and what you're looking for in a candidate..."
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
                        <Form.Label>
                          Requirements & Qualifications
                          <small className="text-muted ms-1">
                            (Recommended)
                          </small>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="requirements"
                          value={values.requirements}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="List the required skills, qualifications, and experience. Use bullet points or separate lines for better formatting.

Example:
• Bachelor's degree in Computer Science or related field
• 3+ years of experience with JavaScript and React
• Strong problem-solving and communication skills
• Experience with version control (Git)
• Knowledge of database systems and REST APIs"
                        />
                        <Form.Text className="text-muted">
                          Use bullet points (•) or separate lines. These will be
                          parsed into a structured format.
                        </Form.Text>
                      </Form.Group>

                      {/* Job Preview */}
                      {values.title && (
                        <Card className="mb-4 border-info">
                          <Card.Header className="bg-info text-white">
                            <h6 className="mb-0">
                              <FaClock className="me-2" />
                              Job Preview
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h5 className="text-primary mb-1">
                                  {values.title}
                                </h5>
                                <p className="text-muted mb-2">
                                  {values.location} •
                                  <Badge
                                    bg={
                                      jobTypeOptions.find(
                                        (opt) => opt.value === values.jobType
                                      )?.badge || "secondary"
                                    }
                                    className="ms-2"
                                  >
                                    {
                                      jobTypeOptions.find(
                                        (opt) => opt.value === values.jobType
                                      )?.label
                                    }
                                  </Badge>
                                </p>
                              </div>
                            </div>

                            {values.salaryRange && (
                              <p className="mb-2">
                                <strong>Salary:</strong> {values.salaryRange}
                              </p>
                            )}

                            <p className="mb-0">
                              {values.description.substring(0, 150)}
                              {values.description.length > 150 ? "..." : ""}
                            </p>

                            <div className="mt-3 p-2 bg-light rounded">
                              <small className="text-muted">
                                <strong>Note:</strong> This job will require
                                admin approval before being published.
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      )}

                      <div className="d-flex justify-content-between align-items-center border-top pt-4">
                        <div>
                          <small className="text-muted">
                            * Required fields. All jobs require admin approval.
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
                            size="lg"
                          >
                            {isSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />
                                Creating Job...
                              </>
                            ) : (
                              <>
                                <FaPlus className="me-2" />
                                Create Job Posting
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

            {/* Information Card */}
            <Card className="mt-4 border-warning">
              <Card.Header className="bg-warning text-dark">
                <h6 className="mb-0">Important Information</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Approval Process</h6>
                    <ul className="small text-muted mb-0">
                      <li>All jobs are reviewed by our admin team</li>
                      <li>Approval typically takes 24-48 hours</li>
                      <li>You&apos;ll be notified when your job is approved</li>
                      <li>Jobs must comply with our platform guidelines</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h6>Tips for Better Results</h6>
                    <ul className="small text-muted mb-0">
                      <li>Be specific about required skills</li>
                      <li>Include salary range to attract more candidates</li>
                      <li>Clearly describe company culture</li>
                      <li>Specify remote work options if available</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </PrivateLayout>
  );
}
