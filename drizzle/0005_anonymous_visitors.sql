CREATE TABLE `anonymous_visitors` (
	`visitor_id` text PRIMARY KEY NOT NULL,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`started_at` text,
	`converted_at` text
);
--> statement-breakpoint
CREATE INDEX `anonymous_visitors_last_seen_idx` ON `anonymous_visitors` (`last_seen_at`);
--> statement-breakpoint
CREATE INDEX `anonymous_visitors_started_idx` ON `anonymous_visitors` (`started_at`);
--> statement-breakpoint
CREATE INDEX `anonymous_visitors_converted_idx` ON `anonymous_visitors` (`converted_at`);
