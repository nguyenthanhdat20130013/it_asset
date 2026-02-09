const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const pos = await prisma.purchaseOrder.findMany();
    console.log('Total POs:', pos.length);
    pos.forEach(po => {
        console.log(`PO: ${po.poNumber}, Amount: ${po.amount}, CompanyId: ${po.companyId}`);
    });

    const aggregate = await prisma.purchaseOrder.aggregate({
        _sum: { amount: true }
    });
    console.log('Aggregate Sum:', aggregate._sum.amount);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
