-- AlterTable
ALTER TABLE "User" ALTER COLUMN "spotifyName" DROP NOT NULL,
ALTER COLUMN "spotifyEmail" DROP NOT NULL,
ALTER COLUMN "spotifyID" DROP NOT NULL,
ALTER COLUMN "spotifyCountry" DROP NOT NULL,
ALTER COLUMN "theme" DROP NOT NULL,
ALTER COLUMN "lastSpotifyUpdate" DROP NOT NULL,
ALTER COLUMN "lastDiscogsUpdate" DROP NOT NULL;
