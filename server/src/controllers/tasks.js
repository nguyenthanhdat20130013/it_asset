const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const { status, priority, relatedType, relatedId } = req.query;
        const where = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (relatedType) where.relatedType = relatedType;
        if (relatedId) where.relatedId = relatedId;

        const tasks = await prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, description, dueDate, priority, relatedId, relatedType } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                priority: priority || 'MEDIUM',
                relatedId,
                relatedType
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.dueDate) data.dueDate = new Date(data.dueDate);

        const task = await prisma.task.update({
            where: { id },
            data
        });
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.task.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
