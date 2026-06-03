import wx from 'weixin-js-sdk'
//引入axios
import {post,fetch,patch,put} from './request'
const wxApi = {
    /**
    * [wxRegister 微信Api初始化]
    * @param  {Function} callback [ready回调函数]
    */
    wxRegister (callback) {
        let url = location.href;
        url = (url.indexOf("/login") != -1);
        if(url == false){
            // 接口请求
            fetch('',{
                url: location.href   // 这里是当前页面的url，一定要 location.href 获取，不然签名会无效。
            }).then((res)=>{
                if(res.code == 200){ // res 返回的签名等数据
                    let data = res.data;
                    wx.config({
                        debug: false, // 开启调试模式
                        appId: data.appId, // 必填，公众号的唯一标识
                        timestamp: data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: data.nonceStr, // 必填，生成签名的随机串
                        signature: data.signature, // 必填，签名，见附录1
                        jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    })
                }else{
                    Toast(res.message);
                } 
            },(err) =>{
                if(err == 'Error: timeout of 5000ms exceeded'){
                    Toast('网络请求超时，请检查您的网络，然后刷新试试！');
                }
            });
            wx.ready((res) => {
                // 如果需要定制ready回调方法
                if (callback) {
                    callback()
                }
            })
        }
    },
    /**
    * [ShareTimeline 微信分享到朋友圈]
    * @param {[type]} option [分享信息]
    * @param {[type]} success [成功回调]
    * @param {[type]} error   [失败回调]
    */
    ShareTimeline (option) {
        wx.updateTimelineShareData({
            title: option.title, // 分享标题
            link: option.link, // 分享链接
            imgUrl: option.imgUrl, // 分享图标
            success () {
                // 用户成功分享后执行的回调函数
                option.success();
            },
            cancel () {
                // 用户取消分享后执行的回调函数
                option.error();
            }
        })
    },
    /**
    * [ShareAppMessage 微信分享给朋友]
    * @param {[type]} option [分享信息]
    * @param {[type]} success [成功回调]
    * @param {[type]} error   [失败回调]
    */
    ShareAppMessage (option) {
        wx.updateAppMessageShareData({
            title: option.title, // 分享标题
            desc: option.desc, // 分享描述
            link: option.link, // 分享链接
            imgUrl: option.imgUrl, // 分享图标
            success () {
                // 用户成功分享后执行的回调函数
                option.success();
            },
            cancel () {
                // 用户取消分享后执行的回调函数
                option.error();
            }
        })
    }
}
export default wxApi
