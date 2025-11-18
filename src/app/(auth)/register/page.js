"use client";
import { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import Link from "next/link";
import {
  FaUserGraduate,
  FaUserTie,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import Layout from "@/components/Layout/Layout";

export default function Register() {
  const [selectedType, setSelectedType] = useState("");

  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">Join Smart Job Match</h1>
              <p className="lead text-muted">
                Create an account to find your perfect job match or hire the
                best talent
              </p>
            </div>

            {/* Registration Options */}
            <Row className="g-4">
              {/* Student Registration */}
              <Col md={6}>
                <Card
                  className={`h-100 shadow-sm border-0 cursor-pointer ${
                    selectedType === "student" ? "border-primary border-2" : ""
                  }`}
                  onClick={() => setSelectedType("student")}
                  style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  <Card.Body className="p-4 text-center">
                    <div className="text-primary mb-3">
                      <FaUserGraduate size={64} />
                    </div>
                    <Card.Title className="h3 mb-3">I'm a Student</Card.Title>
                    <Card.Text className="text-muted mb-4">
                      Looking for job opportunities? Create a profile and get
                      matched with companies seeking your skills.
                    </Card.Text>

                    <div className="text-start text-muted small mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <FaCheck className="text-success me-2" />
                        <span>AI-powered job matching</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaCheck className="text-success me-2" />
                        <span>Upload CV for instant profile</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaCheck className="text-success me-2" />
                        <span>Personalized job recommendations</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaCheck className="text-success me-2" />
                        <span>Free forever for students</span>
                      </div>
                    </div>

                    {selectedType === "student" ? (
                      <div className="d-grid gap-2">
                        <Button
                          as={Link}
                          href="/student/register"
                          variant="primary"
                          size="lg"
                        >
                          Continue as Student <FaArrowRight className="ms-2" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={() => setSelectedType("student")}
                      >
                        Select Student
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Employer Registration */}
              <Col md={6}>
                <Card
                  className={`h-100 shadow-sm border-0 cursor-pointer ${
                    selectedType === "employer" ? "border-primary border-2" : ""
                  }`}
                  onClick={() => setSelectedType("employer")}
                  style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                >
                  <Card.Body className="p-4 text-center">
                    <div className="text-primary mb-3">
                      <FaUserTie size={64} />
                    </div>
                    <Card.Title className="h3 mb-3">I'm an Employer</Card.Title>
                    <Card.Text className="text-muted mb-4">
                      Looking for talented graduates? Post jobs and find
                      qualified candidates with our AI matching system.
                    </Card.Text>

                    <div className="text-start text-muted small mb-4">
                      <div className="d-flex align-items-center mb-2">
                        <FaCheck className="text-success me-2" />
                        <span>AI-powered candidate matching</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaCheck className="text-success me-2" />
                        <span>Access to qualified graduates</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaCheck className="text-success me-2" />
                        <span>Streamlined hiring process</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <FaCheck className="text-success me-2" />
                        <span>Free basic plan available</span>
                      </div>
                    </div>

                    {selectedType === "employer" ? (
                      <div className="d-grid gap-2">
                        <Button
                          as={Link}
                          href="/employer/register"
                          variant="primary"
                          size="lg"
                        >
                          Continue as Employer <FaArrowRight className="ms-2" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline-primary"
                        className="w-100"
                        onClick={() => setSelectedType("employer")}
                      >
                        Select Employer
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Already have account */}
            <div className="text-center mt-5">
              <p className="text-muted">
                Already have an account?{" "}
                <Link href="/login" className="fw-semibold">
                  Login here
                </Link>
              </p>
            </div>

            {/* Benefits Section */}
            <Row className="mt-5 pt-5 border-top">
              <Col md={4} className="text-center mb-4">
                <div className="text-primary mb-3">
                  <FaUserGraduate size={32} />
                </div>
                <h5>5000+ Graduates</h5>
                <p className="text-muted small">
                  Talented graduates ready to work
                </p>
              </Col>
              <Col md={4} className="text-center mb-4">
                <div className="text-primary mb-3">
                  <FaUserTie size={32} />
                </div>
                <h5>200+ Companies</h5>
                <p className="text-muted small">
                  Top companies hiring through our platform
                </p>
              </Col>
              <Col md={4} className="text-center mb-4">
                <div className="text-primary mb-3">
                  <FaCheck size={32} />
                </div>
                <h5>85% Match Rate</h5>
                <p className="text-muted small">Successful job matches</p>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
