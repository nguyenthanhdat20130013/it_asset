/*
 Navicat Premium Dump SQL

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 90500 (9.5.0)
 Source Host           : localhost:3306
 Source Schema         : it_asset_management

 Target Server Type    : MySQL
 Target Server Version : 90500 (9.5.0)
 File Encoding         : 65001

 Date: 26/01/2026 13:07:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for asset_history
-- ----------------------------
DROP TABLE IF EXISTS `asset_history`;
CREATE TABLE `asset_history`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assetId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `assignedDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `returnDate` datetime(3) NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `asset_history_assetId_fkey`(`assetId` ASC) USING BTREE,
  INDEX `asset_history_employeeId_fkey`(`employeeId` ASC) USING BTREE,
  CONSTRAINT `asset_history_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `asset_history_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of asset_history
-- ----------------------------
INSERT INTO `asset_history` VALUES ('1d3d043e-dac5-4423-ad1f-8b4c9679c7b9', '5902f604-b203-4f5a-86db-571d8a0e5dca', '6f539235-40a9-4cda-b13a-3b57eba3aed8', '2026-01-16 06:08:40.863', '2026-01-20 09:00:29.343', 'ASSIGNED', NULL);
INSERT INTO `asset_history` VALUES ('5bc68fd9-fbc1-4ccf-b390-f997b9139e74', '1e8fea41-0175-4613-adeb-0fee6ee3e64d', '6f539235-40a9-4cda-b13a-3b57eba3aed8', '2026-01-16 03:37:10.683', '2026-01-20 09:00:30.662', 'ASSIGNED', NULL);
INSERT INTO `asset_history` VALUES ('fb4695fe-52dd-4238-9070-5409aaada82b', 'aff64e84-dbc3-4033-bf99-e86a5ef5b7d6', '6f539235-40a9-4cda-b13a-3b57eba3aed8', '2026-01-16 03:37:15.227', NULL, 'ASSIGNED', NULL);

-- ----------------------------
-- Table structure for assets
-- ----------------------------
DROP TABLE IF EXISTS `assets`;
CREATE TABLE `assets`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `employeeId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `projectId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `typeId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `tag` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `brand` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `config` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `customAttributes` json NULL,
  `serialNumber` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `purchaseDate` datetime(3) NULL DEFAULT NULL,
  `warrantyExpiry` datetime(3) NULL DEFAULT NULL,
  `value` decimal(65, 30) NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN_STOCK',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `assets_tag_key`(`tag` ASC) USING BTREE,
  INDEX `assets_companyId_fkey`(`companyId` ASC) USING BTREE,
  INDEX `assets_departmentId_fkey`(`departmentId` ASC) USING BTREE,
  INDEX `assets_employeeId_fkey`(`employeeId` ASC) USING BTREE,
  INDEX `assets_projectId_fkey`(`projectId` ASC) USING BTREE,
  INDEX `assets_typeId_fkey`(`typeId` ASC) USING BTREE,
  CONSTRAINT `assets_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `assets_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assets_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assets_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `assets_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `device_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of assets
-- ----------------------------
INSERT INTO `assets` VALUES ('1e8fea41-0175-4613-adeb-0fee6ee3e64d', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', '90f173fc-5a64-4009-9642-0d7fb1508495', NULL, NULL, 'ae9cc42b-2c0b-4b3d-b0cc-f6e5bf3a7894', 'HRMT01', 'Màn hình', 'Unknown', 'Dell', NULL, '{\"Kích thước\": \"22\"}', 'E2218HN', NULL, NULL, NULL, 'IN_STOCK', '2026-01-16 03:37:03.341', '2026-01-20 09:00:30.668');
INSERT INTO `assets` VALUES ('5902f604-b203-4f5a-86db-571d8a0e5dca', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', '90f173fc-5a64-4009-9642-0d7fb1508495', NULL, NULL, '87b38eb8-2c88-43c7-88d7-e2c14960dcdd', 'HRCAM02', 'Camera 02', 'Unknown', 'Hik', NULL, '{}', NULL, NULL, NULL, 1750000.000000000000000000000000000000, 'IN_STOCK', '2026-01-16 03:42:43.980', '2026-01-20 09:00:29.355');
INSERT INTO `assets` VALUES ('7e375811-cd88-4023-a7f4-ee32ccfadde2', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', NULL, NULL, '20564375-07e7-4090-9074-fc72b8b1dfb2', '9e59d183-f0b3-4e41-9984-349dce8652cf', 'DBPWF1', 'Bộ phát wifi', 'Unknown', 'TP LINK', NULL, '{}', 'MR4600', NULL, NULL, NULL, 'IN_STOCK', '2026-01-16 03:39:28.305', '2026-01-16 03:41:15.135');
INSERT INTO `assets` VALUES ('8fb15bea-b5c1-4f5f-88dc-b3ad246c1de5', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', '90f173fc-5a64-4009-9642-0d7fb1508495', NULL, '20564375-07e7-4090-9074-fc72b8b1dfb2', '87b38eb8-2c88-43c7-88d7-e2c14960dcdd', 'HRCAM01', 'Camera 01', 'Unknown', 'Hik', NULL, '{}', NULL, NULL, NULL, NULL, 'IN_STOCK', '2026-01-16 03:42:13.197', '2026-01-16 03:43:04.174');
INSERT INTO `assets` VALUES ('aff64e84-dbc3-4033-bf99-e86a5ef5b7d6', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', '90f173fc-5a64-4009-9642-0d7fb1508495', '6f539235-40a9-4cda-b13a-3b57eba3aed8', NULL, '63c49859-760c-4508-b047-31e6efc00688', 'HRPC01', 'Precision Tower 7810', 'Unknown', 'Dell', NULL, '{\"CPU\": \"Xeon E5 2683\", \"HDD\": \"500\", \"Ram\": \"56\", \"SSD\": \"500\", \"VGA\": \"GT 1030\"}', NULL, NULL, NULL, NULL, 'IN_USE', '2026-01-16 03:35:31.801', '2026-01-16 09:23:05.014');

-- ----------------------------
-- Table structure for calendar_events
-- ----------------------------
DROP TABLE IF EXISTS `calendar_events`;
CREATE TABLE `calendar_events`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NULL DEFAULT NULL,
  `relatedId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `relatedType` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of calendar_events
-- ----------------------------
INSERT INTO `calendar_events` VALUES ('4ad7882c-a145-4ea6-9c72-b98094b790c3', 'Nguyễn Ngọc Nhân - Thực tập sinh Thanh quyết toán DBPlus', 'ONBOARDING', '2026-01-19 01:30:30.800', NULL, NULL, NULL, 'Ngày 19/01/2026, em có Bạn Nguyễn Ngọc Nhân - Thực tập sinh Thanh quyết toán DBPlus nhận việc', '2026-01-16 04:35:10.469');
INSERT INTO `calendar_events` VALUES ('7719dd29-e92c-4925-8f55-b1e6c84fddf2', 'Xóa nha', 'ONBOARDING', '2026-01-29 17:00:00.000', NULL, NULL, NULL, 'xóa', '2026-01-16 04:15:08.440');
INSERT INTO `calendar_events` VALUES ('81654736-15fc-4ae6-a6d6-5410a8cd3205', 'Test', 'ONBOARDING', '2026-01-16 04:14:11.845', NULL, NULL, NULL, 'Test nha', '2026-01-16 04:14:37.291');

-- ----------------------------
-- Table structure for companies
-- ----------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `companies_code_key`(`code` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of companies
-- ----------------------------
INSERT INTO `companies` VALUES ('c667463f-86ac-4b22-8d27-1773bcce65aa', '0316353770', 'CÔNG TY CỔ PHẦN NỘI THẤT DBHOMES', 'Số 40 Đường 62, Khu phố 01, Phường Cát Lái, TP Hồ Chí Minh, Việt Nam', 'hoadon@dbhomes.com.vn', NULL, 'ACTIVE', '2026-01-16 03:22:14.174', '2026-01-16 03:22:14.174');
INSERT INTO `companies` VALUES ('e308324f-a796-4a60-a8a8-2ddacc81dddc', '0310813051', 'CÔNG TY CỔ PHẦN THIẾT KẾ VÀ XÂY DỰNG DBPLUS', 'Số 40 Đường 62, Khu phố 01, Phường Cát Lái, TP Hồ Chí Minh, Việt Nam', 'hoadon@dbplus.com.vn', NULL, 'ACTIVE', '2026-01-16 03:21:06.412', '2026-01-16 03:21:06.412');

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `managerId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `departments_companyId_fkey`(`companyId` ASC) USING BTREE,
  CONSTRAINT `departments_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of departments
-- ----------------------------
INSERT INTO `departments` VALUES ('90f173fc-5a64-4009-9642-0d7fb1508495', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', 'DBP-HR IT', 'DBP-HR IT', NULL, 'ACTIVE', '2026-01-16 03:23:18.274', '2026-01-16 03:23:18.274');
INSERT INTO `departments` VALUES ('c73697ba-bd0e-488a-aa3d-570b2f02f54c', 'c667463f-86ac-4b22-8d27-1773bcce65aa', 'DBH-2D', 'Phòng 2D', NULL, 'ACTIVE', '2026-01-16 03:22:40.062', '2026-01-16 03:22:40.062');
INSERT INTO `departments` VALUES ('fb365138-16ec-4571-9cdd-5c9984c0189a', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', 'DBP-HR', 'HR', NULL, 'ACTIVE', '2026-01-16 03:22:54.090', '2026-01-16 03:22:54.090');

-- ----------------------------
-- Table structure for device_types
-- ----------------------------
DROP TABLE IF EXISTS `device_types`;
CREATE TABLE `device_types`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `schema` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `device_types_name_key`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of device_types
-- ----------------------------
INSERT INTO `device_types` VALUES ('63c49859-760c-4508-b047-31e6efc00688', 'Máy tính bàn', '[{\"key\": \"CPU\", \"label\": \"CPU\"}, {\"key\": \"Ram\", \"label\": \"Ram\"}, {\"key\": \"SSD\", \"label\": \"SSD\"}, {\"key\": \"HDD\", \"label\": \"HDD\"}, {\"key\": \"VGA\", \"label\": \"VGA\"}]', '2026-01-16 03:33:57.492', '2026-01-16 03:33:57.492');
INSERT INTO `device_types` VALUES ('87b38eb8-2c88-43c7-88d7-e2c14960dcdd', 'Camera', '[]', '2026-01-16 03:41:38.972', '2026-01-16 03:41:38.972');
INSERT INTO `device_types` VALUES ('9e59d183-f0b3-4e41-9984-349dce8652cf', 'Bộ phát wifi', '[]', '2026-01-16 03:38:47.700', '2026-01-16 03:38:47.700');
INSERT INTO `device_types` VALUES ('ae9cc42b-2c0b-4b3d-b0cc-f6e5bf3a7894', 'Màn hình', '[{\"key\": \"Kích thước\", \"label\": \"Kích thước\"}]', '2026-01-16 03:36:15.449', '2026-01-16 03:36:15.449');

-- ----------------------------
-- Table structure for employees
-- ----------------------------
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departmentId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobTitle` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `joinDate` datetime(3) NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `employees_code_key`(`code` ASC) USING BTREE,
  UNIQUE INDEX `employees_email_key`(`email` ASC) USING BTREE,
  INDEX `employees_companyId_fkey`(`companyId` ASC) USING BTREE,
  INDEX `employees_departmentId_fkey`(`departmentId` ASC) USING BTREE,
  CONSTRAINT `employees_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `employees_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of employees
-- ----------------------------
INSERT INTO `employees` VALUES ('6f539235-40a9-4cda-b13a-3b57eba3aed8', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', '90f173fc-5a64-4009-9642-0d7fb1508495', 'dat.nguyen', 'Nguyễn Thành Đạt', 'dat.nguyen@dbplus.com.vn', 'IT Support', '2025-03-25 17:00:00.000', 'ACTIVE', '2026-01-16 03:24:14.478', '2026-01-16 04:32:35.137');

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPCOMING',
  `startDate` datetime(3) NULL DEFAULT NULL,
  `endDate` datetime(3) NULL DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `projects_code_key`(`code` ASC) USING BTREE,
  INDEX `projects_companyId_fkey`(`companyId` ASC) USING BTREE,
  CONSTRAINT `projects_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of projects
-- ----------------------------
INSERT INTO `projects` VALUES ('20564375-07e7-4090-9074-fc72b8b1dfb2', 'Trump', 'DBGroup', 'e308324f-a796-4a60-a8a8-2ddacc81dddc', 'INSTALLED', '2026-01-15 17:00:00.000', '2026-01-30 17:00:00.000', NULL, '2026-01-16 03:40:59.272', '2026-01-23 10:26:23.346');
INSERT INTO `projects` VALUES ('780fc3ab-4898-42db-ba36-d86f089a4105', 'Sycamore', 'Sycamore', 'c667463f-86ac-4b22-8d27-1773bcce65aa', 'COMPLETED', '2025-12-31 17:00:00.000', '2026-01-09 17:00:00.000', NULL, '2026-01-16 03:43:33.940', '2026-01-21 09:43:27.328');

-- ----------------------------
-- Table structure for sims
-- ----------------------------
DROP TABLE IF EXISTS `sims`;
CREATE TABLE `sims`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `number` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `carrier` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `plan` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `registrationDate` datetime(3) NULL DEFAULT NULL,
  `activationDate` datetime(3) NULL DEFAULT NULL,
  `expiryDate` datetime(3) NULL DEFAULT NULL,
  `employeeId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `projectId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `assetId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `notes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `sims_number_key`(`number` ASC) USING BTREE,
  INDEX `sims_companyId_fkey`(`companyId` ASC) USING BTREE,
  INDEX `sims_projectId_fkey`(`projectId` ASC) USING BTREE,
  INDEX `sims_assetId_fkey`(`assetId` ASC) USING BTREE,
  CONSTRAINT `sims_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sims_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sims_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sims
-- ----------------------------
INSERT INTO `sims` VALUES ('aeff1d2b-b592-453d-9272-e46ac82bc547', 'c667463f-86ac-4b22-8d27-1773bcce65aa', '0867155409', 'Viettel', '5G480B', '2025-12-31 17:00:00.000', '2026-01-19 17:00:00.000', '2026-01-23 17:00:00.000', NULL, '20564375-07e7-4090-9074-fc72b8b1dfb2', NULL, 'ACTIVE', NULL);

-- ----------------------------
-- Table structure for software
-- ----------------------------
DROP TABLE IF EXISTS `software`;
CREATE TABLE `software`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `developer` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `category` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `software_name_key`(`name` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of software
-- ----------------------------
INSERT INTO `software` VALUES ('47510b33-0ba2-4299-a193-f7c55cb57869', 'Zoom', NULL, NULL, 'Communication', '2026-01-16 03:50:07.105', '2026-01-16 03:50:07.105');

-- ----------------------------
-- Table structure for software_assignments
-- ----------------------------
DROP TABLE IF EXISTS `software_assignments`;
CREATE TABLE `software_assignments`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `licenseId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignedDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `returnDate` datetime(3) NULL DEFAULT NULL,
  `notes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `software_assignments_licenseId_fkey`(`licenseId` ASC) USING BTREE,
  INDEX `software_assignments_employeeId_fkey`(`employeeId` ASC) USING BTREE,
  CONSTRAINT `software_assignments_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `software_assignments_licenseId_fkey` FOREIGN KEY (`licenseId`) REFERENCES `software_licenses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of software_assignments
-- ----------------------------

-- ----------------------------
-- Table structure for software_licenses
-- ----------------------------
DROP TABLE IF EXISTS `software_licenses`;
CREATE TABLE `software_licenses`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `softwareId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `licenseKey` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `type` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUBSCRIPTION',
  `seats` int NOT NULL DEFAULT 1,
  `purchaseDate` datetime(3) NULL DEFAULT NULL,
  `expiryDate` datetime(3) NULL DEFAULT NULL,
  `cost` decimal(10, 2) NULL DEFAULT NULL,
  `currency` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `notes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `software_licenses_softwareId_fkey`(`softwareId` ASC) USING BTREE,
  CONSTRAINT `software_licenses_softwareId_fkey` FOREIGN KEY (`softwareId`) REFERENCES `software` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of software_licenses
-- ----------------------------
INSERT INTO `software_licenses` VALUES ('8f50de5b-0282-4f74-8fb5-05d20a79d06b', '47510b33-0ba2-4299-a193-f7c55cb57869', NULL, 'SUBSCRIPTION', 1, '2026-01-15 17:00:00.000', '2026-01-27 17:00:00.000', 500000.00, 'VND', NULL, 'ACTIVE', '2026-01-16 03:50:26.433', '2026-01-16 03:50:26.433');

-- ----------------------------
-- Table structure for tasks
-- ----------------------------
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `dueDate` datetime(3) NULL DEFAULT NULL,
  `priority` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `relatedId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `relatedType` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tasks
-- ----------------------------
INSERT INTO `tasks` VALUES ('0785d3e4-5aed-40eb-b839-56e811395406', 'cài win', NULL, '2026-01-19 17:00:00.000', 'MEDIUM', 'DONE', NULL, NULL, '2026-01-16 04:11:52.745');
INSERT INTO `tasks` VALUES ('80e62083-fd95-4a50-8061-db5be0bb9e0f', 'Dời máy', NULL, '2026-01-16 17:00:00.000', 'MEDIUM', 'DONE', NULL, NULL, '2026-01-16 04:03:24.594');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EMPLOYEE',
  `employeeId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `companyId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_username_key`(`username` ASC) USING BTREE,
  UNIQUE INDEX `users_employeeId_key`(`employeeId` ASC) USING BTREE,
  INDEX `users_companyId_fkey`(`companyId` ASC) USING BTREE,
  CONSTRAINT `users_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `users_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES ('00288f9e-f56c-4512-90e9-8d4c74047086', 'dat', '$2b$10$YnXL/bEbBEhXZWBqvWPf.Ogd68vDb/Ys8X7fpQWhK3WAK.k5dBTKS', 'ADMIN', NULL, NULL);
INSERT INTO `users` VALUES ('eebf86cc-6f5a-4237-9c3c-302f12ec988d', 'admin', '$2b$10$nT.jO.E2Iihn/6c.kSP/U.JElYGbNhYffbwdRx.YduFrkLSv58dVC', 'ADMIN', NULL, NULL);

SET FOREIGN_KEY_CHECKS = 1;
