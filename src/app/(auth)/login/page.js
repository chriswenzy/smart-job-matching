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
} from "react-bootstrap";
import { Formik } from "formik";
import Link from "next/link";
import { FaSignInAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import Layout from "@/components/Layout/Layout";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext/AuthContext";

export default function Login() {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState("");
  // const { setUser } = useAuth();

  const HandleLogin = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        console.log("login user", user);
        console.log("login token", token);

        // Store token and update auth context
        localStorage.setItem("token", token);
        setUser(user);

        // Redirect based on user type
        if (user.userType === "STUDENT") {
          router.push("/main/student/dashboard");
        } else if (user.userType === "EMPLOYER") {
          router.push("/main/employer/dashboard");
        } else if (user.userType === "ADMIN") {
          router.push("/main/admin/dashboard");
        }

        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  };

  return (
    <Layout>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Welcome Back</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Formik
                  initialValues={{ email: "", password: "" }}
                  validate={(values) => {
                    const errors = {};
                    if (!values.email) {
                      errors.email = "Email is required";
                    } else if (
                      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        values.email
                      )
                    ) {
                      errors.email = "Invalid email address";
                    }
                    if (!values.password) {
                      errors.password = "Password is required";
                    } else if (values.password.length < 6) {
                      errors.password =
                        "Password must be at least 6 characters";
                    }
                    return errors;
                  }}
                  onSubmit={async (values, { setSubmitting }) => {
                    setError("");
                    const result = await HandleLogin(
                      values.email,
                      values.password
                    );
                    if (!result.success) {
                      setError(result.error);
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
                    <Form onSubmit={handleSubmit} noValidate>
                      <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                          isInvalid={touched.email && errors.email}
                          placeholder="Enter your email"
                          required
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.password}
                            isInvalid={touched.password && errors.password}
                            placeholder="Enter your password"
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ marginRight: "10px" }}
                            type="button"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {errors.password}
                          </Form.Control.Feedback>
                        </div>
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <Form.Check
                          type="checkbox"
                          id="rememberMe"
                          label="Remember me"
                        />
                        <Link
                          href="/forgot-password"
                          className="text-decoration-none small"
                        >
                          Forgot password?
                        </Link>
                      </div>

                      <div className="d-grid">
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
                                aria-hidden="true"
                              />
                              Signing in...
                            </>
                          ) : (
                            <>
                              <FaSignInAlt className="me-2" />
                              Sign In
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{" "}
                    <Link
                      href="/register"
                      className="fw-semibold text-decoration-none"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>

                {/* Demo Accounts */}
                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="small text-muted mb-2">Demo Accounts:</h6>
                  <div className="small">
                    <div>
                      <strong>Student:</strong> student@demo.com / demo123
                    </div>
                    <div>
                      <strong>Employer:</strong> employer@demo.com / demo123
                    </div>
                    <div>
                      <strong>Admin:</strong> admin@demo.com / demo123
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
