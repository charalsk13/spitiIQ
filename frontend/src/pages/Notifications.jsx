import { useState, useEffect } from "react";
import api, { extractData } from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("unread");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("notifications/");
      setNotifications(extractData(res.data));
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await api.post(`notifications/${notifId}/mark_as_read/`);
      loadNotifications();
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Είσαι σίγουρος;")) {
      try {
        for (const notif of notifications.filter((n) => !n.is_read)) {
          await api.post(`notifications/${notif.id}/mark_as_read/`);
        }
        loadNotifications();
      } catch (err) {
        console.error("Error clearing notifications:", err);
      }
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const typeIcons = {
    overdue_payment: "⚠️",
    contract_ending: "📅",
    contract_starting: "✅",
    payment_due: "💰",
    payment_received: "✔️",
    other: "📌",
  };

  const typeLabels = {
    overdue_payment: "Ληξιπρόθεσμη Πληρωμή",
    contract_ending: "Λήξη Συμβολαίου",
    contract_starting: "Έναρξη Συμβολαίου",
    payment_due: "Πληρωμή Ληξιμότητας",
    payment_received: "Ενοίκιο Λήφθηκε",
    other: "Άλλο",
  };

  if (loading) return <div className="page">Φόρτωση...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔔 Ειδοποιήσεις</h1>
        {notifications.filter((n) => !n.is_read).length > 0 && (
          <button className="button" onClick={handleClearAll}>
            Σημείωση ως Διαβασμένα
          </button>
        )}
      </div>

      <div className="filter-bar" style={{ marginBottom: "1.5rem" }}>
        <button
          className={`button ${filter === "unread" ? "primary" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Αδιάβαστα ({notifications.filter((n) => !n.is_read).length})
        </button>
        <button
          className={`button ${filter === "read" ? "primary" : ""}`}
          onClick={() => setFilter("read")}
        >
          Διαβασμένα ({notifications.filter((n) => n.is_read).length})
        </button>
        <button
          className={`button ${filter === "all" ? "primary" : ""}`}
          onClick={() => setFilter("all")}
        >
          Όλα ({notifications.length})
        </button>
      </div>

      {filteredNotifs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p className="muted">
            {filter === "unread"
              ? "Δεν έχεις αδιάβαστες ειδοποιήσεις"
              : "Δεν υπάρχουν ειδοποιήσεις"}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                opacity: notif.is_read ? 0.6 : 1,
                borderLeft: notif.is_read ? "none" : "4px solid var(--accent)",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginTop: 0 }}>
                    {typeIcons[notif.notification_type] || "📌"}{" "}
                    {notif.title}
                  </h3>
                  <p>{notif.message}</p>
                  <p className="muted text-sm">
                    {typeLabels[notif.notification_type]} •{" "}
                    {new Date(notif.created_at).toLocaleDateString("el-GR")}{" "}
                    {new Date(notif.created_at).toLocaleTimeString("el-GR")}
                  </p>
                </div>
                {!notif.is_read && (
                  <button
                    className="button"
                    onClick={() => handleMarkAsRead(notif.id)}
                    style={{ marginLeft: "1rem", whiteSpace: "nowrap" }}
                  >
                    ✓ Διάβασμα
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
