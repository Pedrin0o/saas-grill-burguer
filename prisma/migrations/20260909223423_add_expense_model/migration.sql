-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FORNECEDORES', 'ALUGUEL', 'SALARIOS', 'CONTAS', 'MARKETING', 'IMPOSTOS', 'MANUTENCAO', 'OUTROS');

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT true,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);
