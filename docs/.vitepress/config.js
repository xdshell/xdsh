export default {
  base: '/xdsh/',
  themeConfig: {
    siteTitle: 'Xdsh',
    nav: [
      { text: '指南', link: '/guide/Xdsh简介/什么是Xdsh' },
      { text: '栗子', link: 'https://insorker.github.io/xdsh/project/' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changlog', link: 'https://github.com/insorker/xdsh/blob/master/CHANGELOG.md' },
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/insorker/xdsh' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Xdsh简介',
          items: [
            { text: 'Xdsh简介', link: '/guide/Xdsh简介/什么是Xdsh' },
            { text: '快速开始', link: '/guide/Xdsh简介/快速开始' },
          ]
        },
        {
          text: '自定义开发',
          items: [
            { text: 'API', link: '/guide/自定义开发/API' },
            { text: '文件系统', link: '/guide/自定义开发/文件系统' },
            { text: '命令', link: '/guide/自定义开发/命令' },
            { text: '快捷键', link: '/guide/自定义开发/快捷键' },
          ]
        }
      ],
    }
  },
}