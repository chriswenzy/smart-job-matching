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
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPaperPlane,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Layout>
      <Container className="py-5">
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">Contact Us</h1>
            <p className="lead text-muted">
              Get in touch with our team. We're here to help you with any
              questions.
            </p>
          </Col>
        </Row>

        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                {submitted && (
                  <Alert variant="success" className="mb-4">
                    Thank you for your message! We'll get back to you soon.
                  </Alert>
                )}

                <Formik
                  initialValues={{
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                  }}
                  validate={(values) => {
                    const errors = {};
                    if (!values.name) errors.name = "Required";
                    if (!values.email) {
                      errors.email = "Required";
                    } else if (
                      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        values.email
                      )
                    ) {
                      errors.email = "Invalid email address";
                    }
                    if (!values.subject) errors.subject = "Required";
                    if (!values.message) errors.message = "Required";
                    return errors;
                  }}
                  onSubmit={async (values, { setSubmitting, resetForm }) => {
                    try {
                      // Simulate API call
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      setSubmitted(true);
                      resetForm();
                    } catch (error) {
                      console.error("Error submitting form:", error);
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
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name *</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.name}
                              isInvalid={touched.name && errors.name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.name}
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
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Subject *</Form.Label>
                        <Form.Control
                          type="text"
                          name="subject"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.subject}
                          isInvalid={touched.subject && errors.subject}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.subject}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Message *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.message}
                          isInvalid={touched.message && errors.message}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.message}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <div className="d-grid">
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          disabled={isSubmitting}
                        >
                          <FaPaperPlane className="me-2" />
                          {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Contact Information */}
        <Row className="mt-5">
          <Col md={4} className="text-center mb-4">
            <div className="text-primary mb-3">
              <FaEnvelope size={32} />
            </div>
            <h5>Email</h5>
            <p className="text-muted">support@smartjobmatch.com</p>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="text-primary mb-3">
              <FaPhone size={32} />
            </div>
            <h5>Phone</h5>
            <p className="text-muted">+234 800 123 4567</p>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="text-primary mb-3">
              <FaMapMarkerAlt size={32} />
            </div>
            <h5>Address</h5>
            <p className="text-muted">Lagos, Nigeria</p>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
