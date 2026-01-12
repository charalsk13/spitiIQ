import { Link } from "react-router-dom";
import "../styles/landing.css";

export default function Landing() {
  const features = [
    {
      icon: "🏠",
      title: "Διαχείριση Ακινήτων",
      description: "Manage all your properties in one place with detailed information about location, status, and more."
    },
    {
      icon: "👥",
      title: "Ενοικιαστές & Συμβόλαια",
      description: "Track all your tenants, contracts, and rental agreements with complete information and timelines."
    },
    {
      icon: "💰",
      title: "Ενοίκια & Πληρωμές",
      description: "Auto-generate monthly rent payments and track paid/unpaid status with overdue indicators."
    },
    {
      icon: "📊",
      title: "Dashboard Analytics",
      description: "Real-time overview of your properties, income, and rental status with monthly/yearly statistics."
    },
    {
      icon: "🗺️",
      title: "Χάρτης Ακινήτων",
      description: "Visualize your properties on an interactive map, grouped by area and location."
    },
    {
      icon: "🌓",
      title: "Dark/Light Mode",
      description: "Comfortable viewing experience with automatic theme switching based on your preference."
    }
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-brand">SpitiIQ</div>
        <div className="landing-nav-links">
          <Link to="/login" className="nav-link">Σύνδεση</Link>
          <Link to="/register" className="nav-link nav-link-primary">Εγγραφή</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>SpitiIQ</h1>
          
       

          <p className="hero-description">
            Δεν χρειάζεσαι να είσαι ειδικός για να διαχειριστείς όλα τα ακίνητά σου. 
            Η SpitiIQ σου δίνει όλα τα εργαλεία που χρειάζεσαι για να:
          </p>

          <ul className="hero-features">
            <li> Διαχειρίζεσαι όλα τα ακίνητά σου σε ένα μέρος</li>
            <li> Παρακολουθείς ενοικιαστές και συμβόλαια εύκολα</li>
            <li> Αυτοματοποιείς τις μηνιαίες πληρωμές ενοικίων</li>
            <li> Βλέπεις analytics για τα έσοδά σου real-time</li>
            <li> Εντοπίζεις τα ακίνητά σου σε χάρτη</li>
          </ul>

          <div className="hero-buttons">
            <Link to="/register" className="button primary large">
              Ξεκίνησε Δωρεάν
            </Link>
            <Link to="/login" className="button secondary large">
              Έχεις Λογαριασμό;
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <div className="house-illustration">
            <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
              {/* House */}
              <rect x="50" y="120" width="200" height="140" fill="#e8c5a0" opacity="0.95" rx="8"/>
              
              {/* Roof */}
              <polygon points="50,120 150,30 250,120" fill="#b8956a" opacity="0.95"/>
              
              {/* Door */}
              <rect x="120" y="180" width="60" height="80" fill="#8b7355" rx="4"/>
              <circle cx="175" cy="220" r="4" fill="#f0d9bf"/>
              
              {/* Windows */}
              <rect x="70" y="140" width="35" height="35" fill="#b5a69a" rx="2"/>
              <rect x="195" y="140" width="35" height="35" fill="#b5a69a" rx="2"/>
              <rect x="70" y="200" width="35" height="35" fill="#b5a69a" rx="2"/>
              <rect x="195" y="200" width="35" height="35" fill="#b5a69a" rx="2"/>
              
              {/* Window grids */}
              <line x1="87.5" y1="140" x2="87.5" y2="175" stroke="#8b7355" strokeWidth="1"/>
              <line x1="70" y1="157.5" x2="105" y2="157.5" stroke="#8b7355" strokeWidth="1"/>
              
              <line x1="212.5" y1="140" x2="212.5" y2="175" stroke="#8b7355" strokeWidth="1"/>
              <line x1="195" y1="157.5" x2="230" y2="157.5" stroke="#8b7355" strokeWidth="1"/>
              
              <line x1="87.5" y1="200" x2="87.5" y2="235" stroke="#8b7355" strokeWidth="1"/>
              <line x1="70" y1="217.5" x2="105" y2="217.5" stroke="#8b7355" strokeWidth="1"/>
              
              <line x1="212.5" y1="200" x2="212.5" y2="235" stroke="#8b7355" strokeWidth="1"/>
              <line x1="195" y1="217.5" x2="230" y2="217.5" stroke="#8b7355" strokeWidth="1"/>
              
              {/* Chimney */}
              <rect x="140" y="50" width="20" height="35" fill="#b8956a" rx="2"/>
              
              {/* Ground */}
              <ellipse cx="150" cy="270" rx="130" ry="20" fill="#d9c8b3" opacity="0.4"/>
              
              {/* Stars/Sparkles */}
              <circle cx="40" cy="50" r="3" fill="#fbbf24" opacity="0.7"/>
              <circle cx="250" cy="70" r="2" fill="#fbbf24" opacity="0.6"/>
              <circle cx="30" cy="100" r="2" fill="#fbbf24" opacity="0.5"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2>Powerful Features for Property Management</h2>
          <p>Όλα όσα χρειάζεσαι για να διαχειριστείς τα ακίνητά σου</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Ιδιοκτήτες</div>
          </div>
          <div className="stat">
            <div className="stat-number">5000+</div>
            <div className="stat-label">Ακίνητα</div>
          </div>
          <div className="stat">
            <div className="stat-number">€2.5M+</div>
            <div className="stat-label">Ενοίκια Διαχειρισμένα</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Είσαι έτοιμος να διαχειριστείς έξυπνα;</h2>
        <p>Δημιούργησε τον λογαριασμό σου σήμερα και ξεκίνησε δωρεάν</p>
        <Link to="/register" className="button primary large">
          Ξεκίνησε Τώρα
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>SpitiIQ</h4>
            <p>Η έξυπνη λύση για τη διαχείριση ακινήτων</p>
          </div>
          <div className="footer-section">
            <h4>Features</h4>
            <ul>
              <li><a href="#properties">Ακίνητα</a></li>
              <li><a href="#tenants">Ενοικιαστές</a></li>
              <li><a href="#payments">Πληρωμές</a></li>
              <li><a href="#dashboard">Dashboard</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Λογαριασμός</h4>
            <ul>
              <li><Link to="/login">Σύνδεση</Link></li>
              <li><Link to="/register">Εγγραφή</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SpitiIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
