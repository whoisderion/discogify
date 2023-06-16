-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firebaseUUID" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "lastSignedIn" TIMESTAMP(3) NOT NULL,
    "spotifyName" TEXT NOT NULL,
    "spotifyEmail" TEXT NOT NULL,
    "spotifyID" TEXT NOT NULL,
    "spotifyCountry" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "lastSpotifyUpdate" TIMESTAMP(3) NOT NULL,
    "lastDiscogsUpdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "shortTermRank" INTEGER NOT NULL,
    "mediumTermRank" INTEGER NOT NULL,
    "longTermRank" INTEGER NOT NULL,
    "spotifyID" INTEGER NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "album" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "spotifyID" TEXT NOT NULL,
    "shortTermRank" INTEGER NOT NULL,
    "mediumTermRank" INTEGER NOT NULL,
    "longTermRank" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "artistId" TEXT,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vinyl" (
    "id" TEXT NOT NULL,
    "albumId" TEXT,
    "unitsAvailable" INTEGER NOT NULL,
    "lowestPrice" DECIMAL(65,30) NOT NULL,
    "vinylType" TEXT[],
    "additionalInfo" TEXT NOT NULL,
    "discogsID" INTEGER NOT NULL,
    "releaseDate" TEXT NOT NULL,

    CONSTRAINT "Vinyl_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinyl" ADD CONSTRAINT "Vinyl_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;
