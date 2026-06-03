<template>
    <div class="resourceCourses">
        <div class="header">
            <van-nav-bar title="操作教程" left-text="返回" left-arrow @click-left="onClickLeft">
            </van-nav-bar>
        </div>
        <!-- 教程 -->
        <div class="flow">
            <div class="bcgImg" @click="tolamp()">
                <div class="Indextext">
                    <p>灯带模板更换视频教程</p>
                    <p>点击进入</p>
                </div>

            </div>

            <div class="bcgImg" @click="toimageDol()">
                <div class="Indextext">
                    <p>氛围动画下载更换视频教程</p>
                    <p>点击进入</p>
                </div>

            </div>

        </div>
    </div>
</template>

<script>
import $http from 'axios'
import { Dialog, Toast, ImagePreview } from 'vant'
export default {
    name: 'resourceCourses',
    data() {
        const that = this;
        return {
            list: []
        }
    },
    methods: {
        onClickLeft() {
            this.$router.go(-1);
        },

        toimageDol() {
            this.$router.push({
                name: 'imageDownload'
            });
        },

        tolamp() {
            this.$router.push({
                name: 'lampTemplate',
            });
        },
    }
}
</script>

<style lang="less">
.resourceCourses {
    .header {
        .van-nav-bar {
            height: 1.08rem;
            line-height: 1.08rem;

            .van-nav-bar__title {
                font-size: 0.43rem;
            }

            .van-nav-bar__left {
                padding: 0 0.13rem 0 0;
                font-size: 0.42rem;

                .van-nav-bar__arrow {
                    font-size: 0.48rem;
                }
            }
        }
    }


    .flow,
    .product {
        margin: 0.35rem;
        padding: .6rem .5rem;
        background-color: #fff;
        border-radius: 0.32rem;

        .bcg {
            width: 100%;
            display: block;
        }

        .fenrun {
            margin-top: 0.4rem;
        }

        .row {
            margin-top: 0.4rem;

            img {
                width: 100%;
            }
        }
    }

    .bcgImg {
        // width: 8.5rem;
        height: 2rem;
        background-color: #fff;
        margin-bottom: .5rem;
        border-radius: .5rem;
        box-shadow: 2px 2px 9px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: space-evenly;

        .Indextext {
            text-align: center;
            // width: 300px;
            // background-color: red;

            p:nth-child(1) {
                font-size: .4rem;
                font-weight: 600;
            }

            p:nth-child(2) {
                font-size: .3rem;
                color: #ababab;
            }
        }

    }
}
</style>
