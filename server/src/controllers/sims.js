const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const { companyId, status, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const where = {};
        if (companyId && companyId !== 'undefined' && companyId !== 'null') where.companyId = companyId;
        if (status) where.status = status;
        if (search) where.number = { contains: search };

        const [sims, total] = await Promise.all([
            prisma.sim.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: true
                }
            }),
            prisma.sim.count({ where })
        ]);

        res.json({
            data: sims,
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
        const sim = await prisma.sim.findUnique({
            where: { id },
            include: { company: true }
        });
        if (!sim) return res.status(404).json({ error: 'SIM not found' });
        res.json(sim);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { companyId, number, carrier, plan, registrationDate, activationDate, expiryDate, status } = req.body;
        const sim = await prisma.sim.create({
            data: {
                companyId,
                number,
                carrier,
                plan,
                registrationDate: registrationDate ? new Date(registrationDate) : null,
                activationDate: activationDate ? new Date(activationDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                status: status || 'ACTIVE'
            },
        });
        res.status(201).json(sim);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.activationDate) data.activationDate = new Date(data.activationDate);
        if (data.expiryDate) data.expiryDate = new Date(data.expiryDate);

        const sim = await prisma.sim.update({
            where: { id },
            data
        });
        res.json(sim);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.sim.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
