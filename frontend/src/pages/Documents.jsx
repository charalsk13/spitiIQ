import { useState, useEffect } from "react";
import api, { extractData } from "../services/api";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    document_type: "other",
    description: "",
    tenant: null,
    apartment: null,
    file: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsRes, tenantsRes, apartsRes] = await Promise.all([
        api.get("documents/"),
        api.get("tenants/"),
        api.get("apartments/"),
      ]);
      setDocuments(extractData(docsRes.data));
      setTenants(extractData(tenantsRes.data));
      setApartments(extractData(apartsRes.data));
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadData({
      ...uploadData,
      file: e.target.files[0],
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title) {
      alert("Όνομα αρχείου και αρχείο είναι υποχρεωτικά");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", uploadData.title);
      formData.append("document_type", uploadData.document_type);
      formData.append("description", uploadData.description);
      if (uploadData.tenant) formData.append("tenant", uploadData.tenant);
      if (uploadData.apartment) formData.append("apartment", uploadData.apartment);
      formData.append("file", uploadData.file);

      await api.post("documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadData({
        title: "",
        document_type: "other",
        description: "",
        tenant: null,
        apartment: null,
        file: null,
      });
      setShowUpload(false);
      loadData();
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Σφάλμα κατά το upload");
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (filter === "all") return true;
    return doc.document_type === filter;
  });

  const docTypeLabels = {
    contract: "Σύμβολαιο",
    receipt: "Απόδειξη",
    insurance: "Ασφάλεια",
    other: "Άλλο",
  };

  if (loading) return <div className="page">Φόρτωση...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>📄 Έγγραφα</h1>
        <button
          className="button primary"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? "Ακύρωση" : "+ Νέο Έγγραφο"}
        </button>
      </div>

      {showUpload && (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <h2>Ανέβασμα Εγγράφου</h2>
          <form onSubmit={handleUpload}>
            <div className="form-section">
              <label>Όνομα Εγγράφου *</label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) =>
                  setUploadData({ ...uploadData, title: e.target.value })
                }
                placeholder="π.χ. Σύμβολαιο Μαρίας Παπαδοπούλου"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-section">
                <label>Τύπος Εγγράφου</label>
                <select
                  value={uploadData.document_type}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, document_type: e.target.value })
                  }
                >
                  <option value="contract">Σύμβολαιο</option>
                  <option value="receipt">Απόδειξη</option>
                  <option value="insurance">Ασφάλεια</option>
                  <option value="other">Άλλο</option>
                </select>
              </div>

              <div className="form-section">
                <label>Ενοικιαστής</label>
                <select
                  value={uploadData.tenant || ""}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, tenant: e.target.value || null })
                  }
                >
                  <option value="">Επιλογή...</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label>Ακίνητο</label>
                <select
                  value={uploadData.apartment || ""}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, apartment: e.target.value || null })
                  }
                >
                  <option value="">Επιλογή...</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section">
              <label>Περιγραφή</label>
              <textarea
                value={uploadData.description}
                onChange={(e) =>
                  setUploadData({ ...uploadData, description: e.target.value })
                }
                placeholder="Προαιρετικές σημειώσεις..."
                rows="3"
              />
            </div>

            <div className="form-section">
              <label>Αρχείο *</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                style={{
                  padding: "10px",
                  border: "2px dashed var(--border)",
                  borderRadius: "8px",
                }}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="button primary">
                Ανέβασμα
              </button>
              <button
                type="button"
                className="button"
                onClick={() => setShowUpload(false)}
              >
                Ακύρωση
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar" style={{ marginBottom: "1.5rem" }}>
        <button
          className={`button ${filter === "all" ? "primary" : ""}`}
          onClick={() => setFilter("all")}
        >
          Όλα ({documents.length})
        </button>
        <button
          className={`button ${filter === "contract" ? "primary" : ""}`}
          onClick={() => setFilter("contract")}
        >
          Σύμβολαια ({documents.filter((d) => d.document_type === "contract").length})
        </button>
        <button
          className={`button ${filter === "receipt" ? "primary" : ""}`}
          onClick={() => setFilter("receipt")}
        >
          Αποδείξεις ({documents.filter((d) => d.document_type === "receipt").length})
        </button>
        <button
          className={`button ${filter === "insurance" ? "primary" : ""}`}
          onClick={() => setFilter("insurance")}
        >
          Ασφάλειες ({documents.filter((d) => d.document_type === "insurance").length})
        </button>
      </div>

      <div className="documents-grid">
        {filteredDocs.length === 0 ? (
          <p className="muted">Δεν υπάρχουν έγγραφα</p>
        ) : (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="document-card card">
              <div className="doc-header">
                <h3>{doc.title}</h3>
                <span className="badge">{docTypeLabels[doc.document_type]}</span>
              </div>
              {doc.description && <p className="muted">{doc.description}</p>}
              <div className="doc-info">
                {doc.tenant_name && <p>👤 {doc.tenant_name}</p>}
                {doc.apartment_title && <p>🏠 {doc.apartment_title}</p>}
                <p className="muted text-sm">
                  📅 {new Date(doc.uploaded_at).toLocaleDateString("el-GR")}
                </p>
              </div>
              <a
                href={doc.file}
                target="_blank"
                rel="noopener noreferrer"
                className="button primary"
                style={{ marginTop: "1rem" }}
              >
                ⬇️ Λήψη
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
