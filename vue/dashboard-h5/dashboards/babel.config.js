module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ]
  ,
  env: {
    dev: {
      plugins: ['dynamic-import-node']
    }
  }
  //,

  // plugins: [
  //   [
  //     "import",
  //     {
  //       libraryName: 'element-plus',
  //       customStyleName: (name) => {
  //         return `element-plus/lib/theme-chalk/${name}.css`;
  //       }
  //     }
  //   ]
  // ]

}
