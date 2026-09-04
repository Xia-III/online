<template>
    <div class="flow">
        <div class="header">
            <van-nav-bar left-text="返回" title="管理后台注册教程" left-arrow @click-left="onBack" />
        </div>
        <!-- 头部 -->
        <div class="flow_top">
            <img class="logo" v-for="(item, index) in list" v-lazy="item" :key="item" @click="yltp(index)" />
            <p>恭喜您成为合作伙伴!</p>
        </div>
        <!-- 头部end -->

    </div>
</template>

<script>
import $http from 'axios'
import { Dialog, Toast, ImagePreview } from 'vant'
export default {
    name: 'flow',
    data() {
        const that = this;
        return {
            showLoading: false,
            //客服
            moveStatus: false,
            list: [
                'https://www.huanxizn.com/portal/img/flow/zhuce01.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce02.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce03.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce04.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce05.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce06.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce07.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce08.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce09.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce10.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce11.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce12.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce13.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce14.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce15.jpg',
                'https://www.huanxizn.com/portal/img/flow/zhuce16.jpg'

            ],
            scrollTop: 0,
            fileList: false
        }
    },
    components: {

    },
    methods: {
        onBack() {
            this.$router.go(-1);
            this.current = 0
        },
        //预览图片
        yltp(index) {
            let that = this;
            sessionStorage.setItem('scrollTop2', that.scrollTop);
            ImagePreview({
                images: that.list,
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
                let scrollTop = sessionStorage.getItem('scrollTop2');
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
    created() {

    },
    mounted() {
        //给window添加一个滚动滚动监听事件
        window.addEventListener('scroll', this.handleScroll);

    },
    destroyed() {
        //离开该页面需要移除这个监听的事件
        window.removeEventListener('scroll', this.handleScroll);
    },
    watch: {
        // 监听data中的数据
        fileList(val) {
            this.timerScTopList(val);
        },
        //监测路由的变化
        $route() {
            let url = location.href;
            url = (url.indexOf("/flow/") != -1);
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
.flow {
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

    .flow_top {
        padding-top: 1.1rem;
        background-color: #000;

        img {
            display: block;
            width: 96%;
            margin: .2rem auto 0;
            border-radius: .2rem;
        }

        p {
            font-size: .4rem;
            text-align: center;
            padding: .2rem 0 .5rem 0;
            color: #fff;
        }
    }

}
</style>
