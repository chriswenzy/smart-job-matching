// pages/admin/analytics.js
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Form } from "react-bootstrap";
import AdminLayout from "../../../components/AdminLayout";
import { FaUsers, FaBriefcase, FaFileAlt, FaChartLine } from "react-icons/fa";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({});
  const [timeRange, setTimeRange] = useState("30days");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const analyticsData = await response.json();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container fluid className="p-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h2>Platform Analytics</h2>
            <p className="text-muted">
              Comprehensive overview of platform performance
            </p>
          </Col>
          <Col xs="auto">
            <Form.Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Key Metrics */}
        <Row className="mb-4">
          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Total Users</h6>
                    <h3 className="fw-bold">{analytics.totalUsers || 0}</h3>
                    <small className="text-success">
                      <FaChartLine className="me-1" />+
                      {analytics.userGrowth || 0}% growth
                    </small>
                  </div>
                  <div className="align-self-center">
                    <FaUsers size={24} className="text-primary" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Active Jobs</h6>
                    <h3 className="fw-bold">{analytics.activeJobs || 0}</h3>
                    <small className="text-success">
                      <FaChartLine className="me-1" />+
                      {analytics.jobGrowth || 0}% growth
                    </small>
                  </div>
                  <div className="align-self-center">
                    <FaBriefcase size={24} className="text-success" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Applications</h6>
                    <h3 className="fw-bold">
                      {analytics.totalApplications || 0}
                    </h3>
                    <small className="text-success">
                      <FaChartLine className="me-1" />+
                      {analytics.applicationGrowth || 0}% growth
                    </small>
                  </div>
                  <div className="align-self-center">
                    <FaFileAlt size={24} className="text-warning" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-muted mb-2">Match Rate</h6>
                    <h3 className="fw-bold">
                      {analytics.averageMatchRate || 0}%
                    </h3>
                    <small className="text-success">
                      <FaChartLine className="me-1" />
                      Quality matches
                    </small>
                  </div>
                  <div className="align-self-center">
                    <FaChartLine size={24} className="text-info" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* User Statistics */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">User Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Total Students</strong>
                      </td>
                      <td>{analytics.studentCount || 0}</td>
                      <td className="text-success">
                        +{analytics.studentGrowth || 0}%
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Total Employers</strong>
                      </td>
                      <td>{analytics.employerCount || 0}</td>
                      <td className="text-success">
                        +{analytics.employerGrowth || 0}%
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>New Users (This Month)</strong>
                      </td>
                      <td>{analytics.newUsersThisMonth || 0}</td>
                      <td className="text-success">Active</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Active Users</strong>
                      </td>
                      <td>{analytics.activeUsers || 0}</td>
                      <td className="text-success">
                        {analytics.activeUserPercentage || 0}%
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Job Statistics */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Job Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Total Jobs Posted</strong>
                      </td>
                      <td>{analytics.totalJobs || 0}</td>
                      <td className="text-success">
                        +{analytics.jobGrowth || 0}%
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Pending Approval</strong>
                      </td>
                      <td>{analytics.pendingJobs || 0}</td>
                      <td className="text-warning">Needs review</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Active Jobs</strong>
                      </td>
                      <td>{analytics.activeJobs || 0}</td>
                      <td className="text-success">Live</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Average Applications per Job</strong>
                      </td>
                      <td>{analytics.avgApplicationsPerJob || 0}</td>
                      <td className="text-info">Per job</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Application Statistics */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Application Statistics</h5>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Total Applications</strong>
                      </td>
                      <td>{analytics.totalApplications || 0}</td>
                      <td className="text-success">
                        +{analytics.applicationGrowth || 0}%
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Pending</strong>
                      </td>
                      <td>{analytics.pendingApplications || 0}</td>
                      <td className="text-warning">
                        {analytics.pendingApplicationPercentage || 0}%
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Accepted</strong>
                      </td>
                      <td>{analytics.acceptedApplications || 0}</td>
                      <td className="text-success">
                        {analytics.acceptedApplicationPercentage || 0}%
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Rejected</strong>
                      </td>
                      <td>{analytics.rejectedApplications || 0}</td>
                      <td className="text-danger">
                        {analytics.rejectedApplicationPercentage || 0}%
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Platform Performance */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Platform Performance</h5>
              </Card.Header>
              <Card.Body>
                <Table hover>
                  <tbody>
                    <tr>
                      <td>
                        <strong>Average Match Score</strong>
                      </td>
                      <td>{analytics.averageMatchRate || 0}%</td>
                      <td className="text-success">Quality</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Successful Matches</strong>
                      </td>
                      <td>{analytics.successfulMatches || 0}</td>
                      <td className="text-success">This month</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Response Rate</strong>
                      </td>
                      <td>{analytics.employerResponseRate || 0}%</td>
                      <td className="text-info">Employers</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>User Satisfaction</strong>
                      </td>
                      <td>{analytics.userSatisfaction || 0}%</td>
                      <td className="text-success">Positive</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
}
