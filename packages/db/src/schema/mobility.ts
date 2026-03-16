import { pgTable, text, timestamp, uuid, integer, pgEnum, decimal } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const vehicleStatusEnum = pgEnum("vehicle_status", ["active", "maintenance", "inactive"]);
export const driverStatusEnum = pgEnum("driver_status", ["active", "off_duty", "suspended"]);
export const tripStatusEnum = pgEnum("trip_status", ["scheduled", "in_progress", "completed", "cancelled"]);
export const stopStatusEnum = pgEnum("stop_status", ["pending", "arrived", "departed"]);
export const incidentSeverityEnum = pgEnum("incident_severity", ["low", "medium", "high", "critical"]);
export const incidentStatusEnum = pgEnum("incident_status", ["detected", "resolved", "cancelled"]);

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  licensePlate: text("license_plate").notNull(),
  status: vehicleStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  status: driverStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stops = pgTable("stops", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  routeName: text("route_name").notNull(),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  status: tripStatusEnum("status").notNull().default("scheduled"),
  scheduledDeparture: timestamp("scheduled_departure").notNull(),
  actualDeparture: timestamp("actual_departure"),
  scheduledArrival: timestamp("scheduled_arrival").notNull(),
  actualArrival: timestamp("actual_arrival"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tripStops = pgTable("trip_stops", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  stopId: uuid("stop_id").notNull().references(() => stops.id),
  stopOrder: integer("stop_order").notNull(),
  status: stopStatusEnum("status").notNull().default("pending"),
  arrivalTime: timestamp("arrival_time"),
  departureTime: timestamp("departure_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  tripId: uuid("trip_id").references(() => trips.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., "delay", "breakdown", "no-show"
  severity: incidentSeverityEnum("severity").notNull().default("medium"),
  status: incidentStatusEnum("status").notNull().default("detected"),
  description: text("description"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
