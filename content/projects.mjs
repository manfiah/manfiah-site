/**
 * ============================================================
 *  专栏 / 系列数据
 * ============================================================
 *  字段说明：
 *    slug    系列标识（用于详情页网址）
 *    dir     可选：照片目录名（src/assets/<dir>/），有照片才显示照片墙
 *    year    年份
 *    count   张数（有 dir 时自动按目录内图片数计算）
 *    title   { zh: "中文名", en: "English name" }
 *    summary { zh: "中文描述", en: "English description" }
 *    tags    标签数组
 * ============================================================
 */

export const projects = [
  {
    slug: "vehicles",
    year: 2026,
    count: 12,
    title: { zh: "车辆", en: "Vehicles" },
    summary: {
      zh: "日落前后的车与光：金属、玻璃，还有退到背景里的山。",
      en: "Cars and light around sunset: metal, glass, and mountains fading behind.",
    },
    tags: ["车", "日落", "胶片感"],
  },
  {
    slug: "wuthering-waves",
    dir: "wuthering-waves",
    year: 2026,
    count: 60,
    title: { zh: "鸣潮摄影", en: "Wuthering Waves" },
    summary: {
      zh: "在《鸣潮》里按下快门的那些瞬间：光、水汽，和远处的轮廓。",
      en: "Frames captured in Wuthering Waves: light, mist and the far-off silhouettes.",
    },
    tags: ["游戏摄影", "鸣潮", "风景"],
  },
  {
    slug: "landscapes",
    year: 2025,
    count: 16,
    title: { zh: "自然风光", en: "Landscapes" },
    summary: {
      zh: "山、海、云和光——路上看到的自然。",
      en: "Mountains, sea, clouds and light — nature seen along the way.",
    },
    tags: ["自然", "风光", "摄影"],
  },
  {
    slug: "playlist",
    year: 2025,
    count: 0,
    title: { zh: "manfiah歌单", en: "manfiah Playlist" },
    summary: {
      zh: "music so good, even devil may cry",
      en: "music so good, even devil may cry",
    },
    tags: ["歌单", "音乐"],
  },
  {
    slug: "software",
    year: 2026,
    count: 0,
    title: { zh: "软件设计", en: "Software Design" },
    summary: {
      zh: "占位中，资料稍后补上。",
      en: "Placeholder — details coming soon.",
    },
    tags: ["软件", "设计"],
  },
];
