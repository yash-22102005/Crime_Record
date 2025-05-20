import {
  users,
  profiles,
  policeStations,
  officers,
  criminals,
  firDetails,
  activities,
  type User,
  type Profile,
  type PoliceStation,
  type Officer,
  type Criminal,
  type FirDetail,
  type Activity,
  type InsertUser,
  type InsertProfile,
  type InsertPoliceStation,
  type InsertOfficer,
  type InsertCriminal,
  type InsertFirDetail,
  type InsertActivity,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, asc, count, like } from "drizzle-orm";
import { IStorage } from "./storage";

// Define the UpsertUser type needed for Replit authentication
export type UpsertUser = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  role?: string;
};

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const { id, ...rest } = userData;
    
    try {
      // Check if user exists
      const existingUser = await this.getUser(id);
      
      if (existingUser) {
        // Update existing user
        return await this.updateUser(id, rest);
      } else {
        // Create new user
        return await this.createUser({ id, ...rest });
      }
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  // Profile operations
  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profileData: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateProfile(id: number, profileData: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  }

  async upsertProfile(profileData: InsertProfile): Promise<Profile> {
    const { userId } = profileData;
    
    try {
      // Check if profile exists for user
      const existingProfile = await this.getProfileByUserId(userId);
      
      if (existingProfile) {
        // Update existing profile
        return await this.updateProfile(existingProfile.id, profileData);
      } else {
        // Create new profile
        return await this.createProfile(profileData);
      }
    } catch (error) {
      console.error("Error upserting profile:", error);
      throw error;
    }
  }

  async deleteProfile(id: number): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  // Police station operations
  async getPoliceStation(id: string): Promise<PoliceStation | undefined> {
    const [station] = await db.select().from(policeStations).where(eq(policeStations.id, id));
    return station;
  }

  async getPoliceStations(): Promise<PoliceStation[]> {
    return await db.select().from(policeStations);
  }

  async createPoliceStation(stationData: InsertPoliceStation): Promise<PoliceStation> {
    const [station] = await db
      .insert(policeStations)
      .values(stationData)
      .returning();
    return station;
  }

  async updatePoliceStation(id: string, stationData: Partial<InsertPoliceStation>): Promise<PoliceStation> {
    const [station] = await db
      .update(policeStations)
      .set({
        ...stationData,
        updatedAt: new Date(),
      })
      .where(eq(policeStations.id, id))
      .returning();
    return station;
  }

  async deletePoliceStation(id: string): Promise<void> {
    await db.delete(policeStations).where(eq(policeStations.id, id));
  }

  // Officer operations
  async getOfficer(id: string): Promise<Officer | undefined> {
    const [officer] = await db.select().from(officers).where(eq(officers.id, id));
    return officer;
  }

  async getOfficers(): Promise<Officer[]> {
    return await db.select().from(officers);
  }

  async getOfficersByStation(stationId: string): Promise<Officer[]> {
    return await db.select().from(officers).where(eq(officers.stationId, stationId));
  }

  async createOfficer(officerData: InsertOfficer): Promise<Officer> {
    const [officer] = await db
      .insert(officers)
      .values(officerData)
      .returning();
    return officer;
  }

  async updateOfficer(id: string, officerData: Partial<InsertOfficer>): Promise<Officer> {
    const [officer] = await db
      .update(officers)
      .set({
        ...officerData,
        updatedAt: new Date(),
      })
      .where(eq(officers.id, id))
      .returning();
    return officer;
  }

  async deleteOfficer(id: string): Promise<void> {
    await db.delete(officers).where(eq(officers.id, id));
  }

  // Criminal operations
  async getCriminal(id: string): Promise<Criminal | undefined> {
    const [criminal] = await db.select().from(criminals).where(eq(criminals.id, id));
    return criminal;
  }

  async getCriminals(): Promise<Criminal[]> {
    return await db.select().from(criminals);
  }

  async createCriminal(criminalData: InsertCriminal): Promise<Criminal> {
    const [criminal] = await db
      .insert(criminals)
      .values(criminalData)
      .returning();
    return criminal;
  }

  async updateCriminal(id: string, criminalData: Partial<InsertCriminal>): Promise<Criminal> {
    const [criminal] = await db
      .update(criminals)
      .set({
        ...criminalData,
        updatedAt: new Date(),
      })
      .where(eq(criminals.id, id))
      .returning();
    return criminal;
  }

  async deleteCriminal(id: string): Promise<void> {
    await db.delete(criminals).where(eq(criminals.id, id));
  }

  // FIR operations
  async getFirDetail(id: string): Promise<FirDetail | undefined> {
    const [fir] = await db.select().from(firDetails).where(eq(firDetails.id, id));
    return fir;
  }

  async getFirDetails(): Promise<FirDetail[]> {
    return await db.select().from(firDetails);
  }

  async createFirDetail(firData: InsertFirDetail): Promise<FirDetail> {
    const [fir] = await db
      .insert(firDetails)
      .values(firData)
      .returning();
    return fir;
  }

  async updateFirDetail(id: string, firData: Partial<InsertFirDetail>): Promise<FirDetail> {
    const [fir] = await db
      .update(firDetails)
      .set({
        ...firData,
        updatedAt: new Date(),
      })
      .where(eq(firDetails.id, id))
      .returning();
    return fir;
  }

  async deleteFirDetail(id: string): Promise<void> {
    await db.delete(firDetails).where(eq(firDetails.id, id));
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.timestamp)).limit(10);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values({
        ...activityData,
        timestamp: new Date(),
      })
      .returning();
    return activity;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<StatsData> {
    const criminals = await db.select().from(criminals);
    const firs = await db.select().from(firDetails);
    const stations = await db.select().from(policeStations);
    const allOfficers = await db.select().from(officers);

    return {
      totalCrimes: firs.length,
      activeCases: firs.filter(fir => fir.status === 'open').length,
      criminalCount: criminals.length,
      officerCount: allOfficers.length,
      stationCount: stations.length,
      recentCriminals: criminals.slice(0, 5),
    };
  }

  async getChartData(): Promise<ChartData> {
    const criminals = await db.select().from(criminals);
    const firs = await db.select().from(firDetails);

    // Simulate crime type distribution
    const crimeTypeLabels = ["Theft", "Assault", "Fraud", "Homicide", "Others"];
    const crimeTypeData = [35, 20, 15, 10, 20];

    // Simulate monthly crime rate (last 6 months)
    const monthLabels = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();
    
    const monthlyData = [25, 30, 20, 40, 35, 45];

    return {
      crimeTypeDistribution: {
        labels: crimeTypeLabels,
        data: crimeTypeData,
      },
      monthlyCrimeRate: {
        labels: monthLabels,
        data: monthlyData,
      },
      caseStatusDistribution: {
        labels: ["Open", "Closed", "Under Investigation"],
        data: [
          firs.filter(fir => fir.status === 'open').length,
          firs.filter(fir => fir.status === 'closed').length,
          firs.filter(fir => fir.status === 'under-investigation').length,
        ],
      },
    };
  }
}

// Types for dashboard operations
export interface StatsData {
  totalCrimes: number;
  activeCases: number;
  criminalCount: number;
  officerCount: number;
  stationCount: number;
  recentCriminals: Criminal[];
}

export interface ChartData {
  crimeTypeDistribution: {
    labels: string[];
    data: number[];
  };
  monthlyCrimeRate: {
    labels: string[];
    data: number[];
  };
  caseStatusDistribution: {
    labels: string[];
    data: number[];
  };
}