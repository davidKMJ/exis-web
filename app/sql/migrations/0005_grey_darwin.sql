ALTER TABLE "sets" DROP CONSTRAINT "sets_exercise_id_workouts_workout_id_fk";
--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_exercise_id_exercises_exercise_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("exercise_id") ON DELETE cascade ON UPDATE no action;