<template>
    <div class="allCourses">
        <div class="header">
            <van-nav-bar title="操作教程" left-text="返回" left-arrow @click-left="onClickLeft">
            </van-nav-bar>
        </div>
        <!-- 教程 -->
        <div class="flow">
            <!-- 注册教程 -->
            <img src="../../static/img/zc_bcg.png" class="bcg" @click="toflow()" />
            <!-- 商户分账设置 -->
            <div class="fenrun">
                <img src="../../static/img/shanghufenrun.png" class="bcg" @click="tomerchant()" />
            </div>
            <!-- 设备教程 -->
            <div class="row" v-for="item of list" :key="item.id" @click="toDetails(item)">
                <img v-lazy="item.img" :key="item.img">
            </div>
        </div>
    </div>
</template>

<script>
import $http from 'axios'
import { Dialog, Toast, ImagePreview } from 'vant'
export default {
    name: 'allCourses',
    data() {
        const that = this;
        return {
            list: []
        }
    },
    methods: {
        onClickLeft() {
            this.$router.push('/');
        },
        getData() {
            $http.get('./static/json/product.json').then(res => {
                this.list = res.data;
            })
        },
        toDetails(item) {
            this.rowId = item.id;
            this.$router.push({
                name: 'productDetails',
                params: {
                    detId: item.id
                }
            });
        },
        admin() {
            // 原来：location.href = 'https://www.huanxizn.com/admin/';
            location.href = 'https://www.huanxizn.com/admin/';
        },
        toflow() {
            this.$router.push({
                name: 'flow',
            });
        },
        tomerchant() {
            this.$router.push({
                name: 'merchant',
            });
        },

        handleScroll() {
            //改变元素#searchBar的top值
            this.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        },
        timerScTopList(value) {
            if (value) {
                let scrollTop = sessionStorage.getItem('scrollTop3');
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
        this.getData()

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
        $route() {
            var urlStr = location.href;
            var index = urlStr.lastIndexOf('\/');
            urlStr = urlStr.substring(index + 1, urlStr.length);
            if (urlStr == 'index') {

            }
        }
    }
}
</script>

<style lang="less">
.allCourses {
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
}
</style>
