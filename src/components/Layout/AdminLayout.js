// components/AdminLayout.js
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import Link from "next/link";
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../AuthContext/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (path) => router.pathname === path;

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="bg-dark text-white"
        style={{ width: "250px", minHeight: "100vh" }}
      >
        <div className="p-3 border-bottom">
          <h5 className="mb-0">Admin Panel</h5>
          <small className="text-muted">Job Matching Platform</small>
        </div>

        <Nav className="flex-column p-3">
          <Nav.Link
            as={Link}
            href="/main/admin/dashboard"
            className={`text-white mb-2 ${
              isActive("/main/admin/dashboard") ? "bg-primary rounded" : ""
            }`}
          >
            <FaHome className="me-2" />
            Dashboard
          </Nav.Link>

          <Nav.Link
            as={Link}
            href="/main/admin/users"
            className={`text-white mb-2 ${
              isActive("/main/admin/users") ? "bg-primary rounded" : ""
            }`}
          >
            <FaUsers className="me-2" />
            Users
          </Nav.Link>

          <Nav.Link
            as={Link}
            href="/main/admin/jobs"
            className={`text-white mb-2 ${
              isActive("/main/admin/jobs") ? "bg-primary rounded" : ""
            }`}
          >
            <FaBriefcase className="me-2" />
            Jobs
            <Badge bg="warning" className="ms-2">
              12
            </Badge>
          </Nav.Link>

          <Nav.Link
            as={Link}
            href="/main/admin/applications"
            className={`text-white mb-2 ${
              isActive("/main/admin/applications") ? "bg-primary rounded" : ""
            }`}
          >
            <FaFileAlt className="me-2" />
            Applications
          </Nav.Link>

          <Nav.Link
            as={Link}
            href="/main/admin/analytics"
            className={`text-white mb-2 ${
              isActive("/main/admin/analytics") ? "bg-primary rounded" : ""
            }`}
          >
            <FaChartBar className="me-2" />
            Analytics
          </Nav.Link>

          <Nav.Link
            as={Link}
            href="/main/admin/settings"
            className={`text-white mb-2 ${
              isActive("/main/admin/settings") ? "bg-primary rounded" : ""
            }`}
          >
            <FaCog className="me-2" />
            Settings
          </Nav.Link>

          <hr className="text-muted my-3" />

          <Nav.Link onClick={handleLogout} className="text-white mb-2">
            <FaSignOutAlt className="me-2" />
            Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Top Navigation */}
        <Navbar bg="light" variant="light" className="border-bottom">
          <Container fluid>
            <Navbar.Brand>Admin Dashboard</Navbar.Brand>
            <Navbar.Text className="ms-auto">
              Signed in as: <strong>{user?.email}</strong>
            </Navbar.Text>
          </Container>
        </Navbar>

        {/* Page Content */}
        <main style={{ minHeight: "calc(100vh - 56px)" }} className="bg-light">
          {children}
        </main>
      </div>
    </div>
  );
}
