from flask import Blueprint, request, jsonify
from models import db, User, Trip, Stop, Activity
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

api = Blueprint('api', __name__)
bcrypt = Bcrypt()

# --- Auth Routes ---

@api.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User already exists"}), 400
    
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(name=data['name'], email=data['email'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    access_token = create_access_token(identity=new_user.id)
    return jsonify({"token": access_token, "user": {"id": new_user.id, "name": new_user.name, "email": new_user.email}}), 201

@api.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({"token": access_token, "user": {"id": user.id, "name": user.name, "email": user.email}}), 200
    
    return jsonify({"msg": "Invalid credentials"}), 401

# --- Trip Routes ---

@api.route('/trips', methods=['GET'])
@jwt_required()
def get_trips():
    user_id = get_jwt_identity()
    trips = Trip.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": t.id, "name": t.name, "startDate": t.start_date, "endDate": t.end_date,
        "emoji": t.emoji, "budget": t.budget, "status": t.status, "coverGradient": t.cover_gradient
    } for t in trips]), 200

@api.route('/trips', methods=['POST'])
@jwt_required()
def save_trip():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    trip_id = data.get('id')
    trip = None
    if trip_id:
        trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
        
    if trip:
        # Update existing
        trip.name = data['name']
        trip.start_date = data['startDate']
        trip.end_date = data['endDate']
        trip.description = data.get('description', '')
        trip.budget = data.get('budget', 0)
        trip.emoji = data.get('emoji', '✈️')
        trip.cover_gradient = data.get('coverGradient', 'trip-cover-1')
        trip.is_public = data.get('isPublic', False)
        trip.status = data.get('status', 'planning')
    else:
        # Create new
        trip = Trip(
            user_id=user_id,
            name=data['name'],
            start_date=data['startDate'],
            end_date=data['endDate'],
            description=data.get('description', ''),
            budget=data.get('budget', 0),
            emoji=data.get('emoji', '✈️'),
            cover_gradient=data.get('coverGradient', 'trip-cover-1'),
            is_public=data.get('isPublic', False),
            status='planning'
        )
        db.session.add(trip)
    
    db.session.commit()
    return jsonify({"id": trip.id, "msg": "Trip saved successfully"}), 200

@api.route('/trips/<trip_id>', methods=['GET'])
@jwt_required()
def get_trip_details(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({"msg": "Trip not found"}), 404
    
    stops = []
    for s in trip.stops:
        activities = [{
            "id": a.id, "name": a.name, "type": a.type, "cost": a.cost, "icon": a.icon, "duration": a.duration
        } for a in s.activities]
        stops.append({
            "id": s.id, "city": s.city, "country": s.country, "flag": s.flag,
            "startDate": s.start_date, "endDate": s.end_date, "activities": activities
        })
        
    return jsonify({
        "id": trip.id, "name": trip.name, "startDate": trip.start_date, "endDate": trip.end_date,
        "description": trip.description, "budget": trip.budget, "emoji": trip.emoji,
        "coverGradient": trip.cover_gradient, "status": trip.status, "stops": stops
    }), 200

# --- Itinerary Routes ---

@api.route('/itinerary', methods=['POST'])
@jwt_required()
def save_itinerary():
    user_id = get_jwt_identity()
    data = request.get_json()
    trip_id = data.get('tripId')
    
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()
    if not trip:
        return jsonify({"msg": "Trip not found"}), 404
    
    # Simple strategy: clear existing stops and rebuild (or sync)
    # For a hackathon, clearing and rebuilding is safest for complex nested data
    Stop.query.filter_by(trip_id=trip_id).delete()
    
    for stop_data in data.get('stops', []):
        new_stop = Stop(
            trip_id=trip_id,
            city=stop_data['city'],
            country=stop_data.get('country', ''),
            flag=stop_data.get('flag', ''),
            start_date=stop_data.get('startDate', ''),
            end_date=stop_data.get('endDate', '')
        )
        db.session.add(new_stop)
        db.session.flush() # get new_stop.id
        
        for act_data in stop_data.get('activities', []):
            new_act = Activity(
                stop_id=new_stop.id,
                name=act_data['name'],
                type=act_data.get('type', ''),
                cost=float(act_data.get('cost', 0)),
                icon=act_data.get('icon', ''),
                duration=act_data.get('duration', '')
            )
            db.session.add(new_act)
            
    db.session.commit()
    return jsonify({"msg": "Itinerary saved successfully"}), 200

# --- Dashboard Stats ---

@api.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_data():
    user_id = get_jwt_identity()
    trips = Trip.query.filter_by(user_id=user_id).all()
    
    total_trips = len(trips)
    planned_budget = sum(t.budget for t in trips)
    
    # Calculate actual cost from all activities in all trips
    actual_cost = 0
    for t in trips:
        for s in t.stops:
            actual_cost += sum(a.cost for a in s.activities)
            
    upcoming_trips = [t for t in trips if t.status == 'upcoming' or t.status == 'planning']
    
    return jsonify({
        "totalTrips": total_trips,
        "plannedBudget": planned_budget,
        "actualCost": actual_cost,
        "upcomingCount": len(upcoming_trips),
        "recentTrips": [{
            "id": t.id, "name": t.name, "emoji": t.emoji, "startDate": t.start_date, "status": t.status
        } for t in trips[:5]]
    }), 200

# --- Admin Routes ---

@api.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    # In a real app, check if user is admin
    users = User.query.all()
    trips = Trip.query.all()
    stops = Stop.query.all()
    
    city_count = {}
    for s in stops:
        city_count[s.city] = city_count.get(s.city, 0) + 1
    
    type_count = {}
    for s in stops:
        for a in s.activities:
            type_count[a.type] = type_count.get(a.type, 0) + 1
            
    return jsonify({
        "totalUsers": len(users),
        "totalTrips": len(trips),
        "totalStops": len(stops),
        "totalBudget": sum(t.budget for t in trips),
        "topCities": sorted(city_count.items(), key=lambda x: x[1], reverse=True)[:6],
        "topTypes": sorted(type_count.items(), key=lambda x: x[1], reverse=True)[:6],
        "statusCount": {
            "planning": len([t for t in trips if t.status == 'planning']),
            "upcoming": len([t for t in trips if t.status == 'upcoming']),
            "completed": len([t for t in trips if t.status == 'completed'])
        },
        "users": [{
            "id": u.id, "name": u.name, "email": u.email, "createdAt": u.created_at.isoformat(),
            "tripCount": len(u.trips)
        } for u in users]
    }), 200
