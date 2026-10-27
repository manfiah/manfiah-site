/**
 * ============================================================
 *  摄影集 / 系列数据 —— TODO 换成你自己的照片系列
 * ============================================================
 *  字段说明：
 *    slug    系列标识（英文，用于未来链接）
 *    year    年份
 *    count   张数
 *    title   { zh: "中文名", en: "English name" }
 *    summary { zh: "中文描述", en: "English description" }
 *    tags    标签数组
 * ============================================================
 */

export const projects = [
  {
    slug: "sunset-and-car",
    year: 2026,
    count: 12,
    title: { zh: "日落与车", en: "Sunset & Car" },
    summary: {
      zh: "傍晚六点之后的车与光：金属、玻璃、还有退到背景里的山。",
      en: "Cars and light after six: metal, glass, and mountains fading into the background.",
    },
    tags: ["车", "日落", "胶片感"],
  },
  {
    slug: "halls",
    year: 2026,
    count: 8,
    title: { zh: "展馆", en: "Halls" },
    summary: {
      zh: "展厅里的车像被陈列的标本，安静、克制、有秩序。",
      en: "Cars in a showroom feel like specimens: quiet, restrained, in order.",
    },
    tags: ["室内", "建筑", "光"],
  },
  {
    slug: "roads",
    year: 2025,
    count: 16,
    title: { zh: "公路", en: "Roads" },
    summary: {
      zh: "从一个目的地开往下一个目的地的途中，那些没打算拍下的画面。",
      en: "The frames you never planned to take, on the way from one place to the next.",
    },
    tags: ["公路", "旅途", "风景"],
  },
  {
    slug: "still",
    year: 2025,
    count: 6,
    title: { zh: "静物", en: "Still" },
    summary: {
      zh: "钥匙、方向盘、后视镜上的一小块反光。",
      en: "Keys, steering wheels, a small reflection on the mirror.",
    },
    tags: ["静物", "细节"],
  },
];
