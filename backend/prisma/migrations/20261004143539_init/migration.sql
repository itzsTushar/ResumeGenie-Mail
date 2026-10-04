-- CreateTable
CREATE TABLE "User" (
    "userId" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNo" TEXT,
    "passwordEncrypted" TEXT,
    "username" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Resume" (
    "resumeId" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "mobileNo" TEXT,
    "introduction" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("resumeId")
);

-- CreateTable
CREATE TABLE "Education" (
    "educationId" BIGSERIAL NOT NULL,
    "resumeId" BIGINT NOT NULL,
    "institution" TEXT,
    "degree" TEXT,
    "field" TEXT,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "cgpa" DECIMAL(4,2),
    "description" TEXT,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("educationId")
);

-- CreateTable
CREATE TABLE "Company" (
    "companyId" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hrName" TEXT,
    "hrEmail" TEXT,
    "description" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("companyId")
);

-- CreateTable
CREATE TABLE "Experience" (
    "experienceId" BIGSERIAL NOT NULL,
    "resumeId" BIGINT NOT NULL,
    "companyId" BIGINT,
    "role" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("experienceId")
);

-- CreateTable
CREATE TABLE "Project" (
    "projectId" BIGSERIAL NOT NULL,
    "resumeId" BIGINT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "technologies" TEXT,
    "github" TEXT,
    "liveLink" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("projectId")
);

-- CreateTable
CREATE TABLE "Certification" (
    "certificationId" BIGSERIAL NOT NULL,
    "resumeId" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "issueDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("certificationId")
);

-- CreateTable
CREATE TABLE "Research" (
    "researchId" BIGSERIAL NOT NULL,
    "resumeId" BIGINT NOT NULL,
    "topic" TEXT,
    "title" TEXT,
    "journal" TEXT,
    "year" INTEGER,
    "doi" TEXT,
    "abstract" TEXT,
    "url" TEXT,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("researchId")
);

-- CreateTable
CREATE TABLE "Skill" (
    "skillId" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("skillId")
);

-- CreateTable
CREATE TABLE "ResumeSkill" (
    "resumeId" BIGINT NOT NULL,
    "skillId" BIGINT NOT NULL,

    CONSTRAINT "ResumeSkill_pkey" PRIMARY KEY ("resumeId","skillId")
);

-- CreateTable
CREATE TABLE "ResumeLink" (
    "resumeLinkId" BIGSERIAL NOT NULL,
    "resumeId" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ResumeLink_pkey" PRIMARY KEY ("resumeLinkId")
);

-- CreateTable
CREATE TABLE "Excel" (
    "excelId" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "title" TEXT,
    "file" TEXT,

    CONSTRAINT "Excel_pkey" PRIMARY KEY ("excelId")
);

-- CreateTable
CREATE TABLE "OtpSystem" (
    "otpId" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "type" TEXT,
    "otp" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpSystem_pkey" PRIMARY KEY ("otpId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("companyId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeSkill" ADD CONSTRAINT "ResumeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeLink" ADD CONSTRAINT "ResumeLink_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("resumeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Excel" ADD CONSTRAINT "Excel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpSystem" ADD CONSTRAINT "OtpSystem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
