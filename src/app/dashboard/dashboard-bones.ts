import type { CompactBone, ResponsiveBones, SkeletonResult } from 'boneyard-js';

const bone = (x: number, y: number, w: number, h: number, r = 6, container = false): CompactBone =>
  container ? [x, y, w, h, r, true] : [x, y, w, h, r];

const mobileSnapshot = (): SkeletonResult => ({
  name: 'dashboard',
  viewportWidth: 375,
  width: 335,
  height: 2160,
  bones: [
    bone(0, 0, 38, 14), bone(0, 24, 72, 10),
    bone(0, 60, 100, 176, 12, true), bone(5, 78, 52, 9), bone(5, 101, 72, 22), bone(5, 133, 82, 8),
    bone(0, 248, 100, 148, 12, true), bone(5, 266, 54, 9), bone(5, 290, 76, 8),
    bone(5, 320, 88, 8), bone(5, 342, 74, 8), bone(5, 364, 82, 8),
    bone(0, 408, 100, 82, 12, true), bone(5, 426, 40, 8), bone(5, 446, 74, 8),
    bone(0, 502, 100, 92, 12, true), bone(5, 520, 48, 8), bone(5, 542, 76, 8),
    bone(0, 606, 100, 78, 12, true), bone(5, 624, 42, 8), bone(5, 646, 76, 8),
    bone(0, 696, 100, 78, 12, true), bone(5, 714, 48, 8), bone(5, 736, 76, 8),
    bone(0, 786, 100, 250, 12, true), bone(5, 804, 50, 10), bone(5, 826, 74, 8),
    bone(5, 876, 8, 58), bone(19, 850, 8, 84), bone(33, 892, 8, 42), bone(47, 838, 8, 96),
    bone(61, 882, 8, 52), bone(75, 860, 8, 74), bone(89, 900, 8, 34),
    bone(0, 1050, 100, 250, 12, true), bone(5, 1068, 48, 10), bone(5, 1090, 68, 8),
    bone(5, 1140, 88, 8), bone(5, 1162, 78, 8), bone(5, 1184, 84, 8), bone(5, 1206, 68, 8),
    bone(0, 1314, 100, 250, 12, true), bone(5, 1332, 48, 10), bone(5, 1354, 68, 8),
    bone(5, 1404, 88, 8), bone(5, 1426, 78, 8), bone(5, 1448, 84, 8), bone(5, 1470, 68, 8),
    bone(0, 1578, 100, 250, 12, true), bone(5, 1596, 48, 10), bone(5, 1618, 68, 8),
    bone(5, 1668, 88, 8), bone(5, 1690, 78, 8), bone(5, 1712, 84, 8), bone(5, 1734, 68, 8),
    bone(0, 1842, 100, 284, 12, true), bone(5, 1860, 44, 10), bone(5, 1888, 90, 10),
    bone(5, 1916, 90, 10), bone(5, 1944, 90, 10), bone(5, 1972, 90, 10), bone(5, 2000, 90, 10)
  ]
});

const desktopSnapshot = (): SkeletonResult => ({
  name: 'dashboard',
  viewportWidth: 1280,
  width: 1200,
  height: 1540,
  bones: [
    bone(0, 0, 36, 14), bone(0, 24, 54, 10),
    bone(0, 62, 65, 170, 12, true), bone(68, 62, 32, 170, 12, true),
    bone(3, 80, 28, 10), bone(3, 100, 38, 28), bone(3, 142, 48, 8),
    bone(6, 178, 8, 26), bone(17, 168, 8, 38), bone(28, 182, 8, 22),
    bone(39, 158, 8, 48), bone(50, 176, 8, 30), bone(61, 166, 8, 40),
    bone(80, 80, 18, 10), bone(80, 104, 15, 8), bone(80, 132, 16, 8),
    bone(80, 158, 16, 8), bone(80, 184, 16, 8),
    bone(0, 248, 23, 104, 12, true), bone(26, 248, 23, 104, 12, true),
    bone(52, 248, 23, 104, 12, true), bone(78, 248, 22, 104, 12, true),
    bone(2, 264, 14, 8), bone(2, 284, 15, 20), bone(2, 326, 18, 7),
    bone(28, 264, 14, 8), bone(28, 284, 15, 20), bone(28, 326, 18, 7),
    bone(54, 264, 14, 8), bone(54, 284, 15, 20), bone(54, 326, 18, 7),
    bone(80, 264, 14, 8), bone(80, 284, 15, 20), bone(80, 326, 18, 7),
    bone(0, 368, 65, 210, 12, true), bone(68, 368, 32, 210, 12, true),
    bone(3, 386, 30, 10), bone(3, 406, 38, 8),
    bone(6, 518, 7, 38), bone(17, 500, 7, 56), bone(28, 526, 7, 30),
    bone(39, 486, 7, 70), bone(50, 516, 7, 40), bone(61, 496, 7, 60),
    bone(72, 522, 7, 34), bone(80, 386, 18, 10), bone(80, 412, 16, 8),
    bone(0, 594, 65, 210, 12, true), bone(68, 594, 32, 210, 12, true),
    bone(3, 612, 30, 10), bone(3, 632, 38, 8),
    bone(6, 744, 7, 38), bone(17, 726, 7, 56), bone(28, 752, 7, 30),
    bone(39, 712, 7, 70), bone(50, 742, 7, 40), bone(61, 722, 7, 60),
    bone(72, 748, 7, 34), bone(80, 612, 18, 10), bone(80, 638, 16, 8),
    bone(0, 820, 65, 210, 12, true), bone(68, 820, 32, 210, 12, true),
    bone(3, 838, 30, 10), bone(3, 858, 38, 8),
    bone(6, 970, 7, 38), bone(17, 952, 7, 56), bone(28, 978, 7, 30),
    bone(39, 938, 7, 70), bone(50, 968, 7, 40), bone(61, 948, 7, 60),
    bone(72, 974, 7, 34), bone(80, 838, 18, 10), bone(80, 864, 16, 8),
    bone(0, 1046, 65, 190, 12, true), bone(68, 1046, 32, 190, 12, true),
    bone(3, 1064, 30, 10), bone(3, 1084, 38, 8),
    bone(6, 1172, 7, 38), bone(17, 1154, 7, 56), bone(28, 1180, 7, 30),
    bone(39, 1140, 7, 70), bone(50, 1170, 7, 40), bone(61, 1150, 7, 60),
    bone(72, 1176, 7, 34), bone(80, 1064, 18, 10), bone(80, 1090, 16, 8),
    bone(0, 1252, 100, 260, 12, true), bone(3, 1270, 30, 10),
    bone(3, 1300, 94, 10), bone(3, 1334, 94, 10), bone(3, 1368, 94, 10),
    bone(3, 1402, 94, 10), bone(3, 1436, 94, 10), bone(3, 1470, 94, 10)
  ]
});

export const DASHBOARD_BONES: ResponsiveBones = {
  breakpoints: {
    0: mobileSnapshot(),
    1000: desktopSnapshot()
  }
};
