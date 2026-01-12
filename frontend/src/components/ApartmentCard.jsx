import React from "react";

const ApartmentCard = ({ apartment }) => {
  const statusColor = apartment.status === "rented" ? "#16a34a" : "#d97706";
  const badge = apartment.area || apartment.city || apartment.region;

  return (
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700 }}>{apartment.title || apartment.address || "Ακίνητο"}</div>
          <div className="muted">{apartment.address}</div>
          {badge && <div className="pill" style={{ marginTop: 6 }}>{badge}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div>{apartment.square_meters} τ.μ.</div>
          <div>Όροφος: {apartment.floor || "-"}</div>
          <div style={{ color: statusColor }}>{apartment.status}</div>
        </div>
      </div>
    </div>
  );
};

export default ApartmentCard;
