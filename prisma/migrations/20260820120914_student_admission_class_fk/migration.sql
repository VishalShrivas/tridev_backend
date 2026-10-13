/*
  Warnings:

  - You are about to drop the column `admission_class` on the `students` table. All the data in the column will be lost.
  - Added the required column `admission_class_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "students" DROP COLUMN "admission_class",
ADD COLUMN     "admission_class_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_admission_class_id_fkey" FOREIGN KEY ("admission_class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
