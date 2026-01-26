const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Clear first
    await prisma.user.deleteMany({ where: { username: 'admin' } });

    const user = await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN'
        }
    });

    console.log('Admin user created with username: admin and password: admin');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
