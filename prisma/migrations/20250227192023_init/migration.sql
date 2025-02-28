-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "playerName" TEXT NOT NULL,
    "timeSpent" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "boardSize" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);
