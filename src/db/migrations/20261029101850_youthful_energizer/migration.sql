CREATE TABLE `articles` (
	`id` text PRIMARY KEY,
	`authorId` integer NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`excerpt` text,
	`body` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	CONSTRAINT `fk_articles_authorId_accounts_id_fk` FOREIGN KEY (`authorId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY,
	`articleId` text NOT NULL,
	`authorId` integer NOT NULL,
	`body` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	CONSTRAINT `fk_comments_articleId_articles_id_fk` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_comments_authorId_accounts_id_fk` FOREIGN KEY (`authorId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE
);
