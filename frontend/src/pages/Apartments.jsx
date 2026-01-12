import { useEffect, useState } from "react";
import api, { extractData } from "../services/api";
import ApartmentCard from "../components/ApartmentCard";
import { Link } from "react-router-dom";
import MapView from "../components/MapView";
import { useAuth } from "../auth/AuthContext";

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [grouped, setGrouped] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    api.get("apartments/")
      .then(res => setApartments(extractData(res.data)))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const byArea = apartments.reduce((acc, ap) => {
      const group = ap.area || ap.city || ap.region || "Λοιπά";
      if (!acc[group]) acc[group] = [];
      acc[group].push(ap);
      return acc;
    }, {});
    setGrouped(byArea);
  }, [apartments]);

  if (user?.role === "accountant") {
    return <div className="page-content">Πρόσβαση μόνο ανάγνωσης: δεν εμφανίζονται ακίνητα για λογιστές.</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Ακίνητα</h1>
          <div className="muted">Λίστα όλων των ακινήτων</div>
        </div>
      </div>

      <MapView apartments={apartments} />

      {apartments.length === 0 && <div className="muted">Δεν βρέθηκαν ακίνητα.</div>}

      {Object.entries(grouped).map(([group, list]) => (
        <div key={group} style={{ marginBottom: 18 }}>
          <div className="pill" style={{ marginBottom: 8 }}>{group}</div>
          <div className="list-grid">
            {list.map((a) => (
              <Link key={a.id} to={`/apartments/${a.id}`}>
                <ApartmentCard apartment={a} />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Apartments;
