import { useEffect, useState } from "react";
import { Spinner, Table } from "react-bootstrap";

const Manager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const getMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://patprojects-1c802b2b.koyeb.app/api/auth/members",

        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 500 || response.status === 403) {
        setError(true);
        throw new Error("You are not authorized to access this resource.");
      } else if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  return (
    <div
      style={{ overflowX: "auto", maxWidth: "50%" }}
      className="text-center mx-auto"
    >
      {loading && (
        <Spinner
          animation="border"
          variant="primary"
        />
      )}

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError(false)}
          dismissible
        >
          Whoops, something went wrong. Please try again.
        </Alert>
      )}

      {members.length > 0 ? (
        <Table
          striped
          bordered
          hover
          style={{
            backgroundColor: "rgba(38, 155, 197, 0.57)",
          }}
        >
          <thead
            className="border border-3"
            style={{ backgroundColor: "#A2A3C3" }}
          >
            <tr>
              <th
                className="text-center"
                style={{ minWidth: "30px" }}
              >
                Id
              </th>
              <th
                className="text-center"
                style={{ minWidth: "150px" }}
              >
                Username
              </th>
              <th
                className="text-center"
                style={{ minWidth: "250px" }}
              >
                Email
              </th>
            </tr>
          </thead>
          <tbody className="border border-3">
            {/* Mappa i membri, escluso il primo indice (index > 1 (perché nel db i primi due sono "fittizi")) */}
            {members.slice(1).map((member) => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.username}</td>
                <td>{member.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>Nothing to see here.</p>
      )}
    </div>
  );
};

export default Manager;
