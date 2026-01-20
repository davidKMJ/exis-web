import {
    bigint,
    check,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";
import { WORKOUT_LEVELS } from "./constants";
import { sql } from "drizzle-orm";
import { profiles } from "../users/schema";

export const workoutLevels = pgEnum(
    "workout_levels",
    WORKOUT_LEVELS.map((level) => level.value) as [string, ...string[]]
);

export const teams = pgTable(
    "teams",
    {
        team_id: bigint({ mode: "number" })
            .primaryKey()
            .generatedAlwaysAsIdentity(),
        team_name: text().notNull(),
        team_size: integer().notNull(),
        location: text().notNull(),
        workout_level: workoutLevels().notNull(),
        team_description: text().notNull(),
        created_at: timestamp().notNull().defaultNow(),
        updated_at: timestamp().notNull().defaultNow(),
        team_leader_id: uuid()
            .references(() => profiles.profile_id, { onDelete: "cascade" })
            .notNull(),
    },
    (table) => [
        check("team_size_check", sql`${table.team_size} BETWEEN 1 AND 10`),
    ]
);
