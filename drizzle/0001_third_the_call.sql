CREATE TABLE `assessment_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`state` text NOT NULL,
	`created_at` integer NOT NULL,
	`lease_until` integer NOT NULL,
	`result` text,
	`error` text
);
--> statement-breakpoint
CREATE TABLE `assessment_usage` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`day` text NOT NULL,
	`calls` integer NOT NULL
);
