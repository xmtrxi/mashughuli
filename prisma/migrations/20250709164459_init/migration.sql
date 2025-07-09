-- AlterEnum
ALTER TYPE "ErrandStatus" ADD VALUE 'pending_approval';

-- AlterTable
ALTER TABLE "errands" ADD COLUMN     "accepted_bid_id" UUID,
ADD COLUMN     "estimated_cost" DECIMAL(10,2),
ADD COLUMN     "has_shopping_list" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shop_name" TEXT,
ADD COLUMN     "total_cost" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "errand_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "errand_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "estimated_price" DECIMAL(10,2),
    "actual_price" DECIMAL(10,2),
    "category" TEXT,
    "brand" TEXT,
    "specifications" TEXT,
    "urgent" BOOLEAN NOT NULL DEFAULT false,
    "obtained" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "errand_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_files" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "errand_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "description" TEXT,
    "is_approved" BOOLEAN,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "errand_items_errand_id_idx" ON "errand_items"("errand_id");

-- CreateIndex
CREATE INDEX "verification_files_errand_id_idx" ON "verification_files"("errand_id");

-- AddForeignKey
ALTER TABLE "errand_items" ADD CONSTRAINT "errand_items_errand_id_fkey" FOREIGN KEY ("errand_id") REFERENCES "errands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_files" ADD CONSTRAINT "verification_files_errand_id_fkey" FOREIGN KEY ("errand_id") REFERENCES "errands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
