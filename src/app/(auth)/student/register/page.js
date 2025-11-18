"use client";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Link from "next/link";
import {
  FaFileUpload,
  FaUserEdit,
  FaArrowRight,
  FaClock,
  FaUserCheck,
  FaMagic,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";

export default function StudentRegister() {
  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="text-center mb-5">
              <h1 className="display-5 fw-bold mb-3">
                Create Your Student Profile
              </h1>
              <p className="lead text-muted">
                Choose how you'd like to create your profile. Both methods will
                help us match you with the right jobs.
              </p>
            </div>

            <Row className="g-4">
              {/* CV Upload Option */}
              <Col md={6}>
                <Card className="h-100 shadow-sm border-0 position-relative">
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-primary">Recommended</span>
                  </div>
                  <Card.Body className="p-4 text-center">
                    <div className="text-primary mb-3">
                      <FaFileUpload size={48} />
                    </div>
                    <Card.Title className="h4 mb-3">
                      Quick Start with CV
                    </Card.Title>
                    <Card.Text className="text-muted mb-4">
                      Upload your CV and we'll automatically extract your
                      skills, education, and experience to create your profile
                      instantly.
                    </Card.Text>

                    <div className="features-list text-start mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="feature-icon text-success me-3">
                          <FaMagic size={20} />
                        </div>
                        <div>
                          <strong>Automatic Profile Creation</strong>
                          <p className="text-muted small mb-0">
                            We extract everything from your CV
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="feature-icon text-success me-3">
                          <FaClock size={20} />
                        </div>
                        <div>
                          <strong>2-Minute Setup</strong>
                          <p className="text-muted small mb-0">
                            Get your profile ready in minutes
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="feature-icon text-success me-3">
                          <FaUserCheck size={20} />
                        </div>
                        <div>
                          <strong>Smart Skill Extraction</strong>
                          <p className="text-muted small mb-0">
                            AI identifies your key skills automatically
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid">
                      <Button
                        as={Link}
                        href="/student/register/cv"
                        variant="primary"
                        size="lg"
                        className="py-3"
                      >
                        <FaFileUpload className="me-2" />
                        Upload CV & Create Profile
                        <FaArrowRight className="ms-2" />
                      </Button>
                    </div>

                    <div className="mt-3">
                      <small className="text-muted">
                        Supports PDF, DOC, DOCX files
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Manual Form Option */}
              <Col md={6}>
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body className="p-4 text-center">
                    <div className="text-primary mb-3">
                      <FaUserEdit size={48} />
                    </div>
                    <Card.Title className="h4 mb-3">
                      Manual Profile Setup
                    </Card.Title>
                    <Card.Text className="text-muted mb-4">
                      Fill out the form yourself to provide detailed information
                      about your skills, education, and experience.
                    </Card.Text>

                    <div className="features-list text-start mb-4">
                      <div className="d-flex align-items-center mb-3">
                        <div className="feature-icon text-info me-3">
                          <FaUserEdit size={20} />
                        </div>
                        <div>
                          <strong>Complete Control</strong>
                          <p className="text-muted small mb-0">
                            Fill out every detail manually
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="feature-icon text-info me-3">
                          <FaUserCheck size={20} />
                        </div>
                        <div>
                          <strong>Custom Skills</strong>
                          <p className="text-muted small mb-0">
                            Add specific skills manually
                          </p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <div className="feature-icon text-info me-3">
                          <FaClock size={20} />
                        </div>
                        <div>
                          <strong>Detailed Experience</strong>
                          <p className="text-muted small mb-0">
                            Describe your experience in detail
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid">
                      <Button
                        as={Link}
                        href="/student/register/form"
                        variant="outline-primary"
                        size="lg"
                        className="py-3"
                      >
                        <FaUserEdit className="me-2" />
                        Fill Out Form
                        <FaArrowRight className="ms-2" />
                      </Button>
                    </div>

                    <div className="mt-3">
                      <small className="text-muted">
                        Recommended if you want full control
                      </small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Back to main register */}
            <div className="text-center mt-5">
              <Button as={Link} href="/register" variant="outline-secondary">
                Back to Registration Options
              </Button>
            </div>

            {/* Security Note */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Your data is secure and protected. We never share your personal
                information.
              </small>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .features-list .feature-icon {
          flex-shrink: 0;
          width: 40px;
          text-align: center;
        }

        .card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </Layout>
  );
}
