import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { FaSearch, FaUserTie, FaChartLine } from "react-icons/fa";
import Layout from "@/components/Layout/Layout";

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Smart Job Matching for Nigerian Graduates
              </h1>
              <p className="lead mb-4">
                AI-powered platform connecting talented graduates with the right
                career opportunities. Better matches, faster hiring.
              </p>
              <div className="d-flex gap-3">
                <Button as={Link} href="/register" variant="light" size="lg">
                  Get Started
                </Button>
                <Button
                  as={Link}
                  href="/jobs"
                  variant="outline-light"
                  size="lg"
                >
                  Browse Jobs
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
                    <FaSearch size={48} />
                  </div>
                  <Card.Title>AI-Powered Matching</Card.Title>
                  <Card.Text>
                    Our intelligent algorithm analyzes your skills and
                    experience to find the perfect job matches.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-primary mb-3">
                    <FaUserTie size={48} />
                  </div>
                  <Card.Title>For Graduates</Card.Title>
                  <Card.Text>
                    Upload your CV and let our platform find relevant job
                    opportunities tailored to your profile.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="text-primary mb-3">
                    <FaChartLine size={48} />
                  </div>
                  <Card.Title>For Employers</Card.Title>
                  <Card.Text>
                    Find qualified candidates quickly with our smart matching
                    system and reduce hiring time.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </Layout>
  );
}
