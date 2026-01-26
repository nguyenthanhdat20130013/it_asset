const prisma = require('../prisma');

/**
 * Get all assets with optional filtering
 * @param {Object} req - Request object with query params (companyId, type, etc.)
 * @param {Object} res - Response object
 */
exports.getAll = async (req, res) => {
    try {
        const { companyId, type, status, employeeId, search, departmentId } = req.query;
        const where = {};
        if (companyId && companyId !== 'undefined' && companyId !== 'null') where.companyId = companyId;
        if (departmentId && departmentId !== 'undefined' && departmentId !== 'null') where.departmentId = departmentId;
        if (type) where.type = type;
        if (status) where.status = status;
        if (employeeId) where.employeeId = employeeId;
        if (search) {
            where.OR = [
                { tag: { contains: search } },
                { name: { contains: search } },
                { serialNumber: { contains: search } }
            ];
        }

        const assets = await prisma.asset.findMany({
            where,
            include: {
                company: true,
                department: true,
                employee: true,
                deviceType: true,
                history: true
            },
        });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get asset by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                company: true,
                employee: true,
                history: {
                    include: { employee: true },
                    orderBy: { assignedDate: 'desc' }
                }
            }
        });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new asset
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.create = async (req, res) => {
    const { companyId, departmentId, typeId, type, tag, name, brand, config, customAttributes, serialNumber, purchaseDate, warrantyExpiry, value, status } = req.body;
    try {
        const asset = await prisma.asset.create({
            data: {
                companyId,
                departmentId,
                typeId,
                tag,
                name,
                type: type || 'Unknown', // Fallback
                brand,
                config,
                customAttributes: customAttributes || {},
                serialNumber,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
                value: value ? parseFloat(value) : null,
                status: status || 'IN_STOCK'
            },
        });
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update an existing asset
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            companyId, departmentId, typeId, tag, name, brand, config,
            customAttributes, serialNumber, purchaseDate, warrantyExpiry,
            value, status
        } = req.body;

        const updateData = {
            companyId, departmentId, typeId, tag, name, brand, config,
            customAttributes, serialNumber, value, status
        };

        if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);
        if (warrantyExpiry) updateData.warrantyExpiry = new Date(warrantyExpiry);

        const asset = await prisma.asset.update({
            where: { id },
            data: updateData
        });
        res.json(asset);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Delete an asset
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.asset.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Assign an asset to an employee
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.assign = async (req, res) => {
    try {
        const { id } = req.params;
        const { employeeId, notes } = req.body;

        const result = await prisma.$transaction(async (prisma) => {
            // Check if already assigned
            const existing = await prisma.asset.findUnique({ where: { id } });
            if (existing.employeeId) {
                throw new Error('Asset is already assigned');
            }

            // Update Asset
            const asset = await prisma.asset.update({
                where: { id },
                data: {
                    employeeId,
                    status: 'IN_USE'
                }
            });

            // Create History
            await prisma.assetHistory.create({
                data: {
                    assetId: id,
                    employeeId,
                    status: 'ASSIGNED',
                    notes
                }
            });

            return asset;
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Return an asset from an employee
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.returnAsset = async (req, res) => {
    try {
        const { id } = req.params; // Asset ID
        const { notes } = req.body;

        const result = await prisma.$transaction(async (prisma) => {
            const asset = await prisma.asset.findUnique({ where: { id } });
            if (!asset.employeeId) {
                throw new Error('Asset is not currently assigned');
            }

            // Find open history
            const history = await prisma.assetHistory.findFirst({
                where: {
                    assetId: id,
                    employeeId: asset.employeeId,
                    returnDate: null
                },
                orderBy: { assignedDate: 'desc' }
            });

            if (history) {
                await prisma.assetHistory.update({
                    where: { id: history.id },
                    data: {
                        returnDate: new Date(),
                        // status: 'RETURNED', // Or keep ASSIGNED and mark returned? 
                        // The schema has one status field.
                        // Ideally history status is the event type or the state? 
                        // If it's event type, "ASSIGNED" is fine. `returnDate` implies returned.
                        // Or we can append to notes.
                    }
                });
            } else {
                // If clean history not found, maybe just create a return record?
                // But history table structure (one record per assignment span) suggests update.
                // If missing, we force create one or just ignore.
            }

            // Update Asset
            const updatedAsset = await prisma.asset.update({
                where: { id },
                data: {
                    employeeId: null,
                    status: 'IN_STOCK' // Or 'Under Repair'?
                }
            });

            return updatedAsset;
        });

        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
