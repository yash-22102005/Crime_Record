import {
  User,
  InsertUser,
  Profile,
  InsertProfile,
  PoliceStation,
  InsertPoliceStation,
  Officer,
  InsertOfficer,
  Criminal,
  InsertCriminal,
  FirDetail,
  InsertFirDetail,
  Crime,
  InsertCrime,
  Activity,
  InsertActivity,
  CrimeType,
  InsertCrimeType,
} from "@shared/schema";
import { generateId } from "../client/src/lib/utils";
import { StatsData, ChartData } from "../client/src/types";

// Import the UpsertUser type from DatabaseStorage
import { UpsertUser } from './DatabaseStorage';

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  upsertUser(userData: UpsertUser): Promise<User>;

  // Profile operations
  getProfile(id: number): Promise<Profile | undefined>;
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: Partial<InsertProfile>): Promise<Profile>;
  upsertProfile(profile: InsertProfile): Promise<Profile>;
  deleteProfile(id: number): Promise<void>;

  // Police station operations
  getPoliceStation(id: string): Promise<PoliceStation | undefined>;
  getPoliceStations(): Promise<PoliceStation[]>;
  createPoliceStation(station: InsertPoliceStation): Promise<PoliceStation>;
  updatePoliceStation(id: string, station: Partial<InsertPoliceStation>): Promise<PoliceStation>;
  deletePoliceStation(id: string): Promise<void>;

  // Officer operations
  getOfficer(id: string): Promise<Officer | undefined>;
  getOfficers(): Promise<Officer[]>;
  getOfficersByStation(stationId: string): Promise<Officer[]>;
  createOfficer(officer: InsertOfficer): Promise<Officer>;
  updateOfficer(id: string, officer: Partial<InsertOfficer>): Promise<Officer>;
  deleteOfficer(id: string): Promise<void>;

  // Criminal operations
  getCriminal(id: string): Promise<Criminal | undefined>;
  getCriminals(): Promise<Criminal[]>;
  createCriminal(criminal: InsertCriminal): Promise<Criminal>;
  updateCriminal(id: string, criminal: Partial<InsertCriminal>): Promise<Criminal>;
  deleteCriminal(id: string): Promise<void>;

  // FIR operations
  getFirDetail(id: string): Promise<FirDetail | undefined>;
  getFirDetails(): Promise<FirDetail[]>;
  createFirDetail(fir: InsertFirDetail): Promise<FirDetail>;
  updateFirDetail(id: string, fir: Partial<InsertFirDetail>): Promise<FirDetail>;
  deleteFirDetail(id: string): Promise<void>;

  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Dashboard operations
  getDashboardStats(): Promise<StatsData>;
  getChartData(): Promise<ChartData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private policeStations: Map<string, PoliceStation>;
  private officers: Map<string, Officer>;
  private criminals: Map<string, Criminal>;
  private crimeTypes: Map<number, CrimeType>;
  private firDetails: Map<string, FirDetail>;
  private crimes: Map<string, Crime>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentCrimeTypeId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.policeStations = new Map();
    this.officers = new Map();
    this.criminals = new Map();
    this.crimeTypes = new Map();
    this.firDetails = new Map();
    this.crimes = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentCrimeTypeId = 1;
    this.currentActivityId = 1;

    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize Police Stations
    const stationIds = ['PS-001', 'PS-002', 'PS-003'];
    const stationNames = ['Central Police Station', 'North District Station', 'South Precinct'];
    const stationAddresses = [
      '123 Main Street, Downtown',
      '456 North Avenue, Northside',
      '789 South Boulevard, Southside'
    ];
    const stationContacts = ['555-1234', '555-5678', '555-9012'];

    for (let i = 0; i < stationIds.length; i++) {
      this.policeStations.set(stationIds[i], {
        id: stationIds[i],
        name: stationNames[i],
        address: stationAddresses[i],
        contact: stationContacts[i],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Initialize Officers
    const officerIds = ['OFF-001', 'OFF-002', 'OFF-003', 'OFF-004'];
    const officerNames = ['John Johnson', 'Maria Martinez', 'David Williams', 'Sarah Taylor'];
    const badgeNumbers = ['B12345', 'B23456', 'B34567', 'B45678'];
    const ranks = ['Officer', 'Sergeant', 'Inspector', 'Chief Inspector'];
    const officerStationIds = ['PS-001', 'PS-002', 'PS-003', 'PS-001'];

    for (let i = 0; i < officerIds.length; i++) {
      this.officers.set(officerIds[i], {
        id: officerIds[i],
        name: officerNames[i],
        badgeNumber: badgeNumbers[i],
        rank: ranks[i],
        stationId: officerStationIds[i],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Update station officer counts
    const stationOfficerCounts = new Map<string, number>();
    for (const officer of this.officers.values()) {
      const count = stationOfficerCounts.get(officer.stationId) || 0;
      stationOfficerCounts.set(officer.stationId, count + 1);
    }

    for (const [stationId, count] of stationOfficerCounts.entries()) {
      const station = this.policeStations.get(stationId);
      if (station) {
        this.policeStations.set(stationId, {
          ...station,
          officerCount: count
        } as PoliceStation);
      }
    }

    // Initialize Crime Types
    const crimeTypeNames = ['Theft', 'Assault', 'Burglary', 'Fraud', 'Drug-related', 'Vehicle Theft', 'Homicide'];
    const severities = ['medium', 'high', 'medium', 'medium', 'high', 'medium', 'high'];

    for (let i = 0; i < crimeTypeNames.length; i++) {
      this.crimeTypes.set(this.currentCrimeTypeId, {
        id: this.currentCrimeTypeId,
        name: crimeTypeNames[i],
        description: `${crimeTypeNames[i]} crimes`,
        severity: severities[i] as 'low' | 'medium' | 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      this.currentCrimeTypeId++;
    }

    // Initialize Criminals
    const criminalIds = ['CRIM-2023-0145', 'CRIM-2023-0146', 'CRIM-2023-0147'];
    const firstNames = ['James', 'Robert', 'Michael'];
    const lastNames = ['Wilson', 'Johnson', 'Davis'];
    const ages = [34, 29, 42];
    const genders = ['male', 'male', 'male'];
    const statuses = ['wanted', 'incarcerated', 'released'];
    const lastCrimeDates = ['2023-04-12', '2023-03-28', '2022-11-15'];
    const photoUrls = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    ];
    const crimeTypesList = [
      ['Theft', 'Burglary'],
      ['Assault'],
      ['Fraud']
    ];

    for (let i = 0; i < criminalIds.length; i++) {
      this.criminals.set(criminalIds[i], {
        id: criminalIds[i],
        firstName: firstNames[i],
        lastName: lastNames[i],
        age: ages[i],
        gender: genders[i],
        status: statuses[i] as 'active' | 'incarcerated' | 'released' | 'wanted',
        lastCrimeDate: new Date(lastCrimeDates[i]),
        photoUrl: photoUrls[i],
        crimeTypes: crimeTypesList[i],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Initialize FIR Details
    const firIds = ['FIR-2023-0456', 'FIR-2023-0457', 'FIR-2023-0458'];
    const complainantNames = ['Sarah Johnson', 'David Garcia', 'Michael Chen'];
    const complainantIds = ['987456321', '123789456', '456123789'];
    const dateFileds = ['2023-05-10', '2023-05-12', '2023-05-15'];
    const incidentTypes = ['Theft', 'Vehicle Theft', 'Assault'];
    const firStationIds = ['PS-001', 'PS-003', 'PS-002'];
    const firStatuses = ['investigating', 'new', 'resolved'];

    for (let i = 0; i < firIds.length; i++) {
      const station = this.policeStations.get(firStationIds[i]);
      this.firDetails.set(firIds[i], {
        id: firIds[i],
        complainantName: complainantNames[i],
        complainantId: complainantIds[i],
        userId: null,
        dateFiled: new Date(dateFileds[i]),
        incidentType: incidentTypes[i],
        stationId: firStationIds[i],
        stationName: station ? station.name : '',
        status: firStatuses[i] as 'new' | 'investigating' | 'resolved' | 'closed',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Initialize Activities
    const activityDescriptions = [
      'New case filed (Theft)',
      'Case #CR-2023-0584 updated',
      'Suspect apprehended for Case #CR-2023-0492'
    ];
    const activityTypes = ['new', 'updated', 'progress'];
    const activityLocations = ['Central Police Station', 'North District', 'South Precinct'];
    const activityOfficers = ['Officer Johnson', 'Officer Martinez', 'Officer Williams'];
    const timestamps = [
      new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
    ];

    for (let i = 0; i < activityDescriptions.length; i++) {
      this.activities.set(this.currentActivityId, {
        id: this.currentActivityId,
        description: activityDescriptions[i],
        type: activityTypes[i] as 'new' | 'updated' | 'progress',
        location: activityLocations[i],
        officer: activityOfficers[i],
        timestamp: timestamps[i]
      });
      this.currentActivityId++;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateUser: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    const updatedUser: User = { 
      ...user, 
      ...updateUser, 
      updatedAt: new Date() 
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  // Profile methods
  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUserId(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.userId === userId
    );
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const profile: Profile = { 
      ...insertProfile, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: number, updateProfile: Partial<InsertProfile>): Promise<Profile> {
    const profile = await this.getProfile(id);
    if (!profile) {
      throw new Error(`Profile with ID ${id} not found`);
    }
    
    const updatedProfile: Profile = { 
      ...profile, 
      ...updateProfile, 
      updatedAt: new Date() 
    };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async upsertProfile(profileData: InsertProfile): Promise<Profile> {
    const existingProfile = await this.getProfileByUserId(profileData.userId);
    if (existingProfile) {
      return this.updateProfile(existingProfile.id, profileData);
    } else {
      return this.createProfile(profileData);
    }
  }

  async deleteProfile(id: number): Promise<void> {
    this.profiles.delete(id);
  }

  // Police station methods
  async getPoliceStation(id: string): Promise<PoliceStation | undefined> {
    return this.policeStations.get(id);
  }

  async getPoliceStations(): Promise<PoliceStation[]> {
    return Array.from(this.policeStations.values());
  }

  async createPoliceStation(station: InsertPoliceStation): Promise<PoliceStation> {
    const policeStation: PoliceStation = { 
      ...station, 
      officerCount: 0,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.policeStations.set(station.id, policeStation);
    
    // Create activity for new station
    await this.createActivity({
      description: `New police station added (${station.name})`,
      type: 'new',
      location: station.name,
      officer: 'Admin'
    });
    
    return policeStation;
  }

  async updatePoliceStation(id: string, updateStation: Partial<InsertPoliceStation>): Promise<PoliceStation> {
    const station = await this.getPoliceStation(id);
    if (!station) {
      throw new Error(`Police station with ID ${id} not found`);
    }
    
    const updatedStation: PoliceStation = { 
      ...station, 
      ...updateStation, 
      updatedAt: new Date() 
    };
    this.policeStations.set(id, updatedStation);
    
    // Create activity for updated station
    await this.createActivity({
      description: `Police station updated (${updatedStation.name})`,
      type: 'updated',
      location: updatedStation.name,
      officer: 'Admin'
    });
    
    return updatedStation;
  }

  async deletePoliceStation(id: string): Promise<void> {
    const station = await this.getPoliceStation(id);
    this.policeStations.delete(id);
    
    if (station) {
      // Create activity for deleted station
      await this.createActivity({
        description: `Police station deleted (${station.name})`,
        type: 'updated',
        location: station.name,
        officer: 'Admin'
      });
    }
  }

  // Officer methods
  async getOfficer(id: string): Promise<Officer | undefined> {
    return this.officers.get(id);
  }

  async getOfficers(): Promise<Officer[]> {
    return Array.from(this.officers.values());
  }

  async getOfficersByStation(stationId: string): Promise<Officer[]> {
    return Array.from(this.officers.values()).filter(
      (officer) => officer.stationId === stationId
    );
  }

  async createOfficer(officer: InsertOfficer): Promise<Officer> {
    const newOfficer: Officer = { 
      ...officer, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.officers.set(officer.id, newOfficer);
    
    // Update officer count in station
    const station = await this.getPoliceStation(officer.stationId);
    if (station) {
      const updatedStation: PoliceStation = {
        ...station,
        officerCount: (station.officerCount || 0) + 1,
        updatedAt: new Date()
      };
      this.policeStations.set(station.id, updatedStation);
    }
    
    // Create activity for new officer
    await this.createActivity({
      description: `New officer added (${officer.name})`,
      type: 'new',
      location: station?.name || 'Unknown',
      officer: 'Admin'
    });
    
    return newOfficer;
  }

  async updateOfficer(id: string, updateOfficer: Partial<InsertOfficer>): Promise<Officer> {
    const officer = await this.getOfficer(id);
    if (!officer) {
      throw new Error(`Officer with ID ${id} not found`);
    }
    
    // Check if station changed
    const stationChanged = updateOfficer.stationId && updateOfficer.stationId !== officer.stationId;
    
    if (stationChanged) {
      // Decrease officer count in old station
      const oldStation = await this.getPoliceStation(officer.stationId);
      if (oldStation) {
        const updatedOldStation: PoliceStation = {
          ...oldStation,
          officerCount: Math.max(0, (oldStation.officerCount || 0) - 1),
          updatedAt: new Date()
        };
        this.policeStations.set(oldStation.id, updatedOldStation);
      }
      
      // Increase officer count in new station
      const newStation = await this.getPoliceStation(updateOfficer.stationId!);
      if (newStation) {
        const updatedNewStation: PoliceStation = {
          ...newStation,
          officerCount: (newStation.officerCount || 0) + 1,
          updatedAt: new Date()
        };
        this.policeStations.set(newStation.id, updatedNewStation);
      }
    }
    
    const updatedOfficer: Officer = { 
      ...officer, 
      ...updateOfficer, 
      updatedAt: new Date() 
    };
    this.officers.set(id, updatedOfficer);
    
    // Create activity for updated officer
    await this.createActivity({
      description: `Officer details updated (${updatedOfficer.name})`,
      type: 'updated',
      location: stationChanged ? 'Transferred' : 'Updated',
      officer: updatedOfficer.name
    });
    
    return updatedOfficer;
  }

  async deleteOfficer(id: string): Promise<void> {
    const officer = await this.getOfficer(id);
    if (officer) {
      // Decrease officer count in station
      const station = await this.getPoliceStation(officer.stationId);
      if (station) {
        const updatedStation: PoliceStation = {
          ...station,
          officerCount: Math.max(0, (station.officerCount || 0) - 1),
          updatedAt: new Date()
        };
        this.policeStations.set(station.id, updatedStation);
      }
      
      // Create activity for deleted officer
      await this.createActivity({
        description: `Officer removed (${officer.name})`,
        type: 'updated',
        location: station?.name || 'Unknown',
        officer: 'Admin'
      });
    }
    
    this.officers.delete(id);
  }

  // Criminal methods
  async getCriminal(id: string): Promise<Criminal | undefined> {
    return this.criminals.get(id);
  }

  async getCriminals(): Promise<Criminal[]> {
    return Array.from(this.criminals.values());
  }

  async createCriminal(criminal: InsertCriminal): Promise<Criminal> {
    const newCriminal: Criminal = { 
      ...criminal,
      crimeTypes: [],
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.criminals.set(criminal.id, newCriminal);
    
    // Create activity for new criminal
    await this.createActivity({
      description: `New criminal record added (${criminal.firstName} ${criminal.lastName})`,
      type: 'new',
      location: 'Records Department',
      officer: 'Records Officer'
    });
    
    return newCriminal;
  }

  async updateCriminal(id: string, updateCriminal: Partial<InsertCriminal>): Promise<Criminal> {
    const criminal = await this.getCriminal(id);
    if (!criminal) {
      throw new Error(`Criminal with ID ${id} not found`);
    }
    
    const updatedCriminal: Criminal = { 
      ...criminal, 
      ...updateCriminal, 
      updatedAt: new Date() 
    };
    this.criminals.set(id, updatedCriminal);
    
    // Create activity for updated criminal
    await this.createActivity({
      description: `Criminal record updated (${updatedCriminal.firstName} ${updatedCriminal.lastName})`,
      type: 'updated',
      location: 'Records Department',
      officer: 'Records Officer'
    });
    
    return updatedCriminal;
  }

  async deleteCriminal(id: string): Promise<void> {
    const criminal = await this.getCriminal(id);
    this.criminals.delete(id);
    
    if (criminal) {
      // Create activity for deleted criminal
      await this.createActivity({
        description: `Criminal record deleted (${criminal.firstName} ${criminal.lastName})`,
        type: 'updated',
        location: 'Records Department',
        officer: 'Records Officer'
      });
    }
  }

  // FIR methods
  async getFirDetail(id: string): Promise<FirDetail | undefined> {
    return this.firDetails.get(id);
  }

  async getFirDetails(): Promise<FirDetail[]> {
    return Array.from(this.firDetails.values());
  }

  async createFirDetail(fir: InsertFirDetail): Promise<FirDetail> {
    // Get station name
    const station = await this.getPoliceStation(fir.stationId);
    
    const newFir: FirDetail = { 
      ...fir,
      stationName: station ? station.name : 'Unknown',
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.firDetails.set(fir.id, newFir);
    
    // Create activity for new FIR
    await this.createActivity({
      description: `New FIR registered (${fir.incidentType})`,
      type: 'new',
      location: station?.name || 'Unknown',
      officer: 'Duty Officer'
    });
    
    return newFir;
  }

  async updateFirDetail(id: string, updateFir: Partial<InsertFirDetail>): Promise<FirDetail> {
    const fir = await this.getFirDetail(id);
    if (!fir) {
      throw new Error(`FIR with ID ${id} not found`);
    }
    
    // Update station name if stationId changes
    let stationName = fir.stationName;
    if (updateFir.stationId && updateFir.stationId !== fir.stationId) {
      const station = await this.getPoliceStation(updateFir.stationId);
      if (station) {
        stationName = station.name;
      }
    }
    
    const updatedFir: FirDetail = { 
      ...fir, 
      ...updateFir,
      stationName,
      updatedAt: new Date() 
    };
    this.firDetails.set(id, updatedFir);
    
    // Create activity for updated FIR
    await this.createActivity({
      description: `FIR updated (Case #${id})`,
      type: 'updated',
      location: updatedFir.stationName,
      officer: 'Investigating Officer'
    });
    
    return updatedFir;
  }

  async deleteFirDetail(id: string): Promise<void> {
    const fir = await this.getFirDetail(id);
    this.firDetails.delete(id);
    
    if (fir) {
      // Create activity for deleted FIR
      await this.createActivity({
        description: `FIR deleted (Case #${id})`,
        type: 'updated',
        location: fir.stationName,
        officer: 'Admin'
      });
    }
  }

  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getActivities(): Promise<Activity[]> {
    // Sort by timestamp descending (newest first)
    return Array.from(this.activities.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      timestamp: new Date() 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<StatsData> {
    const criminals = await this.getCriminals();
    const firDetails = await this.getFirDetails();
    
    // Calculate stats
    return {
      totalCrimes: this.crimes.size + criminals.length, // Use crimes + criminals for demo
      activeCases: firDetails.filter(fir => fir.status === 'new' || fir.status === 'investigating').length,
      criminalRecords: criminals.length,
      firReports: firDetails.length
    };
  }

  async getChartData(): Promise<ChartData> {
    const criminals = await this.getCriminals();
    
    // Prepare crime type distribution data
    const crimeTypesCount = new Map<string, number>();
    criminals.forEach(criminal => {
      criminal.crimeTypes.forEach(type => {
        const count = crimeTypesCount.get(type) || 0;
        crimeTypesCount.set(type, count + 1);
      });
    });
    
    const crimeTypeLabels = Array.from(crimeTypesCount.keys());
    const crimeTypeData = crimeTypeLabels.map(label => crimeTypesCount.get(label) || 0);
    
    // Prepare monthly crime trends data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCrimeData = [12, 19, 15, 20, 22, 18, 24, 13, 17, 14, 23, 21]; // Sample data
    
    return {
      crimeTypeDistribution: {
        labels: crimeTypeLabels,
        data: crimeTypeData
      },
      monthlyCrimeTrends: {
        labels: months,
        data: monthlyCrimeData
      }
    };
  }
}

import { DatabaseStorage } from "./DatabaseStorage";

// Use database storage for production
export const storage = new DatabaseStorage();
