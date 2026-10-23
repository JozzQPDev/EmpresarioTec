import type { CompactBone, ResponsiveBones, SkeletonResult } from 'boneyard-js';

const bone = (x: number, y: number, w: number, h: number, r = 6, container = false): CompactBone =>
  container ? [x, y, w, h, r, true] : [x, y, w, h, r];

const mobileSnapshot = (): SkeletonResult => ({
  name: 'dashboard',
  viewportWidth: 375,
  width: 335,
  height: 1370,
  bones: [
    bone(0, 0, 38, 14), bone(0, 24, 72, 10),
    bone(0, 60, 100, 78, 12, true), bone(5, 76, 42, 10), bone(5, 98, 68, 22), bone(5, 125, 52, 7),
    bone(0, 150, 100, 78, 12, true), bone(5, 166, 48, 10), bone(5, 188, 30, 22), bone(5, 215, 58, 7),
    bone(0, 240, 100, 78, 12, true), bone(5, 256, 48, 10), bone(5, 278, 34, 22), bone(5, 305, 62, 7),
    bone(0, 330, 100, 78, 12, true), bone(5, 346, 56, 10), bone(5, 368, 44, 22), bone(5, 395, 54, 7),
    bone(0, 430, 100, 220, 12, true), bone(5, 448, 54, 12), bone(5, 468, 38, 8),
    bone(8, 570, 8, 56), bone(21, 548, 8, 78), bone(34, 584, 8, 42), bone(47, 526, 8, 100),
    bone(60, 566, 8, 60), bone(73, 540, 8, 86), bone(86, 576, 8, 50),
    bone(0, 668, 100, 206, 12, true), bone(5, 686, 52, 12), bone(5, 706, 62, 8),
    bone(5, 738, 90, 8), bone(5, 758, 76, 8), bone(5, 778, 84, 8), bone(5, 798, 66, 8),
    bone(0, 892, 100, 206, 12, true), bone(5, 910, 48, 12), bone(5, 930, 68, 8),
    bone(5, 970, 90, 8), bone(5, 990, 72, 8), bone(5, 1010, 82, 8), bone(5, 1030, 62, 8),
    bone(0, 1116, 100, 240, 12, true), bone(5, 1134, 46, 12), bone(5, 1164, 90, 10),
    bone(5, 1192, 90, 10), bone(5, 1220, 90, 10), bone(5, 1248, 90, 10), bone(5, 1276, 90, 10)
  ]
});

const desktopSnapshot = (): SkeletonResult => ({
  name: 'dashboard',
  viewportWidth: 1280,
  width: 1200,
  height: 1020,
  bones: [
    bone(0, 0, 36, 14), bone(0, 24, 54, 10), bone(88, 0, 12, 36, 8, true),
    bone(0, 66, 23, 112, 12, true), bone(26, 66, 23, 112, 12, true),
    bone(52, 66, 23, 112, 12, true), bone(78, 66, 22, 112, 12, true),
    bone(2, 82, 14, 9), bone(2, 104, 15, 22), bone(2, 148, 18, 7),
    bone(28, 82, 14, 9), bone(28, 104, 15, 22), bone(28, 148, 18, 7),
    bone(54, 82, 14, 9), bone(54, 104, 15, 22), bone(54, 148, 18, 7),
    bone(80, 82, 14, 9), bone(80, 104, 15, 22), bone(80, 148, 18, 7),
    bone(0, 202, 65, 270, 12, true), bone(68, 202, 32, 270, 12, true),
    bone(3, 220, 28, 12), bone(3, 240, 34, 8),
    bone(6, 410, 7, 42), bone(17, 390, 7, 62), bone(28, 424, 7, 28),
    bone(39, 374, 7, 78), bone(50, 407, 7, 45), bone(61, 388, 7, 64),
    bone(72, 416, 7, 36), bone(80, 220, 18, 12), bone(80, 246, 15, 8),
    bone(80, 284, 16, 8), bone(80, 326, 16, 8), bone(80, 368, 16, 8),
    bone(0, 496, 65, 220, 12, true), bone(68, 496, 32, 220, 12, true),
    bone(3, 514, 26, 12), bone(3, 534, 35, 8), bone(7, 630, 4, 46),
    bone(16, 610, 4, 66), bone(25, 640, 4, 36), bone(34, 592, 4, 84),
    bone(43, 620, 4, 56), bone(52, 602, 4, 74), bone(61, 634, 4, 42),
    bone(72, 514, 18, 12), bone(72, 542, 22, 70), bone(72, 626, 22, 8),
    bone(72, 650, 22, 8), bone(0, 740, 100, 250, 12, true),
    bone(3, 758, 26, 12), bone(3, 778, 38, 8),
    bone(3, 812, 94, 10), bone(3, 844, 94, 10), bone(3, 876, 94, 10),
    bone(3, 908, 94, 10), bone(3, 940, 94, 10), bone(3, 972, 94, 10)
  ]
});

export const DASHBOARD_BONES: ResponsiveBones = {
  breakpoints: {
    0: mobileSnapshot(),
    1000: desktopSnapshot()
  }
};
