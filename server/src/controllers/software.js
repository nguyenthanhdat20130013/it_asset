const prisma = require('../prisma');

exports.getAll = async (req, res) => {
    try {
        const software = await prisma.software.findMany({
            include: {
                licenses: {
                    include: {
                        assignments: {
                            include: {
                                employee: true
                            }
                        }
                    }
                }
            }
        });
        res.json(software);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const software = await prisma.software.create({
            data: req.body
        });
        res.json(software);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const software = await prisma.software.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(software);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        await prisma.software.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Software deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Licenses
exports.addLicense = async (req, res) => {
    try {
        const { licenseKey, type, seats, purchaseDate, expiryDate, cost, currency, notes, status } = req.body;
        const license = await prisma.softwareLicense.create({
            data: {
                licenseKey,
                type,
                seats: seats ? parseInt(seats) : 1,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                cost: cost ? parseFloat(cost) : null,
                currency,
                notes,
                status,
                software: { connect: { id: req.params.id } }
            }
        });
        res.json(license);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateLicense = async (req, res) => {
    try {
        const { licenseKey, type, seats, purchaseDate, expiryDate, cost, currency, status } = req.body;
        const license = await prisma.softwareLicense.update({
            where: { id: req.params.licenseId },
            data: {
                licenseKey,
                type,
                seats: parseInt(seats),
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                cost: cost ? parseFloat(cost) : null,
                currency,
                status
            }
        });
        res.json(license);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLicenses = async (req, res) => {
    try {
        const licenses = await prisma.softwareLicense.findMany({
            where: { softwareId: req.params.id },
            include: { assignments: { include: { employee: true } } }
        });
        res.json(licenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Assignments
exports.assignLicense = async (req, res) => {
    try {
        const { licenseId } = req.params;
        const { employeeId, notes } = req.body;

        // 1. Check if license exists and get seat count
        const license = await prisma.softwareLicense.findUnique({
            where: { id: licenseId },
            include: { assignments: true }
        });

        if (!license) {
            return res.status(404).json({ error: 'License not found' });
        }

        // 2. Check for duplicate active assignment for this employee
        const existingAssignment = license.assignments.find(a =>
            a.employeeId === employeeId && !a.returnDate
        );
        if (existingAssignment) {
            return res.status(400).json({ error: 'Employee already has an active assignment for this license' });
        }

        // 3. Check seat availability
        const activeAssignments = license.assignments.filter(a => !a.returnDate).length;
        if (activeAssignments >= license.seats) {
            return res.status(400).json({ error: 'No seats available for this license' });
        }

        const assignment = await prisma.softwareAssignment.create({
            data: {
                licenseId,
                employeeId,
                notes
            }
        });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.returnLicense = async (req, res) => {
    try {
        const assignment = await prisma.softwareAssignment.update({
            where: { id: req.params.id },
            data: {
                returnDate: new Date()
            }
        });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeAssignment = async (req, res) => {
    try {
        await prisma.softwareAssignment.delete({
            where: { id: req.params.assignmentId }
        });
        res.json({ message: 'Assignment removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
