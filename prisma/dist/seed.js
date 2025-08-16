"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var hashedPassword, admin, salesAdmin, teamLeader, salesRep, zone1, zone2, developer1, developer2, project1, project2, paymentPlan1, paymentPlan2, inventory1, inventory2, lead1, lead2, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
        return __generator(this, function (_0) {
            switch (_0.label) {
                case 0:
                    console.log('🌱 Starting database seeding...');
                    return [4 /*yield*/, bcrypt.hash('admin123', 10)];
                case 1:
                    hashedPassword = _0.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@propai.com' },
                            update: {},
                            create: {
                                email: 'admin@propai.com',
                                name: 'Admin User',
                                password: hashedPassword,
                                role: 'admin'
                            }
                        })];
                case 2:
                    admin = _0.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'salesadmin@propai.com' },
                            update: {},
                            create: {
                                email: 'salesadmin@propai.com',
                                name: 'Sales Admin',
                                password: hashedPassword,
                                role: 'sales_admin'
                            }
                        })];
                case 3:
                    salesAdmin = _0.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'teamleader@propai.com' },
                            update: {},
                            create: {
                                email: 'teamleader@propai.com',
                                name: 'Team Leader',
                                password: hashedPassword,
                                role: 'team_leader'
                            }
                        })];
                case 4:
                    teamLeader = _0.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'salesrep@propai.com' },
                            update: {},
                            create: {
                                email: 'salesrep@propai.com',
                                name: 'Sales Representative',
                                password: hashedPassword,
                                role: 'sales_rep',
                                teamLeaderId: teamLeader.id
                            }
                        })];
                case 5:
                    salesRep = _0.sent();
                    return [4 /*yield*/, prisma.zone.create({
                            data: {
                                nameEn: 'Downtown',
                                nameAr: 'وسط المدينة',
                                description: 'Central business district',
                                latitude: 24.7136,
                                longitude: 46.6753
                            }
                        })];
                case 6:
                    zone1 = _0.sent();
                    return [4 /*yield*/, prisma.zone.create({
                            data: {
                                nameEn: 'North Riyadh',
                                nameAr: 'شمال الرياض',
                                description: 'Northern residential area',
                                latitude: 24.7743,
                                longitude: 46.7384
                            }
                        })];
                case 7:
                    zone2 = _0.sent();
                    return [4 /*yield*/, prisma.developer.create({
                            data: {
                                nameEn: 'Al Rajhi Development',
                                nameAr: 'تطوير الراجحي',
                                location: 'Riyadh, Saudi Arabia',
                                established: '2010',
                                email: 'info@alrajhi-dev.com',
                                phone: '+966-11-123-4567'
                            }
                        })];
                case 8:
                    developer1 = _0.sent();
                    return [4 /*yield*/, prisma.developer.create({
                            data: {
                                nameEn: 'Saudi Real Estate',
                                nameAr: 'العقارات السعودية',
                                location: 'Jeddah, Saudi Arabia',
                                established: '2005',
                                email: 'contact@saudi-realestate.com',
                                phone: '+966-12-987-6543'
                            }
                        })];
                case 9:
                    developer2 = _0.sent();
                    return [4 /*yield*/, prisma.project.create({
                            data: {
                                nameEn: 'Downtown Towers',
                                nameAr: 'أبراج وسط المدينة',
                                type: 'residential',
                                description: 'Luxury residential towers in downtown',
                                images: [],
                                developerId: developer1.id,
                                zoneId: zone1.id
                            }
                        })];
                case 10:
                    project1 = _0.sent();
                    return [4 /*yield*/, prisma.project.create({
                            data: {
                                nameEn: 'North Gardens',
                                nameAr: 'حدائق الشمال',
                                type: 'residential',
                                description: 'Family-friendly residential complex',
                                images: [],
                                developerId: developer2.id,
                                zoneId: zone2.id
                            }
                        })];
                case 11:
                    project2 = _0.sent();
                    return [4 /*yield*/, prisma.paymentPlan.create({
                            data: {
                                downpayment: 100000,
                                installment: 5000,
                                delivery: 50000,
                                schedule: 'Monthly',
                                description: 'Standard payment plan',
                                yearsToPay: 10,
                                installmentPeriod: 'monthly',
                                firstInstallmentDate: new Date('2025-01-01'),
                                deliveryDate: new Date('2026-06-01'),
                                projectId: project1.id
                            }
                        })];
                case 12:
                    paymentPlan1 = _0.sent();
                    return [4 /*yield*/, prisma.paymentPlan.create({
                            data: {
                                downpayment: 80000,
                                installment: 4000,
                                delivery: 40000,
                                schedule: 'Quarterly',
                                description: 'Flexible payment plan',
                                yearsToPay: 8,
                                installmentPeriod: 'quarterly',
                                firstInstallmentDate: new Date('2025-03-01'),
                                deliveryDate: new Date('2026-12-01'),
                                projectId: project2.id
                            }
                        })];
                case 13:
                    paymentPlan2 = _0.sent();
                    return [4 /*yield*/, prisma.inventory.create({
                            data: {
                                title: 'Luxury Apartment 101',
                                titleEn: 'Luxury Apartment 101',
                                titleAr: 'شقة فاخرة 101',
                                type: 'apartment',
                                price: 1500000,
                                location: 'Downtown Riyadh',
                                area: 120,
                                bedrooms: 3,
                                bathrooms: 2,
                                amenities: ['pool', 'gym', 'parking'],
                                status: 'available',
                                zoneId: zone1.id,
                                projectId: project1.id,
                                developerId: developer1.id,
                                paymentPlanIndex: 0,
                                parking: '2 cars'
                            }
                        })];
                case 14:
                    inventory1 = _0.sent();
                    return [4 /*yield*/, prisma.inventory.create({
                            data: {
                                title: 'Family Villa 202',
                                titleEn: 'Family Villa 202',
                                titleAr: 'فيلا عائلية 202',
                                type: 'villa',
                                price: 2500000,
                                location: 'North Riyadh',
                                area: 200,
                                bedrooms: 4,
                                bathrooms: 3,
                                amenities: ['garden', 'pool', 'gym'],
                                status: 'available',
                                zoneId: zone2.id,
                                projectId: project2.id,
                                developerId: developer2.id,
                                paymentPlanIndex: 0,
                                parking: '3 cars'
                            }
                        })];
                case 15:
                    inventory2 = _0.sent();
                    return [4 /*yield*/, prisma.lead.create({
                            data: {
                                nameEn: 'Ahmed Al-Rashid',
                                nameAr: 'أحمد الرشيد',
                                contact: ['+966-50-123-4567'],
                                email: 'ahmed@example.com',
                                budget: 2000000,
                                source: 'website',
                                status: 'fresh_lead',
                                notes: ['Interested in luxury apartments', 'Budget: 2M SAR'],
                                ownerId: salesRep.id,
                                inventoryInterestId: inventory1.id
                            }
                        })];
                case 16:
                    lead1 = _0.sent();
                    return [4 /*yield*/, prisma.lead.create({
                            data: {
                                nameEn: 'Fatima Al-Zahra',
                                nameAr: 'فاطمة الزهراء',
                                contact: ['+966-55-987-6543'],
                                email: 'fatima@example.com',
                                budget: 3000000,
                                source: 'referral',
                                status: 'follow_up',
                                notes: ['Looking for family villa', 'Has 3 children'],
                                ownerId: teamLeader.id,
                                inventoryInterestId: inventory2.id
                            }
                        })];
                case 17:
                    lead2 = _0.sent();
                    // Create some calls
                    return [4 /*yield*/, prisma.call.create({
                            data: {
                                date: new Date().toISOString(),
                                outcome: 'Interested in viewing',
                                duration: '15 minutes',
                                notes: 'Client showed strong interest in the property',
                                leadId: lead1.id,
                                projectId: project1.id,
                                createdBy: salesRep.id
                            }
                        })];
                case 18:
                    // Create some calls
                    _0.sent();
                    // Create some visits
                    return [4 /*yield*/, prisma.visit.create({
                            data: {
                                date: new Date().toISOString(),
                                notes: 'Property viewing scheduled',
                                objections: 'Price is a bit high',
                                leadId: lead2.id,
                                inventoryId: inventory2.id,
                                createdById: teamLeader.id
                            }
                        })];
                case 19:
                    // Create some visits
                    _0.sent();
                    console.log('✅ Database seeded successfully!');
                    console.log('📊 Created:');
                    _b = (_a = console).log;
                    _c = "   - ";
                    return [4 /*yield*/, prisma.user.count()];
                case 20:
                    _b.apply(_a, [_c + (_0.sent()) + " users"]);
                    _e = (_d = console).log;
                    _f = "   - ";
                    return [4 /*yield*/, prisma.zone.count()];
                case 21:
                    _e.apply(_d, [_f + (_0.sent()) + " zones"]);
                    _h = (_g = console).log;
                    _j = "   - ";
                    return [4 /*yield*/, prisma.developer.count()];
                case 22:
                    _h.apply(_g, [_j + (_0.sent()) + " developers"]);
                    _l = (_k = console).log;
                    _m = "   - ";
                    return [4 /*yield*/, prisma.project.count()];
                case 23:
                    _l.apply(_k, [_m + (_0.sent()) + " projects"]);
                    _p = (_o = console).log;
                    _q = "   - ";
                    return [4 /*yield*/, prisma.inventory.count()];
                case 24:
                    _p.apply(_o, [_q + (_0.sent()) + " inventories"]);
                    _s = (_r = console).log;
                    _t = "   - ";
                    return [4 /*yield*/, prisma.lead.count()];
                case 25:
                    _s.apply(_r, [_t + (_0.sent()) + " leads"]);
                    _v = (_u = console).log;
                    _w = "   - ";
                    return [4 /*yield*/, prisma.call.count()];
                case 26:
                    _v.apply(_u, [_w + (_0.sent()) + " calls"]);
                    _y = (_x = console).log;
                    _z = "   - ";
                    return [4 /*yield*/, prisma.visit.count()];
                case 27:
                    _y.apply(_x, [_z + (_0.sent()) + " visits"]);
                    console.log('\n🔑 Test Accounts:');
                    console.log('   Admin: admin@propai.com / admin123');
                    console.log('   Sales Admin: salesadmin@propai.com / admin123');
                    console.log('   Team Leader: teamleader@propai.com / admin123');
                    console.log('   Sales Rep: salesrep@propai.com / admin123');
                    return [2 /*return*/];
            }
        });
    });
}
main()["catch"](function (e) {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})["finally"](function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
