// components/Layout.js
import { Navbar, Nav, Container } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../AuthContext/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} href="/">
            Smart Job Match
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} href="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} href="/jobs">
                Browse Jobs
              </Nav.Link>
              <Nav.Link as={Link} href="/about">
                About
              </Nav.Link>
              <Nav.Link as={Link} href="/contact">
                Contact
              </Nav.Link>
            </Nav>
            <Nav>
              {user ? (
                <>
                  <Nav.Link
                    as={Link}
                    href={
                      user.userType === "student"
                        ? "/student/dashboard"
                        : user.userType === "employer"
                        ? "/employer/dashboard"
                        : "/admin/dashboard"
                    }
                  >
                    Dashboard
                  </Nav.Link>
                  <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} href="/login">
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} href="/register">
                    Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main>{children}</main>
    </>
  );
}
