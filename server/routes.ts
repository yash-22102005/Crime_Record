import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserSchema, 
  insertProfileSchema, 
  insertPoliceStationSchema,
  insertOfficerSchema,
  insertCriminalSchema,
  insertFirDetailSchema,
  insertCrimeSchema,
  insertActivitySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Replit authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // API routes
  
  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Failed to create user", error });
    }
  });

  // Profile
  app.get("/api/profile", async (req, res) => {
    try {
      // In a real app, this would use req.user.id from auth middleware
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const profile = await storage.getProfileByUserId(userId);
      res.json(profile || { userId, email: "", phoneNumber: "", address: "" });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profile", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.upsertProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ message: "Failed to update profile", error });
    }
  });

  // Police Stations
  app.get("/api/police-stations", async (req, res) => {
    try {
      const stations = await storage.getPoliceStations();
      res.json(stations);
    } catch (error) {
      console.error("Error fetching police stations:", error);
      res.status(500).json({ message: "Failed to fetch police stations" });
    }
  });

  app.get("/api/police-stations/:id", async (req, res) => {
    try {
      const station = await storage.getPoliceStation(req.params.id);
      if (!station) {
        return res.status(404).json({ message: "Police station not found" });
      }
      res.json(station);
    } catch (error) {
      console.error("Error fetching police station:", error);
      res.status(500).json({ message: "Failed to fetch police station" });
    }
  });

  app.post("/api/police-stations", async (req, res) => {
    try {
      const stationData = insertPoliceStationSchema.parse(req.body);
      const station = await storage.createPoliceStation(stationData);
      res.status(201).json(station);
    } catch (error) {
      console.error("Error creating police station:", error);
      res.status(400).json({ message: "Failed to create police station", error });
    }
  });

  app.patch("/api/police-stations/:id", async (req, res) => {
    try {
      const stationData = insertPoliceStationSchema.parse(req.body);
      const station = await storage.updatePoliceStation(req.params.id, stationData);
      res.json(station);
    } catch (error) {
      console.error("Error updating police station:", error);
      res.status(400).json({ message: "Failed to update police station", error });
    }
  });

  app.delete("/api/police-stations/:id", async (req, res) => {
    try {
      await storage.deletePoliceStation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting police station:", error);
      res.status(500).json({ message: "Failed to delete police station" });
    }
  });

  // Officers
  app.get("/api/officers", async (req, res) => {
    try {
      const officers = await storage.getOfficers();
      res.json(officers);
    } catch (error) {
      console.error("Error fetching officers:", error);
      res.status(500).json({ message: "Failed to fetch officers" });
    }
  });

  app.get("/api/officers/:id", async (req, res) => {
    try {
      const officer = await storage.getOfficer(req.params.id);
      if (!officer) {
        return res.status(404).json({ message: "Officer not found" });
      }
      res.json(officer);
    } catch (error) {
      console.error("Error fetching officer:", error);
      res.status(500).json({ message: "Failed to fetch officer" });
    }
  });

  app.post("/api/officers", async (req, res) => {
    try {
      const officerData = insertOfficerSchema.parse(req.body);
      const officer = await storage.createOfficer(officerData);
      res.status(201).json(officer);
    } catch (error) {
      console.error("Error creating officer:", error);
      res.status(400).json({ message: "Failed to create officer", error });
    }
  });

  app.patch("/api/officers/:id", async (req, res) => {
    try {
      const officerData = insertOfficerSchema.parse(req.body);
      const officer = await storage.updateOfficer(req.params.id, officerData);
      res.json(officer);
    } catch (error) {
      console.error("Error updating officer:", error);
      res.status(400).json({ message: "Failed to update officer", error });
    }
  });

  app.delete("/api/officers/:id", async (req, res) => {
    try {
      await storage.deleteOfficer(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting officer:", error);
      res.status(500).json({ message: "Failed to delete officer" });
    }
  });

  // Criminals
  app.get("/api/criminals", async (req, res) => {
    try {
      const criminals = await storage.getCriminals();
      res.json(criminals);
    } catch (error) {
      console.error("Error fetching criminals:", error);
      res.status(500).json({ message: "Failed to fetch criminals" });
    }
  });

  app.get("/api/criminals/:id", async (req, res) => {
    try {
      const criminal = await storage.getCriminal(req.params.id);
      if (!criminal) {
        return res.status(404).json({ message: "Criminal not found" });
      }
      res.json(criminal);
    } catch (error) {
      console.error("Error fetching criminal:", error);
      res.status(500).json({ message: "Failed to fetch criminal" });
    }
  });

  app.post("/api/criminals", async (req, res) => {
    try {
      const criminalData = insertCriminalSchema.parse(req.body);
      const criminal = await storage.createCriminal(criminalData);
      res.status(201).json(criminal);
    } catch (error) {
      console.error("Error creating criminal:", error);
      res.status(400).json({ message: "Failed to create criminal", error });
    }
  });

  app.patch("/api/criminals/:id", async (req, res) => {
    try {
      const criminalData = insertCriminalSchema.parse(req.body);
      const criminal = await storage.updateCriminal(req.params.id, criminalData);
      res.json(criminal);
    } catch (error) {
      console.error("Error updating criminal:", error);
      res.status(400).json({ message: "Failed to update criminal", error });
    }
  });

  app.delete("/api/criminals/:id", async (req, res) => {
    try {
      await storage.deleteCriminal(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting criminal:", error);
      res.status(500).json({ message: "Failed to delete criminal" });
    }
  });

  // FIR Details
  app.get("/api/fir", async (req, res) => {
    try {
      const firDetails = await storage.getFirDetails();
      res.json(firDetails);
    } catch (error) {
      console.error("Error fetching FIR details:", error);
      res.status(500).json({ message: "Failed to fetch FIR details" });
    }
  });

  app.get("/api/fir/:id", async (req, res) => {
    try {
      const firDetail = await storage.getFirDetail(req.params.id);
      if (!firDetail) {
        return res.status(404).json({ message: "FIR detail not found" });
      }
      res.json(firDetail);
    } catch (error) {
      console.error("Error fetching FIR detail:", error);
      res.status(500).json({ message: "Failed to fetch FIR detail" });
    }
  });

  app.post("/api/fir", async (req, res) => {
    try {
      const firData = insertFirDetailSchema.parse(req.body);
      const firDetail = await storage.createFirDetail(firData);
      res.status(201).json(firDetail);
    } catch (error) {
      console.error("Error creating FIR detail:", error);
      res.status(400).json({ message: "Failed to create FIR detail", error });
    }
  });

  app.patch("/api/fir/:id", async (req, res) => {
    try {
      const firData = insertFirDetailSchema.parse(req.body);
      const firDetail = await storage.updateFirDetail(req.params.id, firData);
      res.json(firDetail);
    } catch (error) {
      console.error("Error updating FIR detail:", error);
      res.status(400).json({ message: "Failed to update FIR detail", error });
    }
  });

  app.delete("/api/fir/:id", async (req, res) => {
    try {
      await storage.deleteFirDetail(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting FIR detail:", error);
      res.status(500).json({ message: "Failed to delete FIR detail" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get("/api/dashboard/charts", async (req, res) => {
    try {
      const chartData = await storage.getChartData();
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
