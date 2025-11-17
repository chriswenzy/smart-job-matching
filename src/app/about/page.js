import Layout from "@/components/Layout/Layout";
import { Container, Row, Col, Card } from "react-bootstrap";

export default function About() {
  return (
    <Layout>
      <Container className="py-5">
        <Row>
          <Col lg={8} className="mx-auto">
            <h1 className="text-center mb-4">About Smart Job Match</h1>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <p className="lead">
                  Smart Job Match is an AI-powered platform designed to bridge
                  the gap between Nigerian graduates and employers through
                  intelligent job matching.
                </p>
                <p>
                  Our platform uses advanced Natural Language Processing (NLP)
                  techniques to understand the semantic meaning of job
                  descriptions and candidate profiles, going beyond simple
                  keyword matching to provide truly relevant matches.
                </p>
                <h5>Our Mission</h5>
                <p>
                  To reduce graduate unemployment in Nigeria by creating an
                  efficient, intelligent, and accessible job matching ecosystem
                  that benefits both job seekers and employers.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
