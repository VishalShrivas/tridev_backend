-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SC', 'ST', 'OBC', 'GEN');

-- CreateEnum
CREATE TYPE "Nationality" AS ENUM ('INDIAN', 'OTHER');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'DISCHARGED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'REPEATED', 'LEFT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'TEACHER';

-- CreateTable
CREATE TABLE "academic_years" (
    "id" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "class_teacher_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employee_code" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "qualification" TEXT,
    "joining_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "full_name_hindi" TEXT,
    "date_of_birth" DATE NOT NULL,
    "admission_for_class" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "caste" TEXT,
    "mother_tongue" TEXT,
    "religion" TEXT,
    "nationality" "Nationality" NOT NULL DEFAULT 'INDIAN',
    "aadhar_number" TEXT,
    "samagra_id" TEXT,
    "samagra_family_id" TEXT,
    "mobile_number" TEXT,
    "residential_address" TEXT NOT NULL,
    "previous_class_passed" TEXT,
    "previous_marks_obtained" TEXT,
    "previous_school_name" TEXT,
    "father_name" TEXT NOT NULL,
    "father_name_hindi" TEXT,
    "father_aadhar" TEXT,
    "father_mobile" TEXT,
    "father_qualification" TEXT,
    "father_occupation" TEXT,
    "mother_name" TEXT NOT NULL,
    "mother_name_hindi" TEXT,
    "mother_aadhar" TEXT,
    "mother_mobile" TEXT,
    "mother_qualification" TEXT,
    "mother_occupation" TEXT,
    "family_monthly_income" DECIMAL(12,2),
    "bank_name" TEXT,
    "bank_branch" TEXT,
    "bank_ifsc_code" TEXT,
    "bank_account_number" TEXT,
    "doc_dob_certificate" BOOLEAN NOT NULL DEFAULT false,
    "doc_caste_certificate" BOOLEAN NOT NULL DEFAULT false,
    "doc_samagra_id" BOOLEAN NOT NULL DEFAULT false,
    "doc_aadhar_card" BOOLEAN NOT NULL DEFAULT false,
    "doc_bpl_card" BOOLEAN NOT NULL DEFAULT false,
    "doc_bank_account" BOOLEAN NOT NULL DEFAULT false,
    "doc_tc_and_marksheet" BOOLEAN NOT NULL DEFAULT false,
    "doc_passport_photos" BOOLEAN NOT NULL DEFAULT false,
    "eligible_for_admission" BOOLEAN,
    "aapar_id" TEXT,
    "ladli_number" TEXT,
    "scholar_number" TEXT NOT NULL,
    "admission_date" DATE NOT NULL,
    "admission_class" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "discharge_date" DATE,
    "discharge_class" TEXT,
    "discharge_cause" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "class_id" UUID NOT NULL,
    "academic_year_id" UUID NOT NULL,
    "roll_number" TEXT NOT NULL,
    "enrollment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_label_key" ON "academic_years"("label");

-- CreateIndex
CREATE UNIQUE INDEX "classes_academic_year_id_name_section_key" ON "classes"("academic_year_id", "name", "section");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_user_id_key" ON "teachers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_employee_code_key" ON "teachers"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_aadhar_number_key" ON "students"("aadhar_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_samagra_id_key" ON "students"("samagra_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_aapar_id_key" ON "students"("aapar_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_ladli_number_key" ON "students"("ladli_number");

-- CreateIndex
CREATE UNIQUE INDEX "students_scholar_number_key" ON "students"("scholar_number");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_academic_year_id_key" ON "enrollments"("student_id", "academic_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_class_id_roll_number_key" ON "enrollments"("class_id", "roll_number");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
