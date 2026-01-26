const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const { companyId } = req.query;
        const where = companyId ? { companyId } : {};
        const departments = await prisma.department.findMany({
            where,
            include: {
                company: true,
                _count: { select: { employees: true } }
            }
        });
        res.json(departments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await prisma.department.findUnique({
            where: { id },
            include: { company: true, employees: true, assets: true }
        });
        if (!department) return res.status(404).json({ error: 'Department not found' });
        res.json(department);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { companyId, code, name, managerId } = req.body;
        const department = await prisma.department.create({
            data: { companyId, code, name, managerId }
        });
        res.status(201).json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const department = await prisma.department.update({
            where: { id },
            data
        });
        res.json(department);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.department.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
