const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const types = await prisma.deviceType.findMany();
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    const { name, schema } = req.body;
    try {
        const newType = await prisma.deviceType.create({
            data: { name, schema }
        });
        res.json(newType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.deviceType.delete({ where: { id } });
        res.json({ message: 'Device Type deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
