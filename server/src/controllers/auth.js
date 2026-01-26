const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in environment variables');
}

/**
 * Register a new user
 * @param {Object} req - Request object containing username, password, employeeId, companyId
 * @param {Object} res - Response object
 */
exports.signup = async (req, res) => {
    try {
        const { username, password, employeeId, companyId, role } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                employeeId,
                companyId,
                role: 'EMPLOYEE'
            }
        });

        // Generate token
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ user: { id: user.id, username: user.username, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Authenticate user and get token
 * @param {Object} req - Request object containing username, password
 * @param {Object} res - Response object
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        console.log('Login attempt for:', username);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        const userData = await prisma.user.findUnique({
            where: { id: user.id },
            include: { employee: true }
        });

        res.json({
            user: {
                id: userData.id,
                username: userData.username,
                role: userData.role,
                employeeName: userData.employee?.name
            },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get current user profile
 * @param {Object} req - Request object (requires auth middleware)
 * @param {Object} res - Response object
 */
exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                role: true,
                employeeId: true,
                companyId: true,
                employee: {
                    select: { name: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            ...user,
            employeeName: user.employee?.name || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
