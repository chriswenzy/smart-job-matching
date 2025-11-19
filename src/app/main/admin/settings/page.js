"use client";

import AdminLayout from "@/components/Layout/AdminLayout";
import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Tab,
  Tabs,
} from "react-bootstrap";
import { FaBell, FaCog, FaPalette, FaSave } from "react-icons/fa";
import { FaShield } from "react-icons/fa6";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "Smart Job Match",
    siteDescription: "AI-Powered Job Matching Platform",
    adminEmail: "admin@jobmatch.com",
    supportEmail: "support@jobmatch.com",
    maxJobPosts: 10,
    autoApproveJobs: false,
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false,
    theme: "light",
  });
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  return (
    <AdminLayout>
      <Container fluid className="p-4">
        <Row className="mb-4">
          <Col>
            <h2>System Settings</h2>
            <p className="text-muted">
              Configure platform settings and preferences
            </p>
          </Col>
        </Row>

        {saved && (
          <Alert variant="success" className="mb-4">
            Settings saved successfully!
          </Alert>
        )}

        <Form onSubmit={handleSaveSettings}>
          <Tabs defaultActiveKey="general" className="mb-4">
            {/* General Settings */}
            <Tab
              eventKey="general"
              title={
                <span>
                  <FaCog className="me-2" />
                  General
                </span>
              }
            >
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">General Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Site Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="siteName"
                          value={settings.siteName}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Admin Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="adminEmail"
                          value={settings.adminEmail}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Site Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Support Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="supportEmail"
                          value={settings.supportEmail}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Max Job Posts per Employer</Form.Label>
                        <Form.Control
                          type="number"
                          name="maxJobPosts"
                          value={settings.maxJobPosts}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>

            {/* Security Settings */}
            <Tab
              eventKey="security"
              title={
                <span>
                  <FaShield className="me-2" />
                  Security
                </span>
              }
            >
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Security Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="requireEmailVerification"
                      name="requireEmailVerification"
                      label="Require Email Verification"
                      checked={settings.requireEmailVerification}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Users must verify their email address before using the
                      platform
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="autoApproveJobs"
                      name="autoApproveJobs"
                      label="Auto-approve Job Posts"
                      checked={settings.autoApproveJobs}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Job posts will be automatically approved without admin
                      review
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="maintenanceMode"
                      name="maintenanceMode"
                      label="Maintenance Mode"
                      checked={settings.maintenanceMode}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Put the platform in maintenance mode (only admins can
                      access)
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Tab>

            {/* Notification Settings */}
            <Tab
              eventKey="notifications"
              title={
                <span>
                  <FaBell className="me-2" />
                  Notifications
                </span>
              }
            >
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Notification Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="enableNotifications"
                      name="enableNotifications"
                      label="Enable Email Notifications"
                      checked={settings.enableNotifications}
                      onChange={handleInputChange}
                    />
                    <Form.Text className="text-muted">
                      Send email notifications for important events
                    </Form.Text>
                  </Form.Group>

                  <h6 className="mt-4">Notification Types</h6>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="notifyNewUsers"
                      label="Notify on new user registrations"
                      defaultChecked
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="notifyJobPosts"
                      label="Notify on new job posts"
                      defaultChecked
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="notifyApplications"
                      label="Notify on new applications"
                      defaultChecked
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Tab>

            {/* Appearance Settings */}
            <Tab
              eventKey="appearance"
              title={
                <span>
                  <FaPalette className="me-2" />
                  Appearance
                </span>
              }
            >
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Appearance Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Theme</Form.Label>
                    <Form.Select
                      name="theme"
                      value={settings.theme}
                      onChange={handleInputChange}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto (System)</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Primary Color</Form.Label>
                    <Form.Control
                      type="color"
                      defaultValue="#0d6efd"
                      style={{ width: "80px", height: "40px" }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Logo</Form.Label>
                    <Form.Control type="file" accept="image/*" />
                    <Form.Text className="text-muted">
                      Upload your platform logo (Recommended: 200x50px)
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Favicon</Form.Label>
                    <Form.Control type="file" accept="image/*" />
                    <Form.Text className="text-muted">
                      Upload your favicon (Recommended: 32x32px)
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>

          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary" size="lg">
              <FaSave className="me-2" />
              Save Settings
            </Button>
          </div>
        </Form>
      </Container>
    </AdminLayout>
  );
}
