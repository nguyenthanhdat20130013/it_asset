const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                skip,
                take: limit,
                include: { _count: { select: { employees: true, assets: true } } }
            }),
            prisma.company.count()
        ]);

        res.json({
            data: companies,
            total,
            page,
            limit
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await prisma.company.findUnique({
            where: { id },
            include: {
                departments: true,
                employees: true,
                assets: true
            }
        });
        if (!company) return res.status(404).json({ error: 'Company not found' });
        res.json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { code, name, address, email, phone } = req.body;
        const company = await prisma.company.create({
            data: { code, name, address, email, phone }
        });
        res.status(201).json(company);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const company = await prisma.company.update({
            where: { id },
            data
        });
        res.json(company);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.company.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
