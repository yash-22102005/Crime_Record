import {
  users,
  profiles,
  policeStations,
  officers,
  criminals,
  crimeTypes,
  firDetails,
  crimes,
  activities,
  type User,
  type Profile,
  type PoliceStation,
  type Officer,
  type Criminal,
  type CrimeType,
  type FirDetail,
  type Crime,
  type Activity,
  type InsertUser,
  type InsertProfile,
  type InsertPoliceStation,
  type InsertOfficer,
  type InsertCriminal,
  type InsertCrimeType,
  type InsertFirDetail,
  type InsertCrime,
  type InsertActivity,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { IStorage } from "./storage";
import { StatsData, ChartData } from "../client/src/types";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
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
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile || undefined;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || undefined;
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
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return profile;
  }

  async upsertProfile(profileData: InsertProfile): Promise<Profile> {
    // Check if profile exists
    const existingProfile = await this.getProfileByUserId(profileData.userId);
    
    if (existingProfile) {
      // Update existing profile
      return this.updateProfile(existingProfile.id, profileData);
    } else {
      // Create new profile
      return this.createProfile(profileData);
    }
  }

  async deleteProfile(id: number): Promise<void> {
    await db.delete(profiles).where(eq(profiles.id, id));
  }

  // Police station operations
  async getPoliceStation(id: string): Promise<PoliceStation | undefined> {
    const [station] = await db.select().from(policeStations).where(eq(policeStations.id, id));
    return station || undefined;
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
      .set({ ...stationData, updatedAt: new Date() })
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
    return officer || undefined;
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
      .set({ ...officerData, updatedAt: new Date() })
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
    return criminal || undefined;
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
      .set({ ...criminalData, updatedAt: new Date() })
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
    return fir || undefined;
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
      .set({ ...firData, updatedAt: new Date() })
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
    return activity || undefined;
  }

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.timestamp));
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return activity;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<StatsData> {
    const crimesCount = await db.select({ count: sql<number>`count(*)` }).from(crimes);
    const activeCasesCount = await db.select({ count: sql<number>`count(*)` }).from(firDetails).where(eq(firDetails.status, 'investigating'));
    const criminalsCount = await db.select({ count: sql<number>`count(*)` }).from(criminals);
    const firCount = await db.select({ count: sql<number>`count(*)` }).from(firDetails);
    
    return {
      totalCrimes: crimesCount[0]?.count || 0,
      activeCases: activeCasesCount[0]?.count || 0,
      criminalRecords: criminalsCount[0]?.count || 0,
      firReports: firCount[0]?.count || 0,
    };
  }

  async getChartData(): Promise<ChartData> {
    // Demo data for now - in a real implementation would aggregate from database
    return {
      crimeTypeDistribution: {
        labels: ["Theft", "Assault", "Fraud", "Vandalism", "Other"],
        data: [25, 18, 15, 12, 30],
      },
      monthlyCrimeTrends: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        data: [12, 19, 15, 8, 22, 14],
      },
    };
  }
}