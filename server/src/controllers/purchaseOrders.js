const prisma = require('../prisma');

// Categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.purchaseOrderCategory.findMany();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await prisma.purchaseOrderCategory.create({
            data: { name, description }
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await prisma.purchaseOrderCategory.update({
            where: { id },
            data: { name, description }
        });
        res.json(category);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const posCount = await prisma.purchaseOrder.count({ where: { categoryId: id } });
        if (posCount > 0) {
            return res.status(400).json({ error: 'Cannot delete category with existing purchase orders' });
        }
        await prisma.purchaseOrderCategory.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Purchase Orders
exports.getAll = async (req, res) => {
    try {
        const { companyId, categoryId, month, year, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (companyId) where.companyId = companyId;
        if (categoryId) where.categoryId = categoryId;
        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            where.orderDate = {
                gte: startDate,
                lte: endDate
            };
        } else if (year) {
            where.orderDate = {
                gte: new Date(year, 0, 1),
                lte: new Date(year, 11, 31)
            };
        }

        const [pos, total] = await Promise.all([
            prisma.purchaseOrder.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    company: { select: { name: true, code: true } },
                    category: { select: { name: true } }
                },
                orderBy: { orderDate: 'desc' }
            }),
            prisma.purchaseOrder.count({ where })
        ]);

        res.json({
            data: pos,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { poNumber, name, description, amount, currency, status, orderDate, companyId, categoryId } = req.body;
        const po = await prisma.purchaseOrder.create({
            data: {
                poNumber,
                name,
                description,
                amount: parseFloat(amount),
                currency: currency || "VND",
                status: status || "PAID",
                orderDate: orderDate ? new Date(orderDate) : new Date(),
                companyId,
                categoryId
            }
        });
        res.status(201).json(po);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.amount) data.amount = parseFloat(data.amount);
        if (data.orderDate) data.orderDate = new Date(data.orderDate);

        const po = await prisma.purchaseOrder.update({
            where: { id },
            data
        });
        res.json(po);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.purchaseOrder.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const { companyId, year } = req.query;
        const where = {};
        if (companyId) where.companyId = companyId;
        if (year) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31, 23, 59, 59);
            where.orderDate = {
                gte: startOfYear,
                lte: endOfYear
            };
        }

        const pos = await prisma.purchaseOrder.findMany({
            where,
            include: { category: true }
        });

        // Group by category
        const byCategory = pos.reduce((acc, po) => {
            const catName = po.category.name;
            acc[catName] = (acc[catName] || 0) + parseFloat(po.amount);
            return acc;
        }, {});

        // Group by month
        const byMonth = pos.reduce((acc, po) => {
            const month = new Date(po.orderDate).getMonth() + 1;
            acc[month] = (acc[month] || 0) + parseFloat(po.amount);
            return acc;
        }, {});

        res.json({
            byCategory,
            byMonth,
            total: pos.reduce((sum, po) => sum + parseFloat(po.amount), 0)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
