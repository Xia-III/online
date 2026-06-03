<template>
    <div class="product-details">
        <div class="header">
            <van-nav-bar left-text="返回" :title="list.title" left-arrow @click-left="onBack" />
        </div>

        <van-tabs v-model="active" v-show="this.id == 3">
            <van-tab title="绑定教程" name="a">
                <div class="content">
                    <img v-for="(item, index) in list.admin" :src="item" :key="item" @click="yltp1(index)">
                    <p v-show="this.list.admin == ''">暂无教程</p>
                </div>
            </van-tab>
            <van-tab title="安装视频" name="b">
                <p v-if="playerOptions.sources[0].src == ''">暂无视频</p>
                <p v-else>
                    <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true"
                        :options="playerOptions"></video-player>
                </p>
            </van-tab>
        </van-tabs>
        <div class="content1" v-show="this.id != 3">
            <img v-for="(item, index) in list.admin" :src="item" :key="item" @click="yltp1(index)">
            <p v-show="this.list.admin == ''">暂无教程</p>
        </div>
        <!-- 内容 -->

        <!-- 内容end -->
        <van-popup class="van-popup-load" :overlay="false" v-model="showLoading">
            <van-loading color="#1989fa" />
        </van-popup>
    </div>
</template>

<script>
import $http from 'axios'
import { Dialog, Toast, ImagePreview } from 'vant'
export default {
    name: 'productDetails',
    data() {
        return {
            list: [],
            showLoading: false,
            id: '',
            active: 'a',
            current: 0,
            sum: 0,
            scrollTop: 0,
            fileList: false,
            playerOptions: {
                playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
                autoplay: false, //如果true,浏览器准备好时开始播放。
                muted: false, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                controls: true, //控制条
                preload: 'auto', //视频预加载  建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '1:1', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [{
                    type: "video/mp4",
                    src: "" //url地址
                }],
                poster: "", //你的封面地址
                width: document.documentElement.clientWidth,
                notSupportedMessage: '此视频暂无法播放，请稍后再试', //允许覆盖Video.js无法播放媒体源时显示的默认信息。
                controlBar: {
                    timeDivider: true,
                    durationDisplay: true,
                    remainingTimeDisplay: false,
                    fullscreenToggle: true  //全屏按钮
                }
            }
        }
    },
    methods: {
        onBack() {
            this.$router.go(-1);
            this.current = 0
        },
        fetchData() {
            this.showLoading = true;
            $http.get('./static/json/product.json').then(res => {
                this.showLoading = false;
                this.list = res.data.find((item) => {   //获取对应id的数据  filter返回数组，find返回对象
                    return item.id == this.id;
                });
                this.playerOptions.sources[0].src = this.list.video;
            })
        },
        onChange(index) {
            this.current = index;
        },
        //预览图片
        yltp1(index) {
            let that = this;
            sessionStorage.setItem('scrollTop1', that.scrollTop);
            ImagePreview({
                images: that.list.admin,
                startPosition: index,
                onClose() {
                    that.fileList = true;
                }
            });
        },
        handleScroll() {
            //改变元素#searchBar的top值
            this.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        },
        timerScTopList(value) {
            if (value) {
                let scrollTop = sessionStorage.getItem('scrollTop1');
                var timeScrollTop = setInterval(() => {
                    window.scroll(0, scrollTop);  //设置页面回到提交前的高度
                    if (this.scrollTop == scrollTop) {
                        clearInterval(timeScrollTop);
                        this.fileList = false;
                    }
                }, 15);
            }
        }
    },
    mounted() {
        //给window添加一个滚动滚动监听事件
        window.addEventListener('scroll', this.handleScroll);

    },
    destroyed() {
        //离开该页面需要移除这个监听的事件
        window.removeEventListener('scroll', this.handleScroll);
    },
    created() {
        this.id = this.$route.params.detId;
        if (this.id) {
            this.fetchData();
        }

    },
    watch: {
        // 监听data中的数据
        fileList(val) {
            this.timerScTopList(val);
        },
        //监测路由的变化
        $route() {
            let url = location.href;
            url = (url.indexOf("/productDetails/") != -1);
            if (url == true) {
                this.id = this.$route.params.detId;
                if (this.id) {
                    this.fetchData();
                }
            }
        }
    }
}
</script>

<style lang="less">
@import '../base/css/public.less';

.product-details {
    .header {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10;
        width: 100%;

        .van-nav-bar {
            height: 1.08rem;

            .van-nav-bar__left {
                padding: 0 0.23rem;
                font-size: 0.42rem;

                .van-nav-bar__arrow {
                    font-size: 0.48rem;
                }
            }

            .van-nav-bar__title {
                font-size: .35rem;
            }
        }
    }

    .content,
    .content1 {
        img {
            display: block;
            width: 96%;
            margin: .2rem auto 0;
            border-radius: .2rem;
        }

        p {
            color: #ababab;
            text-align: center;
            font-size: .35rem;
            padding: .2rem 0;
        }
    }

    .content1 {
        background-color: #000;
        padding: 1.1rem 0 .2rem;
    }

    .swipe {
        padding-top: 1.1rem;
    }

    .custom-indicator {
        position: absolute;
        right: 5px;
        bottom: 5px;
        padding: 2px 5px;
        font-size: .3rem;
        background: rgba(0, 0, 0, 0.1);
    }

    .van-tabs {
        .van-tabs__wrap {
            border-top: 1px solid #fdfdfd;
            position: fixed;
            top: 1.07rem;
            left: 0;
            right: 0;
            z-index: 11;
            height: 1rem;
            line-height: 1rem;

            .van-tabs__nav--line {
                .van-tab {
                    font-size: 0.38rem;
                }

                .van-tabs__line {
                    background-color: #229ddd;
                }
            }
        }

        .van-hairline--top-bottom::after,
        .van-hairline-unset--top-bottom::after {
            border-width: 0px 0;
        }

        .van-tabs__content {
            padding-top: 2.25rem;
            background-color: #000;

            .van-tab__pane {
                padding: .1rem 0 .2rem 0;
                text-align: center;
            }

            .vjs-control-bar {
                font-size: .2rem;
            }

            p {
                color: #ababab;
                text-align: center;
                font-size: .35rem;
                padding: .2rem 0;
            }
        }
    }

    .video-src {
        width: 90%;
        margin: 0 auto;
    }

    .van-swipe-item {
        text-align: center;
        background-color: #fff;

        img {
            width: 90%;
            height: 90%;
        }

        img[lazy=loading] {
            width: 0.75rem;
            height: 0.75rem;
        }
    }

    fieldset,
    img {
        width: 95%;
    }

    img[lazy=loading] {
        width: 0.75rem;
        height: 0.75rem;
    }
}

.van-image__img {
    display: block;
    width: 90%;
    margin: 0 auto;
    height: 100%;
}
</style>
