import crypto from "crypto";

// Use a fallback secret for development if env is missing
const SECRET_KEY = process.env.SERVER_SECRET || "super-secret-fallback-key-change-in-production";

/**
 * Generates a unique, mathematically irreversible daily hash for a student-teacher pair.
 * This guarantees a student can only submit one review per teacher per day, 
 * without ever storing the student's ID in the database.
 */
export function generateDailyHash(studentId: string, teacherId: string): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format based on UTC
  
  // Combine all factors into a single string
  const data = `${studentId}:${teacherId}:${date}`;
  
  // Hash it using HMAC SHA-256
  return crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
}

/**
 * Generates a unique hash to track if a student has favorited a teacher.
 * This does not include a date, so a student can only favorite a teacher once permanently.
 */
export function generateFavoriteHash(studentId: string, teacherId: string): string {
  const data = `${studentId}:${teacherId}:favorite`;
  return crypto.createHmac("sha256", SECRET_KEY).update(data).digest("hex");
}
