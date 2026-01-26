const prisma = require('../prisma');
const dayjs = require('dayjs');

exports.getDashboardStats = async (req, res) => {
    try {
        const { companyId } = req.query;
        const whereCompany = companyId ? { companyId } : {};

        const startOfToday = dayjs().startOf('day').toDate();
        const endOfPeriod = dayjs().add(5, 'day').endOf('day').toDate();

        const [
            companiesCount,
            departmentsCount,
            employeesCount,
            assetsCount,
            assetsValueAggregate,
            simsCount,
            expiringSims
        ] = await Promise.all([
            prisma.company.count({ where: whereCompany }),
            prisma.department.count({ where: whereCompany }),
            prisma.employee.count({ where: whereCompany }),
            prisma.asset.count({ where: whereCompany }),
            prisma.asset.aggregate({
                where: whereCompany,
                _sum: { value: true }
            }),
            prisma.sim.count({ where: whereCompany }),
            prisma.sim.findMany({
                where: {
                    ...whereCompany,
                    expiryDate: {
                        lte: endOfPeriod
                    },
                    status: 'ACTIVE'
                },
                include: { company: true }
            })
        ]);

        res.json({
            companies: companiesCount,
            departments: departmentsCount,
            employees: employeesCount,
            assets: assetsCount,
            assetsValue: assetsValueAggregate._sum.value || 0,
            sims: simsCount,
            expiringSims: expiringSims // Return full array
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAssetByDepartment = async (req, res) => {
    // Group assets by department (via Employee)
    // This is complex in Prisma without raw SQL for deep relation grouping sometimes.
    // simpler to get all assets with employee.department and aggregate in JS or use groupBy on Asset if we stored departmentId there?
    // We don't store departmentId on Asset.
    // Let's Skip for now or do simple aggregations.
    // We can count employees per department.
    try {
        const { companyId } = req.query;
        const where = companyId ? { companyId } : {};
        const departments = await prisma.department.findMany({
            where,
            include: {
                _count: {
                    select: { employees: true }
                }
            }
        });
        res.json(departments.map(d => ({
            id: d.id,
            name: d.name,
            employeeCount: d._count.employees
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
