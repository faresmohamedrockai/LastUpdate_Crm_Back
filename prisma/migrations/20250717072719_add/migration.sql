-- AlterTable
ALTER TABLE "PaymentPlan" ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "firstInstallmentDate" TIMESTAMP(3),
ADD COLUMN     "installmentMonthsCount" DOUBLE PRECISION;
