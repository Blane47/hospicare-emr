-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "respondentName" TEXT,
    "respondentRole" TEXT NOT NULL,
    "hospital" TEXT,
    "answers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SurveyResponse_respondentRole_idx" ON "SurveyResponse"("respondentRole");
