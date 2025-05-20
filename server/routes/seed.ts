import { Request, Response } from "express";
import { seedDatabase } from "../scripts/seedDatabase";
import { isAuthenticated } from "../replitAuth";

export async function setupSeedRoutes(app: any) {
  // Protected route to seed the database
  app.post("/api/seed", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check if user is admin
      const user = req.user as any;
      if (user?.claims?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden. Only admins can seed the database." });
      }
      
      const result = await seedDatabase();
      res.status(200).json({
        message: "Database seeded successfully",
        recordsCreated: result
      });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Public route to get seeding status
  app.get("/api/seed/status", async (req: Request, res: Response) => {
    try {
      res.status(200).json({
        message: "Seeding status check successful",
        canSeed: true
      });
    } catch (error) {
      console.error("Error checking seed status:", error);
      res.status(500).json({ message: "Failed to check seed status" });
    }
  });
}