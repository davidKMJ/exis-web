ALTER TABLE "sets" DROP CONSTRAINT "sets_workout_id_workouts_workout_id_fk";
--> statement-breakpoint
ALTER TABLE "sets" ADD COLUMN "exercise_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_exercise_id_workouts_workout_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."workouts"("workout_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" DROP COLUMN "workout_id";