# ✈️ Traveloop: Your Ultimate Multi-City Travel Planner

Traveloop is a modern travel planning platform developed for the Odoo Hackathon.  
The platform helps users organize trips, manage itineraries, track expenses, and explore destinations through a simple and user-friendly interface.


## 🌟 Key Features

- **🗺️ Intelligent Itinerary Builder**: Plan multi-city trips with precision. Add city stops, schedule activities, and visualize your entire timeline.
- **💰 Dynamic Budget Tracking**: Automatically calculate trip costs as you add activities. Compare your planned budget with actual expenses in real-time.
- **📊 Advanced Analytics Dashboard**: Get a bird's-eye view of your travel habits, upcoming trips, and platform-wide statistics.
- **🔐 Secure Authentication**: Full user management system with JWT-based sessions and encrypted password storage.
- **🏙️ Global City Explorer**: Browse a curated list of top destinations with cost indices and popular activities.
- **📋 Integrated Travel Tools**: 
  - **Packing Checklist**: Interactive lists categorized by type.
  - **Trip Notes**: Keep important info like hotel confirmations and rail passes in one place.

---

## 🏗️ Architecture & Tech Stack

Traveloop is built with a focus on performance, scalability, and modern UI/UX principles.

- **Frontend**: Vanilla JavaScript (ES6+), CSS3 (Glassmorphism), HTML5.
- **Backend**: Python 3, Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS.
- **Database**: SQLite (Relational database for structured trip data).
- **Security**: Bcrypt password hashing and JWT-based stateless authentication.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.x
- A modern web browser

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*The server will start at `http://127.0.0.1:5000` and automatically seed a demo account.*

### 3. Frontend Setup
Simply open `index.html` in your browser. For the best experience, use a local server:
```bash
# Example using Python's built-in server
python -m http.server 8000
```
*Access the app at `http://localhost:8000`.*

---

## 📸 Demo Access
**Login**: `demo@traveloop.com`  
**Password**: `demo123`

---

## 🛠️ Contributing

We welcome contributions! Whether it's a bug fix, a new feature, or a UI enhancement, feel free to open a PR.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ for the Odoo Hackathon.
