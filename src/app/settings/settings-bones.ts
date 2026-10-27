import type { CompactBone, ResponsiveBones, SkeletonResult } from 'boneyard-js';

const bone = (x: number, y: number, width: number, height: number, radius = 6, container = false): CompactBone =>
  container ? [x, y, width, height, radius, true] : [x, y, width, height, radius];

const mobileSnapshot = (): SkeletonResult => ({
  name: 'settings',
  viewportWidth: 375,
  width: 335,
  height: 660,
  bones: [
    bone(0, 0, 62, 18), bone(0, 28, 86, 8),
    bone(0, 58, 100, 40, 10, true),
    bone(4, 70, 18, 14), bone(27, 70, 26, 14), bone(59, 70, 24, 14),
    bone(0, 116, 100, 310, 12, true),
    bone(5, 134, 13, 36, 36), bone(23, 138, 46, 10), bone(23, 155, 64, 7),
    bone(5, 195, 24, 7), bone(5, 211, 76, 11),
    bone(5, 239, 35, 7), bone(5, 255, 88, 11),
    bone(5, 283, 32, 7), bone(5, 299, 36, 11),
    bone(5, 335, 90, 8), bone(5, 355, 88, 8),
    bone(5, 382, 40, 28, 7),
    bone(0, 444, 100, 110, 12, true),
    bone(5, 462, 50, 10), bone(5, 482, 70, 8),
    bone(5, 510, 88, 34, 8),
    bone(0, 574, 100, 70, 12, true),
    bone(5, 592, 44, 9), bone(5, 612, 80, 8)
  ]
});

const desktopSnapshot = (): SkeletonResult => ({
  name: 'settings',
  viewportWidth: 1280,
  width: 1200,
  height: 670,
  bones: [
    bone(0, 0, 30, 20), bone(0, 29, 48, 9),
    bone(0, 62, 15, 188, 10, true),
    bone(2, 78, 11, 12), bone(2, 106, 11, 12), bone(2, 134, 11, 12),
    bone(20, 62, 80, 420, 12, true),
    bone(23, 80, 12, 36, 36), bone(38, 82, 27, 10), bone(38, 101, 34, 8),
    bone(23, 143, 26, 7), bone(23, 161, 67, 12),
    bone(23, 208, 26, 7), bone(23, 226, 74, 12),
    bone(23, 271, 26, 7), bone(23, 289, 40, 12),
    bone(23, 337, 75, 8), bone(23, 359, 75, 8),
    bone(23, 389, 32, 28, 7),
    bone(20, 500, 80, 145, 12, true),
    bone(23, 518, 34, 10), bone(23, 539, 48, 8),
    bone(23, 568, 75, 42, 8)
  ]
});

export const SETTINGS_BONES: ResponsiveBones = {
  breakpoints: {
    0: mobileSnapshot(),
    1000: desktopSnapshot()
  }
};
