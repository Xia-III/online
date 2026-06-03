<template>
    <div class="imageDownload">
        <div class="header">
            <van-nav-bar left-text="返回" title="氛围动画下载更换视频教程" left-arrow @click-left="onBack" />
        </div>
        <div>
            <!-- <video src="../../static/img/shanghufenzhang.mp4" controls width="380" height="300"></video> -->
            <p>
                <video-player class="video-player vjs-custom-skin" ref="videoPlayer" :playsinline="true"
                    :options="playerOptions"></video-player>
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'imageDownload',
    data() {
        return {

            current: 0,
            playerOptions: {
                playbackRates: [0.7, 1.0, 1.5, 2.0], //播放速度
                autoplay: true, //如果true,浏览器准备好时开始播放。
                muted: false, // 默认情况下将会消除任何音频。
                loop: false, // 导致视频一结束就重新开始。
                controls: true, //控制条
                preload: 'auto', //视频预加载  建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
                language: 'zh-CN',
                aspectRatio: '1:2', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
                fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
                sources: [{
                    type: "video/mp4",
                    src: "https://www.huanxizn.com/portal/static/img/tupianxiazai.mp4" //url地址
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
        }
    }
}
</script>

<style lang="less" scoped>
@import '../base/css/public.less';

.imageDownload {
    width: 100%;
    padding-top: 0.3rem;

    .header {
        .van-nav-bar {
            height: 1.08rem;
            line-height: 1.08rem;

            /deep/ .van-nav-bar__title {
                font-size: 0.43rem;
            }

            /deep/ .van-nav-bar__left {
                padding: 0 0.13rem 0 0;
                font-size: 0.42rem;

                .van-nav-bar__arrow {
                    font-size: 0.48rem;
                }
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
