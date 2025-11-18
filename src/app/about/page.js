"use client";
import Layout from "@/components/Layout/Layout";
import { Container, Row, Col, Card, CardBody } from "react-bootstrap";
import { FaBullseye, FaEye, FaHandshake } from "react-icons/fa";

export default function About() {
  return (
    <Layout>
      <Container className="py-5">
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">About Smart Job Match</h1>
            <p className="lead text-muted">
              Revolutionizing the way Nigerian graduates find employment through
              AI-powered matching technology.
            </p>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <CardBody className="p-4">
                <h3 className="mb-4">Our Mission</h3>
                <p>
                  To bridge the gap between talented Nigerian graduates and
                  employers by leveraging artificial intelligence to create
                  meaningful, relevant job matches.
                </p>
                <p>
                  We believe that every graduate deserves the opportunity to
                  find work that matches their skills, aspirations, and
                  potential.
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100">
              <CardBody className="p-4">
                <h3 className="mb-4">Our Vision</h3>
                <p>
                  To become Nigeria's leading job matching platform,
                  significantly reducing graduate unemployment through
                  intelligent technology and personalized career guidance.
                </p>
                <p>
                  We envision a future where no graduate struggles to find
                  meaningful employment due to inefficient job search processes.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-5">Why Choose Smart Job Match?</h2>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-4">
            <Card className="text-center border-0 shadow-sm h-100">
              <CardBody className="p-4">
                <div className="text-primary mb-3">
                  <FaBullseye size={48} />
                </div>
                <Card.Title>Precision Matching</Card.Title>
                <Card.Text>
                  Our AI algorithms go beyond keywords to understand the context
                  and semantics of both job requirements and candidate profiles.
                </Card.Text>
              </CardBody>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="text-center border-0 shadow-sm h-100">
              <CardBody className="p-4">
                <div className="text-primary mb-3">
                  <FaEye size={48} />
                </div>
                <Card.Title>Local Focus</Card.Title>
                <Card.Text>
                  Built specifically for the Nigerian job market, understanding
                  local institutions, qualifications, and industry needs.
                </Card.Text>
              </CardBody>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="text-center border-0 shadow-sm h-100">
              <CardBody className="p-4">
                <div className="text-primary mb-3">
                  <FaHandshake size={48} />
                </div>
                <Card.Title>Career Growth</Card.Title>
                <Card.Text>
                  We don't just match jobs; we help build careers with insights
                  into skill gaps and professional development opportunities.
                </Card.Text>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
