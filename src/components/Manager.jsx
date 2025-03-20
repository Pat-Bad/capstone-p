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

      if (response.status === 500) {
        throw new Error(
          "Accesso negato: devi essere un amministratore per vedere il contenuto di questa pagina."
        );
      }

      if (!response.ok) {
        const contentType = response.headers.get("Content-Type");
        let errorMessage = `Errore ${response.status}: ${response.statusText}`;

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          errorMessage = data.message || "Errore nel caricamento dei membri";
        } else {
          errorMessage = await response.text(); // Legge l'errore come testo
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
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
      className="text-center mx-auto"
    >
      {/* Mostra un messaggio di caricamento mentre i membri sono in fase di recupero */}
      {loading && <p>Loading...</p>}

      {/* Mostra un messaggio di errore se c'è un problema nella fetch */}
      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

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
        <p>Nothing to see here.</p>
      )}
    </div>
  );
};

export default Manager;
