// version.js - 应用版本信息
// 从 manifest.json 获取版本信息
let appVersion = {
  versionName: '0.0.0', // 默认版本号
};

// 尝试获取真实的版本信息
try {
  // 在 uni-app 中，可以通过 __uniConfig 或者全局变量获取应用信息
  if (typeof __uniConfig !== 'undefined' && __uniConfig?.manifest?.versionName) {
    appVersion.versionName = __uniConfig.manifest.versionName;
  } else if (typeof uni !== 'undefined') {
    // 也可以尝试使用 uni 对象获取应用信息
    // 但这在所有平台上可能不可用
  }
} catch (error) {
  console.error('获取应用版本信息时出错:', error);
}

// 尝试从环境变量或构建时注入的版本信息覆盖
if (process.env.UNI_APP_VERSION_NAME) {
  appVersion.versionName = process.env.UNI_APP_VERSION_NAME;
}

export default appVersion;