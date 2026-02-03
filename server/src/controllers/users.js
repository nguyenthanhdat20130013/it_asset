const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    username: true,
                    role: true,
                    employeeId: true,
                    companyId: true,
                    employee: {
                        select: { name: true }
                    },
                    company: {
                        select: { name: true }
                    }
                }
            }),
            prisma.user.count()
        ]);

        res.json({
            data: users,
            total,
            page,
            limit
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, username: true, role: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
