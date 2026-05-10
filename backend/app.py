from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from routes import api, bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///traveloop.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-travel-key')
    from datetime import timedelta
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    
    # Initialize Extensions
    db.init_app(app)
    CORS(app)
    JWTManager(app)
    bcrypt.init_app(app)
    
    # Register Blueprints
    app.register_blueprint(api, url_prefix='/api')
    
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    # Seed demo user
    from models import User
    from werkzeug.security import generate_password_hash
    with app.app_context():
        if not User.query.filter_by(email='demo@traveloop.com').first():
            demo_user = User(
                name='Alex Rivera',
                email='demo@traveloop.com',
                password=generate_password_hash('demo123')
            )
            db.session.add(demo_user)
            db.session.commit()
            print("Seeded demo user.")

    app.run(debug=True, port=5000)
