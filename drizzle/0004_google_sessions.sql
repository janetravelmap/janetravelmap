CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`full_name` text,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_owner_idx` ON `sessions` (`owner_email`);
--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);
