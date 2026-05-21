-- AlterTable
ALTER TABLE "Request" ADD COLUMN "position" INTEGER;

-- CreateIndex
CREATE INDEX "Request_position_idx" ON "Request"("position");

-- AlterTable
ALTER TABLE "VenueDJ" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "VenueDJ_isActive_idx" ON "VenueDJ"("isActive");
