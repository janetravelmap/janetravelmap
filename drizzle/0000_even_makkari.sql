CREATE TABLE `profiles` (
	`owner_email` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`country` text NOT NULL,
	`country_id` text NOT NULL,
	`city` text NOT NULL,
	`date` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '#147fe5' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `trips_owner_date_idx` ON `trips` (`owner_email`,`date`);