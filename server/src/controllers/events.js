const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const { type, relatedType, relatedId, from, to } = req.query;
        const where = {};
        if (type) where.type = type;
        if (relatedType) where.relatedType = relatedType;
        if (relatedId) where.relatedId = relatedId;
        if (from || to) {
            where.startDate = {};
            if (from) where.startDate.gte = new Date(from);
            if (to) where.startDate.lte = new Date(to);
        }

        const events = await prisma.calendarEvent.findMany({
            where,
            orderBy: { startDate: 'asc' }
        });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { title, type, startDate, endDate, relatedId, relatedType, description } = req.body;
        const event = await prisma.calendarEvent.create({
            data: {
                title,
                type,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : undefined,
                relatedId,
                relatedType,
                description
            }
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, startDate, endDate, relatedId, relatedType, description } = req.body;
        const event = await prisma.calendarEvent.update({
            where: { id },
            data: {
                title,
                type,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                relatedId,
                relatedType,
                description
            }
        });
        res.json(event);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.calendarEvent.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
