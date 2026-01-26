const prisma = require('../prisma');
const fs = require('fs');

// Order matters for deletion (reverse) and creation (forward) if we were doing it manually,
// but with SET FOREIGN_KEY_CHECKS=0 we can be more flexible.
// However, let's list them all.
const models = [
    'User',
    'Company',
    'Department',
    'Employee',
    'Project',
    'DeviceType',
    'Asset',
    'AssetHistory',
    'Sim',
    'Software',
    'SoftwareLicense',
    'SoftwareAssignment',
    'CalendarEvent',
    'Task'
];

exports.backup = async (req, res) => {
    try {
        const data = {};
        for (const model of models) {
            // Prisma model names are camelCase in client usually, but in schema they are PascalCase.
            // checking prisma client, usually it is prisma.user, prisma.company etc (lowercase).
            const key = model.charAt(0).toLowerCase() + model.slice(1);
            data[model] = await prisma[key].findMany();
        }
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=backup_' + new Date().toISOString() + '.json');
        res.send(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ error: 'Backup failed: ' + error.message });
    }
};

exports.restore = async (req, res) => {
    try {
        const data = req.body;

        // Use transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Disable FK checks
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

            // Truncate all tables
            for (const model of models) {
                // We need the table name. Prisma doesn't expose it easily in runtime without dmmf.
                // But we have @@map in schema.
                // A simpler way for restore in sqlite/mysql is deleteMany associated with Model.
                // deleteMany works even with FK checks if we disabled them? 
                // Actually `TRUNCATE` is better but requires table names. `deleteMany` is safer with prisma adapter.
                const key = model.charAt(0).toLowerCase() + model.slice(1);
                await tx[key].deleteMany();
            }

            // Insert data
            for (const model of models) {
                const key = model.charAt(0).toLowerCase() + model.slice(1);
                const records = data[model];
                if (records && Array.isArray(records) && records.length > 0) {
                    await tx[key].createMany({
                        data: records,
                        skipDuplicates: true // Safety
                    });
                }
            }

            // Enable FK checks
            await tx.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
        });

        res.json({ message: 'Restore successful' });
    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: 'Restore failed: ' + error.message });
    }
};
