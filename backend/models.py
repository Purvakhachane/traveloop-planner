from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    trips = db.relationship('Trip', backref='owner', lazy=True)

class Trip(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.String(20), nullable=False)
    end_date = db.Column(db.String(20), nullable=False)
    description = db.Column(db.Text)
    budget = db.Column(db.Float, default=0.0)
    emoji = db.Column(db.String(10), default='✈️')
    cover_gradient = db.Column(db.String(50), default='trip-cover-1')
    is_public = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='planning')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    stops = db.relationship('Stop', backref='trip', lazy=True, cascade="all, delete-orphan")

class Stop(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = db.Column(db.String(36), db.ForeignKey('trip.id'), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100))
    flag = db.Column(db.String(10))
    start_date = db.Column(db.String(20))
    end_date = db.Column(db.String(20))
    activities = db.relationship('Activity', backref='stop', lazy=True, cascade="all, delete-orphan")

class Activity(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    stop_id = db.Column(db.String(36), db.ForeignKey('stop.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50))
    cost = db.Column(db.Float, default=0.0)
    icon = db.Column(db.String(10))
    duration = db.Column(db.String(20))
