// components/PrivateLayout.js
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
  FaUserGraduate,
  FaBuilding,
  FaUserTie,
  FaSearch,
  FaPlus,
  FaList,
} from "react-icons/fa";
import { useAuth } from "../AuthContext/AuthContext";
import { useRouter } from "next/navigation";

export default function PrivateLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isActive = (path) => router.pathname === path;

  // Admin Navigation Items
  const adminNavItems = [
    {
      href: "/main/admin/dashboard",
      icon: FaHome,
      label: "Dashboard",
      badge: null,
    },
    {
      href: "/main/admin/users",
      icon: FaUsers,
      label: "Users",
      badge: null,
    },
    {
      href: "/main/admin/jobs",
      icon: FaBriefcase,
      label: "Jobs",
      // badge: "12",
    },
    {
      href: "/main/admin/applications",
      icon: FaFileAlt,
      label: "Applications",
      badge: null,
    },
    // {
    //   href: "/main/admin/analytics",
    //   icon: FaChartBar,
    //   label: "Analytics",
    //   badge: null,
    // },
    {
      href: "/main/admin/settings",
      icon: FaCog,
      label: "Settings",
      badge: null,
    },
  ];

  // Student Navigation Items
  const studentNavItems = [
    {
      href: "/main/student/dashboard",
      icon: FaHome,
      label: "Dashboard",
      badge: null,
    },
    {
      href: "/main/student/jobs",
      icon: FaSearch,
      label: "Browse Jobs",
      badge: null,
    },
    // {
    //   href: "/main/student/recommended-jobs",
    //   icon: FaBriefcase,
    //   label: "Recommended Jobs",
    //   badge: "5",
    // },
    {
      href: "/main/student/applications",
      icon: FaFileAlt,
      label: "My Applications",
      badge: null,
    },
    {
      href: "/main/student/profile",
      icon: FaUserGraduate,
      label: "My Profile",
      badge: null,
    },
    // {
    //   href: "/main/student/cv",
    //   icon: FaFileAlt,
    //   label: "CV Manager",
    //   badge: null,
    // },
  ];

  // Employer Navigation Items
  const employerNavItems = [
    {
      href: "/main/employer/dashboard",
      icon: FaHome,
      label: "Dashboard",
      badge: null,
    },
    {
      href: "/main/employer/jobs",
      icon: FaList,
      label: "My Jobs",
      badge: null,
    },
    {
      href: "/main/employer/jobs/new",
      icon: FaPlus,
      label: "Post New Job",
      badge: null,
    },
    {
      href: "/main/employer/applications",
      icon: FaFileAlt,
      label: "Applications",
      badge: null,
    },
    // {
    //   href: "/main/employer/profile",
    //   icon: FaBuilding,
    //   label: "Company Profile",
    //   badge: null,
    // },
    // {
    //   href: "/main/employer/analytics",
    //   icon: FaChartBar,
    //   label: "Analytics",
    //   badge: null,
    // },
  ];

  // Get navigation items based on user type
  const getNavItems = () => {
    switch (user?.userType) {
      case "ADMIN":
        return adminNavItems;
      case "STUDENT":
        return studentNavItems;
      case "EMPLOYER":
        return employerNavItems;
      default:
        return [];
    }
  };

  // Get dashboard title based on user type
  const getDashboardTitle = () => {
    switch (user?.userType) {
      case "ADMIN":
        return "Admin Dashboard";
      case "STUDENT":
        return "Student Dashboard";
      case "EMPLOYER":
        return "Employer Dashboard";
      default:
        return "Dashboard";
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.email) return user.email;
    return "User";
  };

  // Get user role badge
  const getUserRoleBadge = () => {
    switch (user?.userType) {
      case "ADMIN":
        return <Badge bg="danger">Admin</Badge>;
      case "STUDENT":
        return <Badge bg="primary">Student</Badge>;
      case "EMPLOYER":
        return <Badge bg="success">Employer</Badge>;
      default:
        return null;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className="bg-dark text-white"
        style={{ width: "250px", minHeight: "100vh" }}
      >
        <div className="p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <div
              className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
              style={{ width: "32px", height: "32px" }}
            >
              {user?.userType === "ADMIN" && <FaUserTie size={16} />}
              {user?.userType === "STUDENT" && <FaUserGraduate size={16} />}
              {user?.userType === "EMPLOYER" && <FaBuilding size={16} />}
            </div>
            <div>
              <h6 className="mb-0">{getDashboardTitle()}</h6>
              <small className="text-muted">Job Matching Platform</small>
            </div>
          </div>
        </div>

        <Nav className="flex-column p-3">
          {navItems.map((item) => (
            <Nav.Link
              key={item.href}
              as={Link}
              href={item.href}
              className={`text-white mb-2 d-flex align-items-center ${
                isActive(item.href) ? "bg-primary rounded" : "hover-bg-light"
              }`}
              style={{
                transition: "all 0.2s",
                padding: "8px 12px",
                borderRadius: "4px",
              }}
            >
              <item.icon className="me-2" />
              <span className="flex-grow-1">{item.label}</span>
              {item.badge && (
                <Badge bg="warning" className="ms-2">
                  {item.badge}
                </Badge>
              )}
            </Nav.Link>
          ))}

          <hr className="text-muted my-3" />

          <Nav.Link
            onClick={handleLogout}
            className="text-white mb-2 d-flex align-items-center"
            style={{
              cursor: "pointer",
              transition: "all 0.2s",
              padding: "8px 12px",
              borderRadius: "4px",
            }}
          >
            <FaSignOutAlt className="me-2" />
            Logout
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Top Navigation */}
        <Navbar bg="white" variant="light" className="border-bottom shadow-sm">
          <Container fluid>
            <Navbar.Brand className="fw-bold text-primary">
              {getDashboardTitle()}
            </Navbar.Brand>
            <Navbar.Text className="ms-auto d-flex align-items-center">
              <span className="me-2">
                Welcome, <strong>{getUserDisplayName()}</strong>
              </span>
              {getUserRoleBadge()}
            </Navbar.Text>
          </Container>
        </Navbar>

        {/* Page Content */}
        <main
          style={{
            minHeight: "calc(100vh - 56px)",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Container fluid className="py-4">
            {children}
          </Container>
        </main>
      </div>

      <style jsx>{`
        .hover-bg-light:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
