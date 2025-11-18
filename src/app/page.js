"use client";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import Link from "next/link";
import {
  FaSearch,
  FaUserTie,
  FaChartLine,
  FaUserGraduate,
  FaArrowRight,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center min-vh-50">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Smart Job Matching for Nigerian Graduates
              </h1>
              <p className="lead mb-4">
                AI-powered platform connecting talented graduates with the right
                career opportunities. Better matches, faster hiring.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <Button
                  as={Link}
                  href="/student/register"
                  variant="light"
                  size="lg"
                >
                  Find Jobs
                </Button>
                <Button
                  as={Link}
                  href="/employer/register"
                  variant="outline-light"
                  size="lg"
                >
                  Hire Talent
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="text-center">
                <img
                  src="/hero-image.svg"
                  alt="Job Matching"
                  className="img-fluid"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Search Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="border-0 shadow">
                <Card.Body className="p-4">
                  <h4 className="text-center mb-4">Find Your Dream Job</h4>
                  <Form>
                    <Row>
                      <Col md={5}>
                        <Form.Group className="mb-3">
                          <Form.Control
                            type="text"
                            placeholder="Job title, keywords, or company"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group className="mb-3">
                          <Form.Control
                            type="text"
                            placeholder="City, state, or remote"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Button variant="primary" className="w-100">
                          <FaSearch className="me-2" />
                          Search
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="fw-bold">How It Works</h2>
              <p className="text-muted">
                Smart matching powered by AI technology
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-primary mb-3">
                    <FaUserGraduate size={48} />
                  </div>
                  <Card.Title>For Graduates</Card.Title>
                  <Card.Text>
                    Upload your CV and let our AI match you with perfect job
                    opportunities based on your skills and experience.
                  </Card.Text>
                  <Button
                    as={Link}
                    href="/student/register"
                    variant="outline-primary"
                  >
                    Get Started <FaArrowRight className="ms-2" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-primary mb-3">
                    <FaUserTie size={48} />
                  </div>
                  <Card.Title>For Employers</Card.Title>
                  <Card.Text>
                    Find qualified candidates quickly with our smart matching
                    system. Reduce hiring time and costs.
                  </Card.Text>
                  <Button
                    as={Link}
                    href="/employer/register"
                    variant="outline-primary"
                  >
                    Post Jobs <FaArrowRight className="ms-2" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-primary mb-3">
                    <FaChartLine size={48} />
                  </div>
                  <Card.Title>AI Powered</Card.Title>
                  <Card.Text>
                    Advanced algorithms analyze skills, experience, and
                    requirements to create perfect matches.
                  </Card.Text>
                  <Button as={Link} href="/about" variant="outline-primary">
                    Learn More <FaArrowRight className="ms-2" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-primary text-white">
        <Container>
          <Row className="text-center">
            <Col md={3} className="mb-4">
              <h2 className="fw-bold">500+</h2>
              <p>Jobs Available</p>
            </Col>
            <Col md={3} className="mb-4">
              <h2 className="fw-bold">1,200+</h2>
              <p>Registered Graduates</p>
            </Col>
            <Col md={3} className="mb-4">
              <h2 className="fw-bold">150+</h2>
              <p>Partner Companies</p>
            </Col>
            <Col md={3} className="mb-4">
              <h2 className="fw-bold">85%</h2>
              <p>Match Success Rate</p>
            </Col>
          </Row>
        </Container>
      </section>
    </Layout>
  );
}
