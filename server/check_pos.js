const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const pos = await prisma.purchaseOrder.findMany();
        console.log('--- PO DATA ---');
        console.log('Count:', pos.length);
        pos.forEach(p => console.log(`ID: ${p.id}, Amount: ${p.amount}, Date: ${p.orderDate}`));

        const agg = await prisma.purchaseOrder.aggregate({
            _sum: { amount: true }
        });
        console.log('--- AGGREGATE ---');
        console.log('Sum:', JSON.stringify(agg._sum.amount));
        console.log('Sum (Number):', Number(agg._sum.amount));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
