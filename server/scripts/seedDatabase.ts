import { db } from "../db";
import { 
  users, 
  profiles, 
  policeStations, 
  officers, 
  criminals, 
  crimeTypes, 
  criminalCrimeTypes,
  firDetails,
  activities
} from "@shared/schema";
import { eq } from "drizzle-orm";

// Seed configuration
const SEED_COUNT = {
  STATIONS: 20,
  OFFICERS: 100,
  CRIMINALS: 200,
  CRIME_TYPES: 15,
  FIR_DETAILS: 200,
  ACTIVITIES: 100
};

// Helper to generate random date in the past
const randomPastDate = (years = 5) => {
  const today = new Date();
  const pastDate = new Date(today);
  pastDate.setFullYear(today.getFullYear() - Math.floor(Math.random() * years));
  pastDate.setMonth(Math.floor(Math.random() * 12));
  pastDate.setDate(Math.floor(Math.random() * 28) + 1);
  return pastDate;
};

// Generate random string ID
const generateId = (prefix: string, length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return `${prefix}-${result}`;
};

// Generate random names
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 
  'William', 'Emma', 'James', 'Olivia', 'Richard', 'Sophia', 'Thomas', 'Ava', 
  'Charles', 'Mia', 'Daniel', 'Isabella', 'Matthew', 'Charlotte', 'Anthony', 'Amelia',
  'Mark', 'Harper', 'Paul', 'Evelyn', 'Steven', 'Abigail', 'Andrew', 'Elizabeth',
  'Kenneth', 'Sofia', 'George', 'Scarlett', 'Joshua', 'Victoria', 'Edward', 'Camila',
  'Brian', 'Aria', 'Kevin', 'Lily', 'Ronald', 'Eleanor', 'Timothy', 'Hannah',
  'Jason', 'Lillian', 'Jeffrey', 'Addison', 'Ryan', 'Natalie', 'Jacob', 'Brooklyn'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee',
  'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez',
  'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans',
  'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook'
];

const getRandomName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName, lastName };
};

// Generate random phone number
const generatePhoneNumber = () => {
  return `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
};

// Generate random address
const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Ave', 'Park Pl'];
const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'GA'];

const generateAddress = () => {
  const streetNum = Math.floor(Math.random() * 9000 + 1000);
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zip = Math.floor(Math.random() * 90000 + 10000);
  return `${streetNum} ${street}, ${city}, ${state} ${zip}`;
};

// Generate random email
const generateEmail = (firstName: string, lastName: string) => {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
};

// Clear existing data
async function clearDatabase() {
  console.log("Clearing existing data...");
  
  try {
    // Delete in correct order to maintain referential integrity
    await db.delete(activities);
    await db.delete(criminalCrimeTypes);
    await db.delete(firDetails);
    await db.delete(criminals);
    await db.delete(crimeTypes);
    await db.delete(officers);
    await db.delete(policeStations);
    await db.delete(profiles).where(eq(profiles.userId, "demo-user-id"));
    await db.delete(users).where(eq(users.id, "demo-user-id"));
    
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

// Seed police stations
async function seedPoliceStations() {
  console.log(`Seeding ${SEED_COUNT.STATIONS} police stations...`);
  
  const stationInserts = [];
  
  for (let i = 0; i < SEED_COUNT.STATIONS; i++) {
    const stationId = generateId('STN');
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    stationInserts.push({
      id: stationId,
      name: `${city} Police Station`,
      address: generateAddress(),
      contact: generatePhoneNumber(),
    });
  }
  
  try {
    const insertedStations = await db.insert(policeStations).values(stationInserts).returning();
    console.log(`${insertedStations.length} police stations seeded successfully`);
    return insertedStations;
  } catch (error) {
    console.error("Error seeding police stations:", error);
    throw error;
  }
}

// Seed officers
async function seedOfficers(stations: any[]) {
  console.log(`Seeding ${SEED_COUNT.OFFICERS} officers...`);
  
  const officerInserts = [];
  
  for (let i = 0; i < SEED_COUNT.OFFICERS; i++) {
    // Assign to a random station
    const stationIndex = Math.floor(Math.random() * stations.length);
    const station = stations[stationIndex];
    
    const officerId = generateId('OFF');
    const { firstName, lastName } = getRandomName();
    
    officerInserts.push({
      id: officerId,
      badgeNumber: `${Math.floor(Math.random() * 900000 + 100000)}`,
      firstName,
      lastName,
      rank: ['Constable', 'Sergeant', 'Inspector', 'Deputy Commissioner', 
        'Assistant Commissioner', 'Commissioner'][Math.floor(Math.random() * 6)],
      stationId: station.id,
      contactNumber: generatePhoneNumber(),
      email: generateEmail(firstName, lastName),
      joiningDate: randomPastDate(10).toISOString().split('T')[0],
      status: ['Active', 'On Leave', 'Suspended', 'Retired', 'Transferred'][Math.floor(Math.random() * 5)],
    });
  }
  
  try {
    const insertedOfficers = await db.insert(officers).values(officerInserts).returning();
    console.log(`${insertedOfficers.length} officers seeded successfully`);
    return insertedOfficers;
  } catch (error) {
    console.error("Error seeding officers:", error);
    throw error;
  }
}

// Seed crime types
async function seedCrimeTypes() {
  console.log(`Seeding ${SEED_COUNT.CRIME_TYPES} crime types...`);
  
  const crimeTypeNames = [
    'Theft', 'Robbery', 'Assault', 'Homicide', 'Fraud', 
    'Cybercrime', 'Drug Possession', 'Drug Trafficking', 
    'Kidnapping', 'Sexual Assault', 'Domestic Violence', 
    'Vandalism', 'White Collar Crime', 'Organized Crime', 
    'Arson', 'Identity Theft', 'Human Trafficking', 
    'Child Abuse', 'Stalking', 'Terrorism'
  ];
  
  const crimeTypeDescriptions = [
    'Taking of property without permission',
    'Taking property by force or threat',
    'Physical attack on another person',
    'The killing of one person by another',
    'Deception for financial or personal gain',
    'Criminal activities using computers or networks',
    'Possession of illegal substances',
    'Distribution or sale of illegal substances',
    'Illegal confinement of a person against their will',
    'Unwanted sexual activity without consent',
    'Violence within a domestic setting',
    'Destruction or damage to property',
    'Non-violent financial crimes committed by professionals',
    'Structured illegal activities by criminal organizations',
    'Intentional or malicious setting of fire',
    'Taking someone\'s personal information without permission',
    'Transport of humans for exploitation',
    'Mistreatment of children',
    'Harassment and intimidation of a specific person',
    'Use of violence or intimidation for political aims'
  ];
  
  const crimeTypeInserts = crimeTypeNames.slice(0, SEED_COUNT.CRIME_TYPES).map((name, index) => ({
    id: index + 1,
    name,
    description: crimeTypeDescriptions[index],
    severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
  }));
  
  try {
    const insertedCrimeTypes = await db.insert(crimeTypes).values(crimeTypeInserts).returning();
    console.log(`${insertedCrimeTypes.length} crime types seeded successfully`);
    return insertedCrimeTypes;
  } catch (error) {
    console.error("Error seeding crime types:", error);
    throw error;
  }
}

// Seed criminals
async function seedCriminals(crimeTypesList: any[]) {
  console.log(`Seeding ${SEED_COUNT.CRIMINALS} criminals...`);
  
  const criminalInserts = [];
  const criminalCrimeTypeInserts = [];
  
  for (let i = 0; i < SEED_COUNT.CRIMINALS; i++) {
    const criminalId = generateId('CRM');
    const { firstName, lastName } = getRandomName();
    
    criminalInserts.push({
      id: criminalId,
      firstName,
      lastName,
      age: Math.floor(Math.random() * 52) + 18, // 18-70
      gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)],
      address: generateAddress(),
      phoneNumber: generatePhoneNumber(),
      status: ['In Custody', 'Released', 'Wanted', 'Under Trial', 'Convicted'][Math.floor(Math.random() * 5)],
      photoUrl: null, // Would normally be a URL to an avatar
      lastCrimeDate: randomPastDate(3).toISOString().split('T')[0],
    });
    
    // Assign 1-3 crime types to each criminal
    const numCrimeTypes = Math.floor(Math.random() * 3) + 1;
    const assignedTypes = new Set();
    
    for (let j = 0; j < numCrimeTypes; j++) {
      const typeIndex = Math.floor(Math.random() * crimeTypesList.length);
      const crimeTypeId = crimeTypesList[typeIndex].id;
      
      // Avoid duplicates
      if (!assignedTypes.has(crimeTypeId)) {
        assignedTypes.add(crimeTypeId);
        
        criminalCrimeTypeInserts.push({
          criminalId,
          crimeTypeId,
        });
      }
    }
  }
  
  try {
    const insertedCriminals = await db.insert(criminals).values(criminalInserts).returning();
    console.log(`${insertedCriminals.length} criminals seeded successfully`);
    
    const insertedCriminalCrimeTypes = await db.insert(criminalCrimeTypes).values(criminalCrimeTypeInserts).returning();
    console.log(`${insertedCriminalCrimeTypes.length} criminal-crime type associations seeded`);
    
    return insertedCriminals;
  } catch (error) {
    console.error("Error seeding criminals:", error);
    throw error;
  }
}

// Seed FIR details
async function seedFirDetails(stations: any[], officers: any[], criminalsList: any[]) {
  console.log(`Seeding ${SEED_COUNT.FIR_DETAILS} FIR details...`);
  
  const firInserts = [];
  
  for (let i = 0; i < SEED_COUNT.FIR_DETAILS; i++) {
    const firId = generateId('FIR');
    
    // Randomly assign to a station and officer from that station
    const stationIndex = Math.floor(Math.random() * stations.length);
    const station = stations[stationIndex];
    
    // Find officers from this station
    const stationOfficers = officers.filter(officer => officer.stationId === station.id);
    const officerIndex = Math.floor(Math.random() * stationOfficers.length);
    const officer = stationOfficers.length > 0 ? stationOfficers[officerIndex] : officers[Math.floor(Math.random() * officers.length)];
    
    // Randomly assign a criminal or null for unidentified cases
    const hasCriminal = Math.random() > 0.3; // 70% of FIRs have identified criminals
    const criminalIndex = hasCriminal ? Math.floor(Math.random() * criminalsList.length) : -1;
    const criminal = hasCriminal ? criminalsList[criminalIndex] : null;
    
    const { firstName, lastName } = getRandomName();
    const complainantName = `${firstName} ${lastName}`;
    
    firInserts.push({
      id: firId,
      stationId: station.id,
      officerId: officer.id,
      criminalId: criminal?.id || null,
      complainantName,
      complainantId: `CID-${Math.floor(Math.random() * 900000000000 + 100000000000)}`,
      complainantAddress: generateAddress(),
      complainantPhoneNumber: generatePhoneNumber(),
      incidentType: [
        'Theft', 'Burglary', 'Assault', 'Fraud', 'Cyber Crime', 
        'Kidnapping', 'Missing Person', 'Domestic Violence', 'Drug Related', 'Other'
      ][Math.floor(Math.random() * 10)],
      incidentDate: randomPastDate(2).toISOString().split('T')[0],
      incidentLocation: generateAddress(),
      incidentDescription: `Incident reported by ${complainantName} involving potential criminal activity. Investigation is ongoing.`,
      dateFiled: randomPastDate(1).toISOString().split('T')[0],
      status: [
        'Open', 'Under Investigation', 'Pending Review', 
        'Solved', 'Closed', 'Court Proceedings', 'Archived'
      ][Math.floor(Math.random() * 7)],
      priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
      evidence: "Physical evidence collected from scene. Witness statements recorded.",
      witnesses: Array(Math.floor(Math.random() * 3)).fill(null).map(() => {
        const { firstName, lastName } = getRandomName();
        return `${firstName} ${lastName}`;
      }).join(', '),
    });
  }
  
  try {
    const insertedFirs = await db.insert(firDetails).values(firInserts).returning();
    console.log(`${insertedFirs.length} FIR details seeded successfully`);
    return insertedFirs;
  } catch (error) {
    console.error("Error seeding FIR details:", error);
    throw error;
  }
}

// Seed activities
async function seedActivities(firs: any[], officers: any[]) {
  console.log(`Seeding ${SEED_COUNT.ACTIVITIES} activities...`);
  
  const activityInserts = [];
  
  const activityDescriptions = [
    'Updated case status',
    'Added new evidence to the case',
    'Interviewed witness',
    'Conducted site inspection',
    'Filed a report',
    'Collected forensic evidence',
    'Conducted suspect interview',
    'Updated case notes',
    'Coordinated with other departments',
    'Review of case details'
  ];
  
  for (let i = 0; i < SEED_COUNT.ACTIVITIES; i++) {
    // Link to a random FIR
    const firIndex = Math.floor(Math.random() * firs.length);
    const fir = firs[firIndex];
    
    // Select a random officer, preferably the assigned one or another
    const assignedOfficer = officers.find(o => o.id === fir.officerId);
    const officer = assignedOfficer || officers[Math.floor(Math.random() * officers.length)];
    
    activityInserts.push({
      description: activityDescriptions[Math.floor(Math.random() * activityDescriptions.length)],
      activityType: ['UPDATE', 'CREATE', 'DELETE', 'REVIEW', 'ASSIGN'][Math.floor(Math.random() * 5)],
      userId: officer.id,
      userRole: 'officer',
      entityId: fir.id,
      entityType: 'FIR',
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random time in the last 30 days
    });
  }
  
  try {
    const insertedActivities = await db.insert(activities).values(activityInserts).returning();
    console.log(`${insertedActivities.length} activities seeded successfully`);
    return insertedActivities;
  } catch (error) {
    console.error("Error seeding activities:", error);
    throw error;
  }
}

// Create a sample user for demo purposes
async function createSampleUser() {
  console.log("Creating a sample demo user...");
  
  try {
    // First check if the user already exists
    const existingUser = await db.select().from(users).where(eq(users.id, "demo-user-id")).limit(1);
    
    if (existingUser.length === 0) {
      // Create demo user
      const [user] = await db.insert(users).values({
        id: "demo-user-id",
        email: "demo@crms.example",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
        role: "admin"
      }).returning();
      
      // Create profile for the user
      await db.insert(profiles).values({
        userId: user.id,
        address: generateAddress(),
        phoneNumber: generatePhoneNumber(),
        email: user.email
      });
      
      console.log("Demo user created successfully");
    } else {
      console.log("Demo user already exists, skipping creation");
    }
  } catch (error) {
    console.error("Error creating demo user:", error);
    throw error;
  }
}

// Main function to run all seeding functions
async function seedDatabase() {
  console.log("Starting database seeding process...");
  
  try {
    await clearDatabase();
    
    const stations = await seedPoliceStations();
    const officers = await seedOfficers(stations);
    const crimeTypesList = await seedCrimeTypes();
    const criminalsList = await seedCriminals(crimeTypesList);
    const firs = await seedFirDetails(stations, officers, criminalsList);
    await seedActivities(firs, officers);
    
    await createSampleUser();
    
    console.log("Database seeding completed successfully");
    
    // Print total counts
    console.log("Records created:");
    console.log(`- Police Stations: ${stations.length}`);
    console.log(`- Officers: ${officers.length}`);
    console.log(`- Crime Types: ${crimeTypesList.length}`);
    console.log(`- Criminals: ${criminalsList.length}`);
    console.log(`- FIR Details: ${firs.length}`);
    console.log(`- Total records: ${stations.length + officers.length + crimeTypesList.length + criminalsList.length + firs.length + SEED_COUNT.ACTIVITIES}`);
    
    return {
      stations: stations.length,
      officers: officers.length,
      crimeTypes: crimeTypesList.length,
      criminals: criminalsList.length,
      firs: firs.length,
      activities: SEED_COUNT.ACTIVITIES,
      total: stations.length + officers.length + crimeTypesList.length + criminalsList.length + firs.length + SEED_COUNT.ACTIVITIES
    };
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
}

export { seedDatabase };