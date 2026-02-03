const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const { companyId, departmentId, status, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const where = {};
        if (companyId) where.companyId = companyId;
        if (departmentId) where.departmentId = departmentId;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (status) where.status = status;

        const [employees, total] = await Promise.all([
            prisma.employee.findMany({
                where,
                skip,
                take: limit,
                include: {
                    company: true,
                    department: true,
                    _count: { select: { currentAssets: true } }
                }
            }),
            prisma.employee.count({ where })
        ]);

        res.json({
            data: employees,
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
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                company: true,
                department: true,
                currentAssets: {
                    include: {
                        deviceType: true
                    }
                },
                assignedAssets: {
                    orderBy: { assignedDate: 'desc' },
                    take: 10
                }
            }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { companyId, departmentId, code, name, email, jobTitle, joinDate, status } = req.body;
        const employee = await prisma.employee.create({
            data: {
                companyId,
                departmentId,
                code,
                name,
                email,
                jobTitle,
                joinDate: joinDate ? new Date(joinDate) : undefined,
                status
            }
        });
        res.status(201).json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.joinDate) data.joinDate = new Date(data.joinDate);

        const employee = await prisma.employee.update({
            where: { id },
            data
        });
        res.json(employee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.employee.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
