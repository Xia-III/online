# -*- coding: utf-8 -*-
import re

# 读取文件
with open(r'G:\Project\Vue\hxll--欢喜技术支持\src\pages\officialWebsite.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 只替换模板部分（<template> 标签内）的内容
# 找到 <template> 和 </template> 的位置
template_start = content.find('<template>')
template_end = content.find('</template>') + len('</template>')

template_content = content[template_start:template_end]
before_template = content[:template_start]
after_template = content[template_end:]

# 定义替换规则（只替换模板内的文本）
replacements = [
    # 导航栏
    (r'(<span class="logo-text">)欢喜技术支持(</span>)', r'\1{{ $t(\'officialWebsite.siteName\') }}\2'),
    # 移动端菜单
    (r'goToSection\(\'home\'\)\)">首页(</a>)', r'goToSection(\'home\'))">{{ $t(\'nav.home\') }}\1'),
    (r'goToSection\(\'certificates\'\)\)">证书(</a>)', r'goToSection(\'certificates\'))">{{ $t(\'nav.certificates\') }}\1'),
    (r'goToPage\(\'/productCenter\'\)\)">产品中心(</a>)', r'goToPage(\'/productCenter\'))">{{ $t(\'nav.productCenter\') }}\1'),
    (r'goToPage\(\'/allCourses\'\)\)">操作教程(</a>)', r'goToPage(\'/allCourses\'))">{{ $t(\'nav.tutorials\') }}\1'),
    (r'goToPage\(\'/resourceDownload\'\)\)">资源下载(</a>)', r'goToPage(\'/resourceDownload\'))">{{ $t(\'nav.resources\') }}\1'),
    (r'goToPage\(\'/messageBoard\'\)\)">留言板(</a>)', r'goToPage(\'/messageBoard\'))">{{ $t(\'nav.messageBoard\') }}\1'),
    (r'goToPage\(\'/screenLightSetting\'\)\)">灯光 PK 榜 (</a>)', r'goToPage(\'/screenLightSetting\'))">{{ $t(\'nav.lightingPK\') }}\1'),
    (r'goToSection\(\'about\'\)\)">关于我们 (</a>)', r'goToSection(\'about\'))">{{ $t(\'nav.aboutUs\') }}\1'),
    (r'goToSection\(\'contact\'\)\)">联系我们 (</a>)', r'goToSection(\'contact\'))">{{ $t(\'nav.contactUs\') }}\1'),
    # 替换 English 链接为语言切换按钮
    (r'href="/officialWebsiteEnglish" class="nav-link"[^>]*>English(</a>)', r'href="#" class="nav-link" @click.prevent="switchLanguage">{{ currentLocale === \'zh\' ? $t(\'nav.english\') : $t(\'nav.chinese\') }}\1'),
]

# 应用替换
for pattern, replacement in replacements:
    template_content = re.sub(pattern, replacement, template_content)

# 合并内容
new_content = before_template + template_content + after_template

# 写回文件
with open(r'G:\Project\Vue\hxll--欢喜技术支持\src\pages\officialWebsite.vue', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("模板文本替换完成！")
