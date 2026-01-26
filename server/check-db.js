const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const assignments = await prisma.softwareAssignment.findMany({
        include: { employee: true }
    });
    console.log('Assignments count:', assignments.length);
    assignments.forEach(a => {
        console.log(`Assignment ID: ${a.id}, Employee: ${a.employee ? a.employee.name : 'NULL'}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
