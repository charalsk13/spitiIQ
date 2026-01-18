# SpitiIQ - Property Management System

Η έξυπνη λύση για τη διαχείριση των ακινήτων σου! 🏠

## 📋 Περιγραφή

Μια ολοκληρωμένη web εφαρμογή για τη διαχείριση ακινήτων, ενοικιαστών, συμβολαίων και πληρωμών ενοικίων.

## ✨ Χαρακτηριστικά

- 🏠 **Διαχείριση Ακινήτων** - Προσθήκη, επεξεργασία και ανάλυση των ακινήτων σας
- 👥 **Ενοικιαστές & Συμβόλαια** - Πληροφορίες ενοικιαστών και συμβολαίων
- 💰 **Ενοίκια & Πληρωμές** - Αυτόματη δημιουργία πληρωμών και παρακολούθηση κατάστασης
- 📊 **Dashboard Analytics** - Real-time στατιστικά εσόδων
- 🗺️ **Χάρτης Ακινήτων** - Εντοπισμός ακινήτων σε χάρτη
- ⚠️ **Ληξιπρόθεσμες Πληρωμές** - Ειδοποιήσεις για καθυστερημένα ενοίκια
- 🔐 **Ασφάλεια** - JWT Authentication & Role-based Access Control

## 🛠️ Τεχνολογίες

### Backend
- **Django REST Framework** - REST API
- **PostgreSQL-compatible Database** - Data storage
- **JWT Authentication** - Secure authentication
- **Python 3.11+**

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Axios** - HTTP client

## 🚀 Εγκατάστταση

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 📖 Χρήση

1. **Εγγραφή/Σύνδεση** - Δημιουργήστε λογαριασμό ή συνδεθείτε
2. **Προσθήκη Ακινήτων** - Καταχωρήστε τα ακίνητά σας
3. **Διαχείριση Ενοικιαστών** - Προσθέστε ενοικιαστές και συμβόλαια
4. **Παρακολούθηση Πληρωμών** - Δείτε το status των πληρωμών ενοικίων
5. **Ανάλυση Δεδομένων** - Δείτε τα analytics στο dashboard

## 🔑 Credentials (Test)

- **Username:** admin
- **Password:** 

## 📱 API Endpoints

- `GET /api/apartments/` - Λίστα ακινήτων
- `POST /api/apartments/` - Δημιουργία ακινήτου
- `GET /api/tenants/` - Λίστα ενοικιαστών
- `POST /api/tenants/` - Δημιουργία ενοικιαστή
- `GET /api/payments/` - Λίστα πληρωμών
- `POST /api/payments/` - Δημιουργία πληρωμής

## 🎨 Dark Mode

Η εφαρμογή υποστηρίζει auto-switching μεταξύ dark/light mode.

## 📄 License

MIT License

---

Δημιουργήθηκε με ❤️ για τη διαχείριση ακινήτων
