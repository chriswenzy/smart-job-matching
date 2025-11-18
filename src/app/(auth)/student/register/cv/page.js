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
  ProgressBar,
} from "react-bootstrap";
import { Formik } from "formik";
import {
  FaUpload,
  FaArrowLeft,
  FaFilePdf,
  FaFileWord,
  FaCheck,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";
import { useRouter } from "next/navigation";

export default function StudentRegisterCV() {
  const [error, setError] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleCvUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (
        !allowedTypes.includes(file.type) &&
        !file.name.match(/\.(pdf|doc|docx)$/i)
      ) {
        setError("Please upload a PDF or Word document (PDF, DOC, DOCX)");
        setCvFile(null);
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        setCvFile(null);
        return;
      }

      setCvFile(file);
      setError("");
    }
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    as="a"
                    href="/student/register"
                    className="me-3"
                  >
                    <FaArrowLeft />
                  </Button>
                  <div>
                    <h3 className="mb-0">Register with CV</h3>
                    <p className="text-muted mb-0">
                      Upload your CV to automatically create your profile
                    </p>
                  </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Formik
                  initialValues={{
                    fullName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phone: "",
                    location: "",
                  }}
                  validate={(values) => {
                    const errors = {};
                    if (!values.fullName) errors.fullName = "Required";
                    if (!values.email) {
                      errors.email = "Required";
                    } else if (
                      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        values.email
                      )
                    ) {
                      errors.email = "Invalid email address";
                    }
                    if (!values.password) errors.password = "Required";
                    if (values.password.length < 6) {
                      errors.password =
                        "Password must be at least 6 characters";
                    }
                    if (values.password !== values.confirmPassword) {
                      errors.confirmPassword = "Passwords must match";
                    }
                    if (!cvFile) errors.cvFile = "CV is required";
                    return errors;
                  }}
                  onSubmit={async (values, { setSubmitting }) => {
                    setError("");
                    setIsUploading(true);

                    const uploadInterval = simulateUpload();

                    try {
                      // Read file as text (simplified - in real app, you'd send file to server)
                      const cvText = await readFileAsText(cvFile);

                      const response = await fetch(
                        "/api/auth/student/register-cv",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            ...values,
                            cvText: cvText.substring(0, 10000), // Limit text length
                          }),
                        }
                      );

                      clearInterval(uploadInterval);
                      setUploadProgress(100);

                      if (response.ok) {
                        const data = await response.json();

                        // Store token and redirect
                        localStorage.setItem("token", data.token);

                        setTimeout(() => {
                          router.push("/student/dashboard?welcome=true");
                        }, 1000);
                      } else {
                        const errorData = await response.json();
                        setError(errorData.message || "Registration failed");
                        setUploadProgress(0);
                      }
                    } catch (error) {
                      clearInterval(uploadInterval);
                      setUploadProgress(0);
                      setError("Registration failed. Please try again.");
                    }

                    setIsUploading(false);
                    setSubmitting(false);
                  }}
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
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.fullName}
                              isInvalid={touched.fullName && errors.fullName}
                              placeholder="Enter your full name"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.fullName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address *</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.email}
                              isInvalid={touched.email && errors.email}
                              placeholder="your.email@example.com"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="password"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.password}
                              isInvalid={touched.password && errors.password}
                              placeholder="At least 6 characters"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.password}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Confirm Password *</Form.Label>
                            <Form.Control
                              type="password"
                              name="confirmPassword"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.confirmPassword}
                              isInvalid={
                                touched.confirmPassword &&
                                errors.confirmPassword
                              }
                              placeholder="Confirm your password"
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                              type="tel"
                              name="phone"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.phone}
                              placeholder="+234 800 000 0000"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                              type="text"
                              name="location"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.location}
                              placeholder="e.g., Lagos, Nigeria"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      {/* CV Upload Section */}
                      <div className="mb-4">
                        <Form.Group>
                          <Form.Label className="fw-semibold">
                            Upload Your CV *
                          </Form.Label>

                          {!cvFile ? (
                            <div className="border-2 border-dashed rounded p-4 text-center bg-light">
                              <FaUpload className="text-muted mb-3" size={32} />
                              <h5>Drop your CV here or click to browse</h5>
                              <p className="text-muted small mb-3">
                                Supported formats: PDF, DOC, DOCX
                              </p>
                              <Form.Control
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleCvUpload}
                                isInvalid={touched.cvFile && errors.cvFile}
                                className="d-none"
                                id="cv-upload"
                              />
                              <Button
                                variant="outline-primary"
                                onClick={() =>
                                  document.getElementById("cv-upload").click()
                                }
                              >
                                Browse Files
                              </Button>
                            </div>
                          ) : (
                            <div className="border rounded p-3 bg-success bg-opacity-10">
                              <div className="d-flex align-items-center">
                                <div className="me-3">
                                  {cvFile.type.includes("pdf") ? (
                                    <FaFilePdf
                                      size={24}
                                      className="text-danger"
                                    />
                                  ) : (
                                    <FaFileWord
                                      size={24}
                                      className="text-primary"
                                    />
                                  )}
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <strong>{cvFile.name}</strong>
                                      <br />
                                      <small className="text-muted">
                                        Size:{" "}
                                        {(cvFile.size / 1024 / 1024).toFixed(2)}{" "}
                                        MB
                                      </small>
                                    </div>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => setCvFile(null)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <Form.Control.Feedback
                            type="invalid"
                            className="d-block"
                          >
                            {errors.cvFile}
                          </Form.Control.Feedback>

                          <Form.Text className="text-muted">
                            We'll automatically extract your skills, education,
                            and experience from your CV.
                          </Form.Text>
                        </Form.Group>
                      </div>

                      {/* Upload Progress */}
                      {uploadProgress > 0 && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>
                              {uploadProgress === 100
                                ? "Processing complete!"
                                : "Processing CV..."}
                            </span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <ProgressBar
                            now={uploadProgress}
                            variant={
                              uploadProgress === 100 ? "success" : "primary"
                            }
                            animated={uploadProgress < 100}
                          />
                          {uploadProgress === 100 && (
                            <div className="text-center mt-2">
                              <FaCheck className="text-success me-2" />
                              <small className="text-success">
                                CV processed successfully!
                              </small>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Terms and Conditions */}
                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          id="terms"
                          label={
                            <span>
                              I agree to the{" "}
                              <a
                                href="/terms"
                                target="_blank"
                                className="text-decoration-none"
                              >
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a
                                href="/privacy"
                                target="_blank"
                                className="text-decoration-none"
                              >
                                Privacy Policy
                              </a>
                            </span>
                          }
                          required
                        />
                      </Form.Group>

                      <div className="d-grid gap-2">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting || isUploading}
                          size="lg"
                        >
                          {isSubmitting || isUploading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              />
                              Creating Profile...
                            </>
                          ) : (
                            <>
                              <FaUpload className="me-2" />
                              Create Profile from CV
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline-secondary"
                          as="a"
                          href="/student/register"
                        >
                          Back to Registration Options
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>

                {/* Security Note */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    <FaCheck className="text-success me-1" />
                    Your data is secure and encrypted
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
