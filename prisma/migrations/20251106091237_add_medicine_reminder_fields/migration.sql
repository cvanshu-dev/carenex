-- CreateTable
CREATE TABLE "public"."MedicineReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "medicine" TEXT NOT NULL,
    "timeOfDay" TEXT,
    "timezone" TEXT,
    "repeat" TEXT,
    "nextRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineReminder_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."MedicineReminder" ADD CONSTRAINT "MedicineReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
