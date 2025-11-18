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
  Badge,
} from "react-bootstrap";
import { Formik } from "formik";
import { FaArrowLeft, FaPlus, FaTrash, FaSave } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout/Layout";

export default function StudentRegisterForm() {
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const router = useRouter();

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

  const popularSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "HTML",
    "CSS",
    "SQL",
    "MongoDB",
    "Express",
    "Vue",
    "Angular",
    "TypeScript",
    "PHP",
    "Laravel",
    "Django",
    "Flask",
    "Java",
    "C#",
    "C++",
  ];

  const addPopularSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                {/* Header */}
                <div className="d-flex align-items-center mb-4">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    as="a"
                    href="/student/register"
                    className="me-3"
                  >
                    <FaArrowLeft />
                  </Button>
                  <div>
                    <h3 className="mb-0">Manual Profile Setup</h3>
                    <p className="text-muted mb-0">
                      Fill out your profile information manually
                    </p>
                  </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Formik
                  initialValues={{
                    fullName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phone: "",
                    location: "",
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    graduationYear: new Date().getFullYear(),
                    experience: "0",
                    bio: "",
                  }}
                  validate={(values) => {
                    const errors = {};
                    if (!values.fullName) errors.fullName = "Required";
                    if (!values.email) {
                      errors.email = "Required";
                    } else if (
                      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        values.email
                      )
                    ) {
                      errors.email = "Invalid email address";
                    }
                    if (!values.password) errors.password = "Required";
                    if (values.password.length < 6) {
                      errors.password =
                        "Password must be at least 6 characters";
                    }
                    if (values.password !== values.confirmPassword) {
                      errors.confirmPassword = "Passwords must match";
                    }
                    if (skills.length === 0)
                      errors.skills = "Add at least one skill";
                    return errors;
                  }}
                  onSubmit={async (values, { setSubmitting }) => {
                    setError("");

                    try {
                      const response = await fetch("/api/auth/register-form", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          ...values,
                          skills: skills,
                        }),
                      });

                      if (response.ok) {
                        const data = await response.json();

                        // Store token and redirect
                        localStorage.setItem("token", data.token);
                        router.push("/main/student/dashboard?welcome=true");
                      } else {
                        const errorData = await response.json();
                        setError(errorData.message || "Registration failed");
                      }
                    } catch (error) {
                      setError("Registration failed. Please try again.");
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
                      {/* Personal Information */}
                      <div className="mb-4">
                        <h5 className="mb-3 border-bottom pb-2">
                          Personal Information
                        </h5>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Full Name *</Form.Label>
                              <Form.Control
                                type="text"
                                name="fullName"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.fullName}
                                isInvalid={touched.fullName && errors.fullName}
                                placeholder="Enter your full name"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.fullName}
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
                                placeholder="your.email@example.com"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.email}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Password *</Form.Label>
                              <Form.Control
                                type="password"
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                                isInvalid={touched.password && errors.password}
                                placeholder="At least 6 characters"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.password}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Confirm Password *</Form.Label>
                              <Form.Control
                                type="password"
                                name="confirmPassword"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.confirmPassword}
                                isInvalid={
                                  touched.confirmPassword &&
                                  errors.confirmPassword
                                }
                                placeholder="Confirm your password"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.confirmPassword}
                              </Form.Control.Feedback>
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
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.phone}
                                placeholder="+234 800 000 0000"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Location</Form.Label>
                              <Form.Control
                                type="text"
                                name="location"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.location}
                                placeholder="e.g., Lagos, Nigeria"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>

                      {/* Education Information */}
                      <div className="mb-4">
                        <h5 className="mb-3 border-bottom pb-2">
                          Education Information
                        </h5>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Institution</Form.Label>
                              <Form.Control
                                type="text"
                                name="institution"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.institution}
                                placeholder="e.g., University of Lagos"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Degree</Form.Label>
                              <Form.Select
                                name="degree"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.degree}
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
                                <option value="B.A">
                                  Bachelor of Arts (B.A)
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
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.fieldOfStudy}
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
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.graduationYear}
                                min="2000"
                                max="2030"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>

                      {/* Skills Section */}
                      <div className="mb-4">
                        <h5 className="mb-3 border-bottom pb-2">Skills *</h5>

                        <Form.Group className="mb-3">
                          <Form.Label>Add Skills</Form.Label>
                          <div className="d-flex mb-2">
                            <Form.Control
                              type="text"
                              value={newSkill}
                              onChange={(e) => setNewSkill(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder="Add a skill (e.g., JavaScript, React)"
                            />
                            <Button
                              variant="outline-primary"
                              className="ms-2"
                              onClick={addSkill}
                              type="button"
                            >
                              <FaPlus />
                            </Button>
                          </div>
                          <Form.Text className="text-muted">
                            Press Enter or click the + button to add skills. Add
                            at least one skill.
                          </Form.Text>
                          <Form.Control.Feedback
                            type="invalid"
                            className="d-block"
                          >
                            {errors.skills}
                          </Form.Control.Feedback>
                        </Form.Group>

                        {/* Popular Skills */}
                        <div className="mb-3">
                          <Form.Label className="small text-muted">
                            Popular Skills:
                          </Form.Label>
                          <div className="d-flex flex-wrap gap-2">
                            {popularSkills.map((skill) => (
                              <Badge
                                key={skill}
                                bg="outline-secondary"
                                text="dark"
                                className="cursor-pointer"
                                style={{ cursor: "pointer" }}
                                onClick={() => addPopularSkill(skill)}
                              >
                                {skill} <FaPlus size={10} className="ms-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Selected Skills */}
                        {skills.length > 0 && (
                          <div className="mb-3">
                            <Form.Label className="small text-muted">
                              Your Skills:
                            </Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                              {skills.map((skill, index) => (
                                <Badge
                                  key={index}
                                  bg="primary"
                                  className="d-flex align-items-center"
                                >
                                  {skill}
                                  <FaTrash
                                    className="ms-2 cursor-pointer"
                                    size={12}
                                    onClick={() => removeSkill(skill)}
                                    style={{ cursor: "pointer" }}
                                  />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Experience Section */}
                      <div className="mb-4">
                        <h5 className="mb-3 border-bottom pb-2">Experience</h5>
                        <Form.Group className="mb-3">
                          <Form.Label>Years of Experience</Form.Label>
                          <Form.Select
                            name="experience"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.experience}
                          >
                            <option value="0">
                              No experience (Fresh Graduate)
                            </option>
                            <option value="1">1 year</option>
                            <option value="2">2 years</option>
                            <option value="3">3 years</option>
                            <option value="4">4 years</option>
                            <option value="5">5+ years</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Bio/Summary</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="bio"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.bio}
                            placeholder="Briefly describe your background, interests, and career goals..."
                          />
                        </Form.Group>
                      </div>

                      {/* Terms and Conditions */}
                      <Form.Group className="mb-4">
                        <Form.Check
                          type="checkbox"
                          id="terms"
                          label={
                            <span>
                              I agree to the{" "}
                              <a
                                href="/terms"
                                target="_blank"
                                className="text-decoration-none"
                              >
                                Terms of Service
                              </a>{" "}
                              and{" "}
                              <a
                                href="/privacy"
                                target="_blank"
                                className="text-decoration-none"
                              >
                                Privacy Policy
                              </a>
                            </span>
                          }
                          required
                        />
                      </Form.Group>

                      <div className="d-grid gap-2">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={isSubmitting}
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                              />
                              Creating Profile...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-2" />
                              Create Profile
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline-secondary"
                          as="a"
                          href="/student/register"
                        >
                          Back to Registration Options
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>

                {/* Security Note */}
                <div className="text-center mt-4">
                  <small className="text-muted">
                    <FaSave className="text-success me-1" />
                    Your information is secure and will be used only for job
                    matching
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
