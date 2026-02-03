const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const { companyId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const where = {};
        if (companyId) where.companyId = companyId;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: limit,
                include: {
                    company: true,
                    assets: {
                        include: { deviceType: true, sims: true }
                    },
                    sims: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.project.count({ where })
        ]);

        res.json({
            data: projects,
            total,
            page,
            limit
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        console.log('Create Project Request Body:', req.body);
        const { code, name, companyId, startDate, endDate, description } = req.body;
        const project = await prisma.project.create({
            data: {
                code,
                name,
                companyId,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                description
            }
        });
        console.log('Project Created:', project);
        res.json(project);
    } catch (error) {
        console.error('Create Project Error:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, status, startDate, endDate, description } = req.body;

        const updateData = {};
        if (code !== undefined) updateData.code = code;
        if (name !== undefined) updateData.name = name;
        if (status !== undefined) updateData.status = status;
        if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
        if (description !== undefined) updateData.description = description;

        const project = await prisma.project.update({
            where: { id },
            data: updateData,
            include: {  // Return updated data with relations
                company: true,
                assets: { include: { deviceType: true } },
                sims: true
            }
        });
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        // Optional: Reset assets and sims project link before delete?
        // Or let database handle it if set to CASCADE (prisma default is restrict usually)
        // Check schema usage. For now, we'll manually unlink to be safe or just delete.
        // Assuming we want to keep assets even if project is deleted.

        await prisma.$transaction([
            prisma.asset.updateMany({ where: { projectId: id }, data: { projectId: null } }),
            prisma.sim.updateMany({ where: { projectId: id }, data: { projectId: null } }),
            prisma.project.delete({ where: { id } })
        ]);

        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.assignAsset = async (req, res) => {
    try {
        const { id } = req.params; // Project ID
        const { assetId } = req.body;

        const asset = await prisma.asset.update({
            where: { id: assetId },
            data: { projectId: id }
        });
        res.json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.removeAsset = async (req, res) => {
    try {
        const { id, assetId } = req.params;
        const asset = await prisma.asset.update({
            where: { id: assetId }, // Ensure it belongs to project? where: { id: assetId, projectId: id }
            data: { projectId: null }
        });
        res.json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.assignSim = async (req, res) => {
    try {
        const { id } = req.params;
        const { simId } = req.body;
        const sim = await prisma.sim.update({
            where: { id: simId },
            data: { projectId: id }
        });
        res.json(sim);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.removeSim = async (req, res) => {
    try {
        const { id, simId } = req.params;
        const sim = await prisma.sim.update({
            where: { id: simId },
            data: { projectId: null }
        });
        res.json(sim);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
