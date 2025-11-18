// pages/student/profile.js
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
  Tab,
  Tabs,
} from "react-bootstrap";
import { Formik } from "formik";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import {
  FaSave,
  FaUpload,
  FaEdit,
  FaUser,
  FaGraduationCap,
  FaBriefcase,
} from "react-icons/fa";

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await response.json();
      setProfile(profileData);
      setSkills(profileData.skills || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const updateCV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/profile/cv", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("CV updated successfully!");
        fetchProfile();
      }
    } catch (error) {
      alert("Error updating CV");
    }
  };

  const updateProfile = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          skills: skills,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setEditing(false);
        fetchProfile();
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!profile) {
    return (
      <Layout>
        <Container className="py-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-4">
        <Row className="mb-4">
          <Col>
            <h2>My Profile</h2>
            <p className="text-muted">Manage your profile information</p>
          </Col>
          <Col xs="auto">
            {!editing ? (
              <Button
                variant="outline-primary"
                onClick={() => setEditing(true)}
              >
                <FaEdit className="me-2" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outline-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel Edit
              </Button>
            )}
          </Col>
        </Row>

        {saved && (
          <Alert variant="success" className="mb-4">
            Profile updated successfully!
          </Alert>
        )}

        <Tabs defaultActiveKey="personal" className="mb-4">
          {/* Personal Information */}
          <Tab
            eventKey="personal"
            title={
              <span>
                <FaUser className="me-2" />
                Personal
              </span>
            }
          >
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Formik
                  initialValues={{
                    fullName: profile.fullName || "",
                    email: user?.email || "",
                    phone: profile.phone || "",
                    location: profile.location || "",
                    bio: profile.bio || "",
                  }}
                  onSubmit={updateProfile}
                >
                  {({ values, handleChange, handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="fullName"
                              value={values.fullName}
                              onChange={handleChange}
                              disabled={!editing}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={values.email}
                              disabled
                            />
                            <Form.Text className="text-muted">
                              Email cannot be changed
                            </Form.Text>
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
                              value={values.phone}
                              onChange={handleChange}
                              disabled={!editing}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                              type="text"
                              name="location"
                              value={values.location}
                              onChange={handleChange}
                              disabled={!editing}
                              placeholder="e.g., Lagos, Nigeria"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          name="bio"
                          value={values.bio}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Tell us about yourself, your career goals, and interests..."
                        />
                      </Form.Group>

                      {editing && (
                        <div className="d-flex gap-2">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                          >
                            <FaSave className="me-2" />
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={() => setEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Tab>

          {/* Education & Skills */}
          <Tab
            eventKey="education"
            title={
              <span>
                <FaGraduationCap className="me-2" />
                Education & Skills
              </span>
            }
          >
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Formik
                  initialValues={{
                    institution: profile.institution || "",
                    degree: profile.degree || "",
                    fieldOfStudy: profile.fieldOfStudy || "",
                    graduationYear:
                      profile.graduationYear || new Date().getFullYear(),
                    experience: profile.experience || "",
                  }}
                  onSubmit={updateProfile}
                >
                  {({ values, handleChange, handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Institution</Form.Label>
                            <Form.Control
                              type="text"
                              name="institution"
                              value={values.institution}
                              onChange={handleChange}
                              disabled={!editing}
                              placeholder="e.g., University of Lagos"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Degree</Form.Label>
                            <Form.Select
                              name="degree"
                              value={values.degree}
                              onChange={handleChange}
                              disabled={!editing}
                            >
                              <option value="">Select Degree</option>
                              <option value="B.Sc">
                                Bachelor of Science (B.Sc)
                              </option>
                              <option value="B.Eng">
                                Bachelor of Engineering (B.Eng)
                              </option>
                              <option value="B.Tech">
                                Bachelor of Technology (B.Tech)
                              </option>
                              <option value="M.Sc">
                                Master of Science (M.Sc)
                              </option>
                              <option value="M.Eng">
                                Master of Engineering (M.Eng)
                              </option>
                              <option value="PhD">Doctorate (PhD)</option>
                              <option value="HND">
                                Higher National Diploma (HND)
                              </option>
                              <option value="OND">
                                Ordinary National Diploma (OND)
                              </option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Field of Study</Form.Label>
                            <Form.Control
                              type="text"
                              name="fieldOfStudy"
                              value={values.fieldOfStudy}
                              onChange={handleChange}
                              disabled={!editing}
                              placeholder="e.g., Computer Science"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Graduation Year</Form.Label>
                            <Form.Control
                              type="number"
                              name="graduationYear"
                              value={values.graduationYear}
                              onChange={handleChange}
                              disabled={!editing}
                              min="2000"
                              max="2030"
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Experience</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="experience"
                          value={values.experience}
                          onChange={handleChange}
                          disabled={!editing}
                          placeholder="Describe your work experience, projects, and achievements..."
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label>Skills</Form.Label>
                        {editing ? (
                          <>
                            <div className="d-flex mb-2">
                              <Form.Control
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Add a skill (e.g., JavaScript, React)"
                                disabled={!editing}
                              />
                              <Button
                                variant="outline-primary"
                                className="ms-2"
                                onClick={addSkill}
                                type="button"
                                disabled={!editing}
                              >
                                Add
                              </Button>
                            </div>
                            <Form.Text className="text-muted">
                              Press Enter or click Add to include skills
                            </Form.Text>
                          </>
                        ) : null}

                        <div className="mt-2">
                          {skills.map((skill, index) => (
                            <Badge
                              key={index}
                              bg="primary"
                              className="me-1 mb-1 d-inline-flex align-items-center"
                            >
                              {skill}
                              {editing && (
                                <button
                                  type="button"
                                  className="btn-close btn-close-white ms-1"
                                  style={{ fontSize: "0.7rem" }}
                                  onClick={() => removeSkill(skill)}
                                  aria-label="Remove"
                                />
                              )}
                            </Badge>
                          ))}
                          {skills.length === 0 && (
                            <p className="text-muted">No skills added yet</p>
                          )}
                        </div>
                      </Form.Group>

                      {editing && (
                        <div className="d-flex gap-2">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                          >
                            <FaSave className="me-2" />
                            {isSubmitting ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Tab>

          {/* CV & Documents */}
          <Tab
            eventKey="documents"
            title={
              <span>
                <FaBriefcase className="me-2" />
                Documents
              </span>
            }
          >
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="mb-4">
                  <h5>CV/Resume</h5>
                  <p className="text-muted">
                    Upload your CV to get better job matches. We'll
                    automatically extract your skills and experience.
                  </p>

                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={updateCV}
                      id="cv-upload"
                      style={{ display: "none" }}
                    />
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        document.getElementById("cv-upload").click()
                      }
                    >
                      <FaUpload className="me-2" />
                      Update CV
                    </Button>

                    {profile.resumeUrl && (
                      <Button
                        variant="outline-success"
                        href={profile.resumeUrl}
                        target="_blank"
                      >
                        View Current CV
                      </Button>
                    )}
                  </div>
                </div>

                {profile.cvText && (
                  <div className="mt-4">
                    <h6>Extracted Information from CV</h6>
                    <Card className="bg-light">
                      <Card.Body>
                        <p className="small text-muted mb-0">
                          {profile.cvText.substring(0, 500)}...
                        </p>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>
    </Layout>
  );
}
