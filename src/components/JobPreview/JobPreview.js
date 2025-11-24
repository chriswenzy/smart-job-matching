// components/JobPreview.js
import { Card, Badge } from "react-bootstrap";
import { FaMapMarkerAlt, FaClock, FaMoneyBillWave } from "react-icons/fa";

export default function JobPreview({ job }) {
  if (!job) return null;

  const getJobTypeBadge = (type) => {
    const variants = {
      FULL_TIME: "primary",
      PART_TIME: "success",
      INTERNSHIP: "warning",
      CONTRACT: "info",
      REMOTE: "secondary",
    };
    return variants[type] || "secondary";
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="card-title mb-1">{job.title}</h5>
            <p className="text-muted mb-0">{job.companyName}</p>
          </div>
          <Badge bg={getJobTypeBadge(job.jobType)}>
            {job.jobType.replace("_", " ")}
          </Badge>
        </div>

        <div className="mb-3">
          <small className="text-muted d-flex align-items-center mb-1">
            <FaMapMarkerAlt className="me-2" />
            {job.location}
          </small>
          {job.salaryRange && (
            <small className="text-muted d-flex align-items-center mb-1">
              <FaMoneyBillWave className="me-2" />
              {job.salaryRange}
            </small>
          )}
          {job.applicationDeadline && (
            <small className="text-muted d-flex align-items-center">
              <FaClock className="me-2" />
              Apply by {new Date(job.applicationDeadline).toLocaleDateString()}
            </small>
          )}
        </div>

        <p className="card-text small">
          {job.description.length > 150
            ? `${job.description.substring(0, 150)}...`
            : job.description}
        </p>

        {job.industry && (
          <div className="mt-2">
            <Badge bg="outline-secondary" className="me-1">
              {job.industry}
            </Badge>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
