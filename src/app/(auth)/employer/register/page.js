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
} from "react-bootstrap";
import { Formik } from "formik";
import { FaArrowLeft, FaBuilding, FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";

export default function EmployerRegister() {
  const [error, setError] = useState("");
  const router = useRouter();

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees",
  ];

  const industries = [
    "Information Technology",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail & E-commerce",
    "Telecommunications",
    "Media & Entertainment",
    "Hospitality & Tourism",
    "Real Estate",
    "Agriculture",
    "Energy & Utilities",
    "Transportation & Logistics",
    "Consulting",
    "Other",
  ];

  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    as="a"
                    href="/register"
                    className="me-3"
                  >
                    <FaArrowLeft />
                  </Button>
                  <div>
                    <h3 className="mb-0">Employer Registration</h3>
                    <p className="text-muted mb-0">
                      Create your employer account to start hiring talent
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
                    companyName: "",
                    industry: "",
                    companySize: "",
                    website: "",
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
                    if (!values.companyName) errors.companyName = "Required";
                    return errors;
                  }}
                  onSubmit={async (values, { setSubmitting }) => {
                    setError("");

                    try {
                      const response = await fetch(
                        "/api/auth/employer/register",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(values),
                        }
                      );

                      if (response.ok) {
                        const data = await response.json();

                        // Store token and redirect
                        localStorage.setItem("token", data.token);
                        router.push("/main/employer/dashboard?welcome=true");
                      } else {
                        const errorData = await response.json();
                        setError(errorData.message || "Registration failed");
                      }
                    } catch (error) {
                      setError("Registration failed. Please try again.");
                    }
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
                      {/* Personal Information */}
                      <div className="mb-4">
                        <h5 className="mb-3 border-bottom pb-2">
                          <FaBuilding className="me-2" />
                          Contact Person Information
                        </h5>
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
                                placeholder="Your full name"
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
                                placeholder="your.email@company.com"
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
                      </div>

                      {/* Company Information */}
                      <div className="mb-4">
                        <h5 className="mb-3 border-bottom pb-2">
                          <FaBuilding className="me-2" />
                          Company Information
                        </h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Company Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="companyName"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.companyName}
                            isInvalid={
                              touched.companyName && errors.companyName
                            }
                            placeholder="Your company name"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.companyName}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Industry</Form.Label>
                              <Form.Select
                                name="industry"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.industry}
                              >
                                <option value="">Select Industry</option>
                                {industries.map((industry) => (
                                  <option key={industry} value={industry}>
                                    {industry}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Company Size</Form.Label>
                              <Form.Select
                                name="companySize"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.companySize}
                              >
                                <option value="">Select Company Size</option>
                                {companySizes.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label>Website</Form.Label>
                          <Form.Control
                            type="url"
                            name="website"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.website}
                            placeholder="https://www.company.com"
                          />
                        </Form.Group>
                      </div>

                      {/* Benefits Section */}
                      <Card className="bg-light border-0 mb-4">
                        <Card.Body>
                          <h6 className="mb-3">
                            <FaCheck className="text-success me-2" />
                            What you get as an employer:
                          </h6>
                          <Row>
                            <Col md={6}>
                              <div className="d-flex align-items-center mb-2">
                                <FaCheck
                                  className="text-success me-2"
                                  size={12}
                                />
                                <small>AI-powered candidate matching</small>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <FaCheck
                                  className="text-success me-2"
                                  size={12}
                                />
                                <small>Access to qualified graduates</small>
                              </div>
                            </Col>
                            <Col md={6}>
                              <div className="d-flex align-items-center mb-2">
                                <FaCheck
                                  className="text-success me-2"
                                  size={12}
                                />
                                <small>Streamlined hiring process</small>
                              </div>
                              <div className="d-flex align-items-center">
                                <FaCheck
                                  className="text-success me-2"
                                  size={12}
                                />
                                <small>Free basic plan available</small>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

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
                          disabled={isSubmitting}
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              <FaBuilding className="me-2" />
                              Create Employer Account
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline-secondary"
                          as="a"
                          href="/register"
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
                    Your company information is secure and protected
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
