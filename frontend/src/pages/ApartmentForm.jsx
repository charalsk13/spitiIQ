import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { postForm, putForm } from "../services/api";
import { useAuth } from "../auth/AuthContext";

const ApartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    address: "",
    square_meters: "",
    floor: "",
    year_built: "",
    status: "vacant",
    notes: "",
    property_type: "apartment",
    area: "",
    city: "",
    region: "",
    lat: "",
    lng: "",
    owner: "",
  });
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [ownerOptions, setOwnerOptions] = useState([]);

  useEffect(() => {
    if (user?.role === "accountant" || user?.role === "admin") {
      api
        .get("accountant-owners/")
        .then((res) => {
          const owners = res.data.map((o) => ({ id: o.owner, name: o.owner_username }));
          setOwnerOptions(owners);
          if (!form.owner && owners.length > 0) {
            setForm((prev) => ({ ...prev, owner: owners[0].id }));
          }
        })
        .catch((err) => console.error("Error loading owners", err));
    }

    if (!id) return;
    api
      .get(`apartments/${id}/`)
      .then((res) => {
        const ap = res.data;
        setForm({
          title: ap.title || "",
          address: ap.address || "",
          square_meters: ap.square_meters || "",
          floor: ap.floor || "",
          year_built: ap.year_built || "",
          status: ap.status || "vacant",
          notes: ap.notes || "",
          property_type: ap.property_type || "apartment",
          area: ap.area || "",
          city: ap.city || "",
          region: ap.region || "",
          lat: ap.lat || "",
          lng: ap.lng || "",
        });
      })
      .catch((err) => {
        console.error(err);
        setGeneralError("Αδυναμία φόρτωσης διαμερίσματος");
      });
  }, [id]);

  if (user?.role === "accountant") {
    return <div className="page-content">Οι λογιστές έχουν μόνο ανάγνωση για τα ακίνητα.</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFiles = (e) => {
    setPhotos(Array.from(e.target.files));
    setErrors((prev) => ({ ...prev, photos: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError("");

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== null) payload.append(k, v);
    });

    // For accountants/admins on create, include owner selection
    if (!isEdit && (user?.role === "accountant" || user?.role === "admin")) {
      const selectedOwner = form.owner || ownerOptions[0]?.id;
      if (selectedOwner) {
        payload.append("owner", selectedOwner);
      }
    }

    try {
      if (isEdit) {
        await putForm(`apartments/${id}/`, payload);
      } else {
        await postForm("apartments/", payload);
      }
      navigate("/apartments");
    } catch (err) {
      const resp = err?.response;
      if (resp && resp.data) {
        const data = resp.data;
        const newErrors = {};
        Object.keys(data).forEach((key) => {
          const val = data[key];
          if (Array.isArray(val)) newErrors[key] = val.join(" ");
          else if (typeof val === "object") newErrors[key] = JSON.stringify(val);
          else newErrors[key] = String(val);
        });
        setErrors(newErrors);
        if (newErrors.non_field_errors) setGeneralError(newErrors.non_field_errors);
      } else {
        setGeneralError("Σφάλμα δικτύου ή άγνωστο σφάλμα.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldErrorStyle = (field) =>
    errors[field] ? { borderColor: "#d00", outline: "none" } : {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEdit ? "Επεξεργασία Διαμερίσματος" : "Νέο Διαμέρισμα"}</h1>
          <div className="muted">Συμπληρώστε τα στοιχεία και αποθηκεύστε</div>
        </div>
      </div>

      {generalError && (
        <div className="alert error">{generalError}</div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 720 }} noValidate>
        {!isEdit && (user?.role === "accountant" || user?.role === "admin") && (
          <div className="field">
            <label>Ιδιοκτήτης</label>
            <select
              name="owner"
              value={form.owner}
              onChange={handleChange}
              required
            >
              <option value="">-- Επιλογή ιδιοκτήτη --</option>
              {ownerOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            {errors.owner && <div className="error-text">{errors.owner}</div>}
          </div>
        )}

        <div className="field">
          <label>Τίτλος</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={fieldErrorStyle("title")}
          />
          {errors.title && <div className="error-text">{errors.title}</div>}
        </div>

        <div className="field">
          <label>Διεύθυνση</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            style={fieldErrorStyle("address")}
          />
          {errors.address && <div className="error-text">{errors.address}</div>}
        </div>

        <div className="detail-grid">
          <div className="field">
            <label>Τετραγωνικά</label>
            <input
              name="square_meters"
              value={form.square_meters}
              onChange={handleChange}
              style={fieldErrorStyle("square_meters")}
            />
            {errors.square_meters && (
              <div className="error-text">{errors.square_meters}</div>
            )}
          </div>
          <div className="field">
            <label>Όροφος</label>
            <input
              name="floor"
              value={form.floor}
              onChange={handleChange}
              style={fieldErrorStyle("floor")}
            />
            {errors.floor && <div className="error-text">{errors.floor}</div>}
          </div>
          <div className="field">
            <label>Έτος</label>
            <input
              name="year_built"
              value={form.year_built}
              onChange={handleChange}
              style={fieldErrorStyle("year_built")}
            />
            {errors.year_built && <div className="error-text">{errors.year_built}</div>}
          </div>
        </div>

        <div className="field">
          <label>Τύπος ακινήτου</label>
          <select
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            style={fieldErrorStyle("property_type")}
          >
            <option value="apartment">Διαμέρισμα</option>
            <option value="house">Σπίτι</option>
            <option value="detached">Μονοκατοικία</option>
            <option value="office">Γραφείο</option>
            <option value="land">Οικόπεδο</option>
          </select>
          {errors.property_type && <div className="error-text">{errors.property_type}</div>}
        </div>

        <div className="field">
          <label>Περιοχή / Area</label>
          <input
            name="area"
            value={form.area}
            onChange={handleChange}
            style={fieldErrorStyle("area")}
          />
          {errors.area && <div className="error-text">{errors.area}</div>}
        </div>

        <div className="field">
          <label>Πόλη</label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            style={fieldErrorStyle("city")}
          />
          {errors.city && <div className="error-text">{errors.city}</div>}
        </div>

        <div className="field">
          <label>Περιφέρεια</label>
          <input
            name="region"
            value={form.region}
            onChange={handleChange}
            style={fieldErrorStyle("region")}
          />
          {errors.region && <div className="error-text">{errors.region}</div>}
        </div>

        <div className="detail-grid">
          <div className="field">
            <label>Κατάσταση</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={fieldErrorStyle("status")}
            >
              <option value="vacant">Κενό</option>
              <option value="rented">Ενοικιασμένο</option>
              <option value="maintenance">Συντήρηση</option>
            </select>
            {errors.status && <div className="error-text">{errors.status}</div>}
          </div>
          <div className="field">
            <label>Latitude</label>
            <input
              name="lat"
              value={form.lat}
              onChange={handleChange}
              style={fieldErrorStyle("lat")}
            />
            {errors.lat && <div className="error-text">{errors.lat}</div>}
          </div>
          <div className="field">
            <label>Longitude</label>
            <input
              name="lng"
              value={form.lng}
              onChange={handleChange}
              style={fieldErrorStyle("lng")}
            />
            {errors.lng && <div className="error-text">{errors.lng}</div>}
          </div>
        </div>

        <div className="field">
          <label>Σημειώσεις</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            style={fieldErrorStyle("notes")}
          />
          {errors.notes && <div className="error-text">{errors.notes}</div>}
        </div>

        <div className="field">
          <label>Φωτογραφίες</label>
          <input type="file" multiple accept="image/*" onChange={handleFiles} />
          {errors.photos && <div className="error-text">{errors.photos}</div>}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Αποθήκευση..." : "Αποθήκευση"}
          </button>
          <button className="button" type="button" onClick={() => navigate(-1)}>
            Άκυρο
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApartmentForm;
