import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";

const Manager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  const getMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/members", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      console.log("Tipo di contenuto:", response.headers.get("Content-Type"));
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Errore nel caricamento dei membri");
      }

      const data = await response.json();
      console.log(data);

      setMembers(data);
    } catch (error) {
      setError(error.message);
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
      className="mx-auto text-center"
    >
      {/* Mostra un messaggio di caricamento mentre i membri sono in fase di recupero */}
      {loading && <p>Loading...</p>}

      {/* Mostra un messaggio di errore se c'è un problema nella fetch */}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {/* Renderizza i membri solo se ci sono */}
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
            {/* Mappa i membri, escluso il primo indice (index > 1) */}
            {members
              .filter((member, index) => index > 0)
              .map((member) => (
                <tr key={member.id}>
                  <td>{member.id}</td>
                  <td>{member.username}</td>
                  <td>{member.email}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      ) : (
        <p>No members to display.</p>
      )}
    </div>
  );
};

export default Manager;
