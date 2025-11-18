"use client";
import AdminLayout from "@/components/Layout/AdminLayout";
import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, userTypeFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (userTypeFilter !== "all") {
      filtered = filtered.filter((user) => user.userType === userTypeFilter);
    }

    setFilteredUsers(filtered);
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case "STUDENT":
        return <FaUser className="text-primary" />;
      case "EMPLOYER":
        return <FaUserTie className="text-success" />;
      case "ADMIN":
        return <FaShield className="text-warning" />;
      default:
        return <FaUser className="text-secondary" />;
    }
  };

  const getUserTypeBadge = (userType) => {
    const variants = {
      STUDENT: "primary",
      EMPLOYER: "success",
      ADMIN: "warning",
    };
    return variants[userType] || "secondary";
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting user:", error);
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
            <h2>Users Management</h2>
            <p className="text-muted">Manage all users in the system</p>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <Row>
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="STUDENT">Students</option>
                  <option value="EMPLOYER">Employers</option>
                  <option value="ADMIN">Admins</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <div className="d-grid">
                  <Button variant="primary">Export Users</Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white">
            <h5 className="mb-0">Users ({filteredUsers.length})</h5>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-3">
                            {getUserTypeIcon(user.userType)}
                          </div>
                          <div>
                            <div className="fw-semibold">
                              {user.fullName || "N/A"}
                            </div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg={getUserTypeBadge(user.userType)}>
                          {user.userType}
                        </Badge>
                      </td>
                      <td>{user.location || "N/A"}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Badge bg="success">Active</Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewUserDetails(user)}
                          >
                            <FaEye />
                          </Button>
                          <Button variant="outline-warning" size="sm">
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))} */}
                </tbody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">No users found</p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* User Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <Row>
                <Col md={6}>
                  <h6>Basic Information</h6>
                  <p>
                    <strong>Name:</strong> {selectedUser.fullName || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedUser.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedUser.location || "N/A"}
                  </p>
                  <p>
                    <strong>User Type:</strong>
                    <Badge
                      bg={getUserTypeBadge(selectedUser.userType)}
                      className="ms-2"
                    >
                      {selectedUser.userType}
                    </Badge>
                  </p>
                </Col>
                <Col md={6}>
                  <h6>Account Information</h6>
                  <p>
                    <strong>Joined:</strong>{" "}
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(selectedUser.updatedAt).toLocaleString()}
                  </p>

                  {selectedUser.studentProfile && (
                    <>
                      <hr />
                      <h6>Student Profile</h6>
                      <p>
                        <strong>Institution:</strong>{" "}
                        {selectedUser.studentProfile.institution || "N/A"}
                      </p>
                      <p>
                        <strong>Degree:</strong>{" "}
                        {selectedUser.studentProfile.degree || "N/A"}
                      </p>
                      <p>
                        <strong>Skills:</strong>{" "}
                        {selectedUser.studentProfile.skills?.join(", ") ||
                          "N/A"}
                      </p>
                    </>
                  )}

                  {selectedUser.employerProfile && (
                    <>
                      <hr />
                      <h6>Employer Profile</h6>
                      <p>
                        <strong>Company:</strong>{" "}
                        {selectedUser.employerProfile.companyName || "N/A"}
                      </p>
                      <p>
                        <strong>Industry:</strong>{" "}
                        {selectedUser.employerProfile.industry || "N/A"}
                      </p>
                    </>
                  )}
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </AdminLayout>
  );
}
