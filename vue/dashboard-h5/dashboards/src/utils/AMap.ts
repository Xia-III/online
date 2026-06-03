// 需先安装依赖包：npm i @amap/amap-jsapi-loader --save

import AMapLoader from '@amap/amap-jsapi-loader'

const load = (options?: {
    plugins?: Array<string>
    AMapUI?: {
        plugins?: Array<string>
    }
}) => {
    // if (!window._AMapSecurityConfig) {
    //     window._AMapSecurityConfig = {
    //         securityJsCode: "4ce5be4cad42fca8ded542e8f0ee7bd4"
    //     }
    // }
    return AMapLoader.load({
        key: 'b819fb45829e16753895554f0a248c22', // 申请好的Web端开发者Key，首次调用 load 时必填
        version: '2.0',
        plugins: options?.plugins || [],
        AMapUI: {
            version: '1.1',
            plugins: options?.AMapUI?.plugins || []
        },
        Loca: {
            //是否加载 Loca， 缺省不加载
            version: "2.0", //Loca 版本
        },
    })
}

export default {
    load
}
