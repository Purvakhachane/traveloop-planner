/* ============================================================
   TRAVELOOP – Data Layer (LocalStorage)
   ============================================================ */

const DB = {
  // Keys
  KEYS: {
    USERS: 'tl_users',
    CURRENT_USER: 'tl_current_user',
    TRIPS: 'tl_trips',
    STOPS: 'tl_stops',
    PACKING: 'tl_packing',
    NOTES: 'tl_notes',
    CURRENT_TRIP: 'tl_current_trip',
  },

  // Generic CRUD
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; }
    catch { return null; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  uuid() { return 'tl_' + Math.random().toString(36).substr(2,9) + Date.now().toString(36); },

  // Users
  getUsers()  { return this.get(this.KEYS.USERS); },
  saveUsers(u){ this.set(this.KEYS.USERS, u); },
  getCurrentUser() { return this.getObj(this.KEYS.CURRENT_USER); },
  setCurrentUser(u){ this.set(this.KEYS.CURRENT_USER, u); },
  clearCurrentUser(){ localStorage.removeItem(this.KEYS.CURRENT_USER); },

  // Trips
  getTrips() { return this.get(this.KEYS.TRIPS); },
  getUserTrips(userId) { return this.getTrips().filter(t => t.userId === userId); },
  getTrip(id){ return this.getTrips().find(t => t.id === id) || null; },
  saveTrip(trip) {
    const trips = this.getTrips();
    const idx = trips.findIndex(t => t.id === trip.id);
    if (idx >= 0) trips[idx] = trip; else trips.push(trip);
    this.set(this.KEYS.TRIPS, trips);
    return trip;
  },
  deleteTrip(id) {
    const trips = this.getTrips().filter(t => t.id !== id);
    this.set(this.KEYS.TRIPS, trips);
    // also delete stops, packing, notes
    this.set(this.KEYS.STOPS, this.getStops().filter(s => s.tripId !== id));
    this.set(this.KEYS.PACKING, this.getPacking().filter(p => p.tripId !== id));
    this.set(this.KEYS.NOTES, this.getNotes().filter(n => n.tripId !== id));
  },
  getCurrentTrip() { return this.getObj(this.KEYS.CURRENT_TRIP); },
  setCurrentTrip(id) { this.set(this.KEYS.CURRENT_TRIP, id); },

  // Stops
  getStops() { return this.get(this.KEYS.STOPS); },
  getTripStops(tripId) { return this.getStops().filter(s => s.tripId === tripId); },
  saveStop(stop) {
    const stops = this.getStops();
    const idx = stops.findIndex(s => s.id === stop.id);
    if (idx >= 0) stops[idx] = stop; else stops.push(stop);
    this.set(this.KEYS.STOPS, stops);
    return stop;
  },
  deleteStop(id) { this.set(this.KEYS.STOPS, this.getStops().filter(s => s.id !== id)); },

  // Packing
  getPacking() { return this.get(this.KEYS.PACKING); },
  getTripPacking(tripId) { return this.getPacking().filter(p => p.tripId === tripId); },
  savePackingItem(item) {
    const items = this.getPacking();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item; else items.push(item);
    this.set(this.KEYS.PACKING, items);
    return item;
  },
  deletePackingItem(id) { this.set(this.KEYS.PACKING, this.getPacking().filter(i => i.id !== id)); },

  // Notes
  getNotes() { return this.get(this.KEYS.NOTES); },
  getTripNotes(tripId) { return this.getNotes().filter(n => n.tripId === tripId); },
  saveNote(note) {
    const notes = this.getNotes();
    const idx = notes.findIndex(n => n.id === note.id);
    if (idx >= 0) notes[idx] = note; else notes.push(note);
    this.set(this.KEYS.NOTES, notes);
    return note;
  },
  deleteNote(id) { this.set(this.KEYS.NOTES, this.getNotes().filter(n => n.id !== id)); },

  // Seed demo data
  seed() {
    if (this.getUsers().length > 0) return; // already seeded

    // Demo user
    const user = {
      id: 'user_demo',
      name: 'Alex Rivera',
      email: 'demo@traveloop.com',
      password: 'demo123',
      createdAt: '2026-01-15T10:00:00Z',
    };
    this.saveUsers([user]);

    // Demo trips
    const trips = [
      {
        id: 'trip_1', userId: 'user_demo',
        name: 'European Dream', emoji: '🏰',
        startDate: '2026-06-10', endDate: '2026-06-28',
        description: 'Exploring the best of Western Europe',
        coverGradient: 'trip-cover-1',
        isPublic: true,
        budget: 3200,
        status: 'upcoming',
        createdAt: '2026-02-01T10:00:00Z',
      },
      {
        id: 'trip_2', userId: 'user_demo',
        name: 'Japan Cherry Blossom', emoji: '🌸',
        startDate: '2026-03-25', endDate: '2026-04-10',
        description: 'Cherry blossom season in Japan',
        coverGradient: 'trip-cover-2',
        isPublic: true,
        budget: 4500,
        status: 'completed',
        createdAt: '2026-01-20T10:00:00Z',
      },
      {
        id: 'trip_3', userId: 'user_demo',
        name: 'Southeast Asia Backpacking', emoji: '🌴',
        startDate: '2026-09-01', endDate: '2026-09-22',
        description: 'Backpacking through Thailand, Vietnam and Cambodia',
        coverGradient: 'trip-cover-3',
        isPublic: false,
        budget: 2100,
        status: 'planning',
        createdAt: '2026-03-10T10:00:00Z',
      },
    ];
    trips.forEach(t => this.saveTrip(t));

    // Demo stops
    const stops = [
      { id: 'stop_1', tripId: 'trip_1', city: 'Paris', country: 'France', flag: '🇫🇷', startDate: '2026-06-10', endDate: '2026-06-14', activities: [
        { id: 'a1', name: 'Eiffel Tower', type: 'Sightseeing', cost: 25, icon: '🗼', duration: '3h' },
        { id: 'a2', name: 'Louvre Museum', type: 'Culture', cost: 17, icon: '🎨', duration: '4h' },
        { id: 'a3', name: 'Seine River Cruise', type: 'Experience', cost: 35, icon: '🚢', duration: '2h' },
      ]},
      { id: 'stop_2', tripId: 'trip_1', city: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', startDate: '2026-06-14', endDate: '2026-06-18', activities: [
        { id: 'a4', name: 'Canal Boat Tour', type: 'Experience', cost: 22, icon: '🚤', duration: '2h' },
        { id: 'a5', name: 'Rijksmuseum', type: 'Culture', cost: 20, icon: '🖼️', duration: '3h' },
      ]},
      { id: 'stop_3', tripId: 'trip_1', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', startDate: '2026-06-18', endDate: '2026-06-23', activities: [
        { id: 'a6', name: 'Sagrada Familia', type: 'Architecture', cost: 30, icon: '⛪', duration: '2h' },
        { id: 'a7', name: 'Park Güell', type: 'Nature', cost: 10, icon: '🌿', duration: '2h' },
        { id: 'a8', name: 'Tapas Food Tour', type: 'Food', cost: 55, icon: '🍷', duration: '3h' },
      ]},
      { id: 'stop_4', tripId: 'trip_1', city: 'Rome', country: 'Italy', flag: '🇮🇹', startDate: '2026-06-23', endDate: '2026-06-28', activities: [
        { id: 'a9', name: 'Colosseum', type: 'History', cost: 16, icon: '🏛️', duration: '2h' },
        { id: 'a10', name: 'Vatican Museums', type: 'Culture', cost: 20, icon: '🎭', duration: '4h' },
      ]},
    ];
    stops.forEach(s => this.saveStop(s));

    // Demo packing for trip_1
    const packing = [
      { id: 'pk1', tripId: 'trip_1', item: 'Passport', category: 'documents', packed: true },
      { id: 'pk2', tripId: 'trip_1', item: 'Travel Insurance', category: 'documents', packed: true },
      { id: 'pk3', tripId: 'trip_1', item: 'Flight Tickets', category: 'documents', packed: false },
      { id: 'pk4', tripId: 'trip_1', item: 'T-shirts (5x)', category: 'clothing', packed: false },
      { id: 'pk5', tripId: 'trip_1', item: 'Comfortable walking shoes', category: 'clothing', packed: false },
      { id: 'pk6', tripId: 'trip_1', item: 'Rain jacket', category: 'clothing', packed: false },
      { id: 'pk7', tripId: 'trip_1', item: 'Phone charger', category: 'electronics', packed: true },
      { id: 'pk8', tripId: 'trip_1', item: 'Universal adapter', category: 'electronics', packed: false },
      { id: 'pk9', tripId: 'trip_1', item: 'Camera', category: 'electronics', packed: false },
      { id: 'pk10', tripId: 'trip_1', item: 'Sunscreen', category: 'toiletries', packed: false },
      { id: 'pk11', tripId: 'trip_1', item: 'Toothbrush & paste', category: 'toiletries', packed: true },
    ];
    packing.forEach(p => this.savePackingItem(p));

    // Demo notes for trip_1
    const notes = [
      { id: 'n1', tripId: 'trip_1', stopId: 'stop_1', content: 'Hotel Mercure Paris Opera – check-in at 3pm. Breakfast included. Room 412. Contact: +33 1 45 23 45 23', timestamp: '2026-05-01T09:00:00Z' },
      { id: 'n2', tripId: 'trip_1', stopId: 'stop_2', content: 'Book canal tour tickets in advance! Best views at sunset. Recommended operator: Stromma Canal Cruises.', timestamp: '2026-05-02T14:30:00Z' },
      { id: 'n3', tripId: 'trip_1', stopId: null, content: 'European rail pass for 10 days – bought online. Print out or save PDF offline. Also download Google Maps offline for all cities.', timestamp: '2026-05-03T11:00:00Z' },
    ];
    notes.forEach(n => this.saveNote(n));
  }
};

// Static city data (mock database)
const CITIES_DATA = [
  { id: 'c1', name: 'Paris', country: 'France', region: 'Europe', flag: '🇫🇷', costIndex: 'High', popularity: 98, description: 'The City of Light – art, fashion and gastronomy', avgCostPerDay: 180 },
  { id: 'c2', name: 'Tokyo', country: 'Japan', region: 'Asia', flag: '🇯🇵', costIndex: 'High', popularity: 96, description: 'Ultramodern metropolis blending tradition and technology', avgCostPerDay: 150 },
  { id: 'c3', name: 'Barcelona', country: 'Spain', region: 'Europe', flag: '🇪🇸', costIndex: 'Medium', popularity: 92, description: 'Gaudí architecture, beaches and vibrant nightlife', avgCostPerDay: 130 },
  { id: 'c4', name: 'Bangkok', country: 'Thailand', region: 'Asia', flag: '🇹🇭', costIndex: 'Low', popularity: 90, description: 'Dazzling temples, street food paradise and nightlife', avgCostPerDay: 60 },
  { id: 'c5', name: 'New York', country: 'USA', region: 'Americas', flag: '🇺🇸', costIndex: 'High', popularity: 95, description: 'The city that never sleeps – culture and skyscrapers', avgCostPerDay: 250 },
  { id: 'c6', name: 'Amsterdam', country: 'Netherlands', region: 'Europe', flag: '🇳🇱', costIndex: 'High', popularity: 88, description: 'Canals, museums and cycling culture', avgCostPerDay: 160 },
  { id: 'c7', name: 'Bali', country: 'Indonesia', region: 'Asia', flag: '🇮🇩', costIndex: 'Low', popularity: 93, description: 'Tropical paradise with temples, rice fields and surf', avgCostPerDay: 55 },
  { id: 'c8', name: 'Rome', country: 'Italy', region: 'Europe', flag: '🇮🇹', costIndex: 'Medium', popularity: 91, description: 'Ancient history, world-class cuisine and art', avgCostPerDay: 140 },
  { id: 'c9', name: 'Dubai', country: 'UAE', region: 'Middle East', flag: '🇦🇪', costIndex: 'High', popularity: 89, description: 'Futuristic skyline, luxury shopping and desert adventures', avgCostPerDay: 200 },
  { id: 'c10', name: 'Sydney', country: 'Australia', region: 'Oceania', flag: '🇦🇺', costIndex: 'High', popularity: 87, description: 'Opera House, Harbour Bridge and stunning beaches', avgCostPerDay: 190 },
  { id: 'c11', name: 'Kyoto', country: 'Japan', region: 'Asia', flag: '🇯🇵', costIndex: 'Medium', popularity: 85, description: 'Ancient temples, geisha districts and bamboo forests', avgCostPerDay: 120 },
  { id: 'c12', name: 'Lisbon', country: 'Portugal', region: 'Europe', flag: '🇵🇹', costIndex: 'Low', popularity: 86, description: 'Pastel buildings, fado music and delicious pasteis', avgCostPerDay: 100 },
  { id: 'c13', name: 'Buenos Aires', country: 'Argentina', region: 'Americas', flag: '🇦🇷', costIndex: 'Low', popularity: 82, description: 'Tango, steaks, European architecture and passion', avgCostPerDay: 70 },
  { id: 'c14', name: 'Istanbul', country: 'Turkey', region: 'Europe', flag: '🇹🇷', costIndex: 'Medium', popularity: 88, description: 'Where East meets West – bazaars, mosques and Bosphorus', avgCostPerDay: 90 },
  { id: 'c15', name: 'Prague', country: 'Czech Republic', region: 'Europe', flag: '🇨🇿', costIndex: 'Low', popularity: 84, description: 'Fairy-tale castles, cobbled streets and craft beer', avgCostPerDay: 85 },
  { id: 'c16', name: 'Singapore', country: 'Singapore', region: 'Asia', flag: '🇸🇬', costIndex: 'High', popularity: 91, description: 'Garden city with world-class food and spotless streets', avgCostPerDay: 170 },
];

// Static activities data
const ACTIVITIES_DATA = [
  { id: 'act1', cityId: 'c1', name: 'Eiffel Tower Visit', type: 'Sightseeing', cost: 25, duration: '3h', icon: '🗼', description: 'Visit the iconic iron tower and take in panoramic views' },
  { id: 'act2', cityId: 'c1', name: 'Louvre Museum', type: 'Culture', cost: 17, duration: '4h', icon: '🎨', description: 'World\'s largest art museum, home to the Mona Lisa' },
  { id: 'act3', cityId: 'c1', name: 'Seine River Cruise', type: 'Experience', cost: 35, duration: '2h', icon: '🚢', description: 'Scenic boat ride past Paris\'s most iconic landmarks' },
  { id: 'act4', cityId: 'c1', name: 'Montmartre Walking Tour', type: 'Tour', cost: 0, duration: '2h', icon: '🚶', description: 'Explore the artistic hilltop neighbourhood' },
  { id: 'act5', cityId: 'c2', name: 'Shibuya Crossing', type: 'Sightseeing', cost: 0, duration: '1h', icon: '🚦', description: 'Experience the world\'s busiest pedestrian crossing' },
  { id: 'act6', cityId: 'c2', name: 'Senso-ji Temple', type: 'Culture', cost: 0, duration: '2h', icon: '⛩️', description: 'Tokyo\'s oldest and most significant Buddhist temple' },
  { id: 'act7', cityId: 'c2', name: 'Tsukiji Outer Market', type: 'Food', cost: 40, duration: '2h', icon: '🍣', description: 'Fresh sushi and Japanese street food experience' },
  { id: 'act8', cityId: 'c3', name: 'Sagrada Família', type: 'Architecture', cost: 30, duration: '2h', icon: '⛪', description: 'Gaudí\'s awe-inspiring unfinished masterpiece' },
  { id: 'act9', cityId: 'c3', name: 'Park Güell', type: 'Nature', cost: 10, duration: '2h', icon: '🌿', description: 'Gaudí\'s whimsical park with mosaic art and city views' },
  { id: 'act10', cityId: 'c3', name: 'Tapas & Wine Tour', type: 'Food', cost: 55, duration: '3h', icon: '🍷', description: 'Taste the best tapas bars in the Gothic Quarter' },
  { id: 'act11', cityId: 'c4', name: 'Grand Palace', type: 'Culture', cost: 15, duration: '3h', icon: '👑', description: 'Dazzling royal palace and Wat Phra Kaew temple' },
  { id: 'act12', cityId: 'c4', name: 'Thai Cooking Class', type: 'Food', cost: 35, duration: '4h', icon: '🍜', description: 'Learn to cook authentic Thai dishes' },
  { id: 'act13', cityId: 'c7', name: 'Ubud Rice Terraces', type: 'Nature', cost: 5, duration: '3h', icon: '🌾', description: 'Stunning traditional rice paddies in Tegallalang' },
  { id: 'act14', cityId: 'c7', name: 'Sunrise Hike Mt. Batur', type: 'Adventure', cost: 60, duration: '6h', icon: '🌋', description: 'Guided hike to see sunrise from volcanic crater' },
  { id: 'act15', cityId: 'c8', name: 'Colosseum', type: 'History', cost: 16, duration: '2h', icon: '🏛️', description: 'Step inside the ancient amphitheater of the Roman Empire' },
  { id: 'act16', cityId: 'c8', name: 'Vatican Museums', type: 'Culture', cost: 20, duration: '4h', icon: '🎭', description: 'World-class art including the Sistine Chapel' },
  { id: 'act17', cityId: 'c6', name: 'Canal Boat Tour', type: 'Experience', cost: 22, duration: '2h', icon: '🚤', description: 'Explore Amsterdam\'s 165 canals by boat' },
  { id: 'act18', cityId: 'c6', name: 'Rijksmuseum', type: 'Culture', cost: 20, duration: '3h', icon: '🖼️', description: 'National museum of Dutch art and history' },
  { id: 'act19', cityId: 'c9', name: 'Burj Khalifa Observation', type: 'Sightseeing', cost: 45, duration: '2h', icon: '🏙️', description: 'View from the world\'s tallest building' },
  { id: 'act20', cityId: 'c9', name: 'Desert Safari', type: 'Adventure', cost: 80, duration: '6h', icon: '🐪', description: 'Dune bashing, camel riding and Bedouin dinner' },
];
