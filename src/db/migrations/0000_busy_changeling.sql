CREATE TABLE `config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`hourly_rate` real DEFAULT 7000,
	`overtime_rate` real DEFAULT 1.25,
	`night_surcharge` real DEFAULT 1.35,
	`holiday_surcharge` real DEFAULT 1.75,
	`sunday_surcharge` real DEFAULT 1.75,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `config_user_id_unique` ON `config` (`user_id`);--> statement-breakpoint
CREATE TABLE `__drizzle_migrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text,
	`regular_hours` real DEFAULT 0,
	`overtime_hours` real DEFAULT 0,
	`night_hours` real DEFAULT 0,
	`holiday_hours` real DEFAULT 0,
	`sunday_hours` real DEFAULT 0,
	`estimated_payment` real DEFAULT 0,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`telegram_id` text NOT NULL,
	`name` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_telegram_id_unique` ON `users` (`telegram_id`);