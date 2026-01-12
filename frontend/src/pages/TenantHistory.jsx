import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TenantHistory() {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, current, past
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApartment, setSelectedApartment] = useState('');

  useEffect(() => {
    const fetchTenantHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/tenant-history/summary/');
        setHistoryData(response.data);
      } catch (err) {
        console.error('Error fetching tenant history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantHistory();
  }, []);

  const filteredTenants = historyData?.tenants?.filter(tenant => {
    const statusLower = tenant.status?.toLowerCase() || '';
    const matchesFilter = filter === 'all' || statusLower === filter;
    const matchesSearch = tenant.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesApartment = !selectedApartment || tenant.apartment_id === parseInt(selectedApartment);
    return matchesFilter && matchesSearch && matchesApartment;
  }) || [];

  const apartments = [...new Set(historyData?.tenants?.map(t => ({ id: t.apartment_id, title: t.apartment })))];

  if (loading) {
    return <div className="page-content">Loading tenant history...</div>;
  }

  return (
    <div className="page-content">
      <div className="tenant-history-page">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>📜 Ιστορικό Ενοικιαστών</h1>
            <p className="muted">Πλήρης ιστορία όλων των ενοικιαστών, συμβολαίων και πληρωμών</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Συνολικοί Ενοικιαστές</div>
            <div className="stat-value">{historyData?.total_tenants}</div>
            <div className="stat-subtext">
              <span className="accent">{historyData?.current_tenants}</span> ενεργοί,{' '}
              <span className="muted">{historyData?.past_tenants}</span> παλιοί
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Συνολικές Πληρωμές</div>
            <div className="stat-value">€{(historyData?.total_payments_received || 0).toFixed(2)}</div>
            <div className="stat-subtext">Καταβληθείσες</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Εκκρεμείς Πληρωμές</div>
            <div className="stat-value">€{(historyData?.pending_payments || 0).toFixed(2)}</div>
            <div className="stat-subtext">Προς Είσπραξη</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Μηνιαίο Ενοίκιο</div>
            <div className="stat-value">€{(historyData?.total_rent_collected || 0).toFixed(2)}</div>
            <div className="stat-subtext">Ενεργών Συμβολαίων</div>
          </div>
        </div>

        {/* Filters */}
        <div className="history-filters">
          <div className="filter-group">
            <label>Κατάσταση</label>
            <div className="filter-buttons">
              {['all', 'current', 'past'].map(f => (
                <button
                  key={f}
                  className={`button ${filter === f ? 'primary' : 'ghost'}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? '📋 Όλοι' : f === 'current' ? '✅ Ενεργοί' : '📝 Παλιοί'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Αναζήτηση Ενοικιαστή</label>
            <input
              type="text"
              placeholder="Όνομα ενοικιαστή..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Ακίνητο</label>
            <select
              value={selectedApartment}
              onChange={e => setSelectedApartment(e.target.value)}
            >
              <option value="">Όλα τα ακίνητα</option>
              {apartments.map(apt => (
                <option key={apt.id} value={apt.id}>{apt.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tenant History Timeline */}
        {filteredTenants.length > 0 ? (
          <div className="tenants-timeline">
            {filteredTenants.map(tenant => (
              <div key={tenant.id} className={`tenant-history-card tenant-status-${tenant.status.toLowerCase()}`}>
                <div className="tenant-history-header">
                  <div className="tenant-info-main">
                    <h3 className="tenant-name">{tenant.full_name}</h3>
                    <div className="tenant-meta">
                      <span className="meta-item">📍 {tenant.apartment}</span>
                      {tenant.email && <span className="meta-item">📧 {tenant.email}</span>}
                      {tenant.phone && <span className="meta-item">📱 {tenant.phone}</span>}
                    </div>
                  </div>
                  <div className={`status-badge status-${tenant.status.toLowerCase()}`}>
                    {tenant.status === 'Current' ? '✅ Ενεργός' : '📝 Παλιός'}
                  </div>
                </div>

                {/* Contract Details */}
                <div className="contract-details">
                  <div className="detail-box">
                    <span className="detail-label">Έναρξη Συμβολαίου</span>
                    <span className="detail-value">{new Date(tenant.contract_start).toLocaleDateString('el-GR')}</span>
                  </div>
                  {tenant.contract_end && (
                    <div className="detail-box">
                      <span className="detail-label">Λήξη Συμβολαίου</span>
                      <span className="detail-value">{new Date(tenant.contract_end).toLocaleDateString('el-GR')}</span>
                    </div>
                  )}
                  <div className="detail-box">
                    <span className="detail-label">Μηνιαίο Ενοίκιο</span>
                    <span className="detail-value accent">€{tenant.monthly_rent.toFixed(2)}</span>
                  </div>
                  {tenant.deposit > 0 && (
                    <div className="detail-box">
                      <span className="detail-label">Κατάθεση</span>
                      <span className="detail-value">€{tenant.deposit.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="payment-summary">
                  <div className="summary-stat">
                    <span className="summary-label">Συνολικές Πληρωμές</span>
                    <span className="summary-value">{tenant.total_payments}</span>
                  </div>
                  <div className="summary-stat paid">
                    <span className="summary-label">Καταβληθείσες</span>
                    <span className="summary-value">{tenant.paid_count}</span>
                  </div>
                  <div className="summary-stat unpaid">
                    <span className="summary-label">Εκκρεμείς</span>
                    <span className="summary-value">{tenant.unpaid_count}</span>
                  </div>
                  <div className="summary-stat amount">
                    <span className="summary-label">Σύνολο Πληρώθηκε</span>
                    <span className="summary-value">€{tenant.total_paid.toFixed(2)}</span>
                  </div>
                  <div className="summary-stat amount pending">
                    <span className="summary-label">Σύνολο Οφείλεται</span>
                    <span className="summary-value">€{tenant.total_unpaid.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>❌ Κανένας ενοικιαστής με αυτά τα κριτήρια</p>
          </div>
        )}
      </div>
    </div>
  );
}
