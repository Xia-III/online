<template>
    <div class="index">
        <!-- 头部 -->
        <div class="index-top">
            <!-- <img class="logo" src="../../static/img/logo.jpg" />
            <div class="index_right">云里的纱幔平台</div> -->
            后台技术支持
        </div>
        <!-- 头部end -->

        <!-- 头部轮播 -->
        <div class="lunbo" @click="admin()">
            <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
                <van-swipe-item>
                    <img src="../../static/img/lunbo1.png" />
                </van-swipe-item>
                <van-swipe-item>
                    <img src="../../static/img/lunbo2.png" />
                </van-swipe-item>
            </van-swipe>
        </div>
        <!-- 头部轮播 end-->

        <!-- 产品展示 -->
        <div class="product">
            <div class="section-title">产品展示</div>
            <p class="section-subtitle">我们提供专业的技术支持产品</p>

            <div class="product-grid">
                <div class="product-card" v-for="(item, index) in products" :key="index" @click="goToProductDetail(item)">
                    <div class="product-cover">
                        <img v-lazy="item.image" :alt="item.name" class="product-image">
                        <div class="product-overlay">
                            <h3 class="product-name">{{ item.name }}</h3>
                        </div>
                    </div>
                    <div class="product-footer">
                        <div class="product-price-row">
                            <span class="price" v-if="item.price">¥{{ item.price }}</span>
                            <span class="tag" v-if="item.tag">{{ item.tag }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 功能导航 -->
        <div class="flow">
            <!-- 注册教程 -->
            <!-- <img src="../../static/img/zc_bcg.png" class="bcg" @click="toflow()" /> -->
            <!-- 商户分账设置 -->
            <!-- <div class="fenrun">
                <img src="../../static/img/shanghufenrun.png" class="bcg" @click="tomerchant()" />
            </div> -->
            <!-- 设备教程 -->
            <!-- <div class="row" v-for="item of list" :key="item.id" @click="toDetails(item)">
                <img v-lazy="item.img" :key="item.img">
            </div> -->
            <div class="bcgImg" @click="toJiaoCheng()">
                <img src="../../static/img/01.png" alt="">
                <div class="Indextext">
                    <p>操作教程</p>
                    <p>OPERATION TUTORIAL</p>
                </div>
                <img src="../../static/img/enter.png" class="indexEnter" alt=""> 
            </div>

            <div class="bcgImg" @click="toZiyuanxiazai()">
                <img src="../../static/img/02.png" alt="">
                <div class="Indextext">
                    <p>资源下载</p>
                    <p>RESOURCE DOWNLOAD</p>
                </div>
                <img src="../../static/img/enter.png" alt="" class="indexEnter">
            </div>
            <div class="bcgImg" @click="toliuyanban()">
                <img src="../../static/img/03.png" alt="">
                <div class="Indextext">
                    <p>留言板</p>
                    <p>LIuYANB</p>
                </div>
                <img src="../../static/img/enter.png" alt="" class="indexEnter">
            </div>
            <div class="bcgImg" @click="todengguang()">
                <img src="../../static/img/04.png" alt="">
                <div class="Indextext">
                    <p>灯光PK榜</p>
                    <p>LIGHTING PK CHART</p>
                </div>
                <img src="../../static/img/enter.png" alt="" class="indexEnter">
            </div>
        </div>
    </div>
</template>

<script>
import $http from 'axios'
import { Dialog, Toast, ImagePreview } from 'vant'
export default {
    name: 'index',
    data() {
        return {
            // 产品列表数据
            products: [
                // 示例格式（添加产品时取消注释并修改）:
                // {
                //   image: require('../../static/img/products/product_1.png'),
                //   name: '智能控制系统',
                //   description: '专业的后台技术支持系统',
                //   price: '1999',
                //   tag: '热销'
                // },
                // {
                //   image: require('../../static/img/products/product_2.png'),
                //   name: '灯光控制设备',
                //   description: '智能灯光控制解决方案',
                //   price: '899',
                //   tag: '新品'
                // }
            ]
        }
    },
    methods: {
        admin() {
            location.href = 'https://www.huanxizn.com/admin/';
        },

        goToProductDetail(item) {
            // 跳转到产品详情页或显示产品详情
            Toast('查看产品详情：' + item.name);
        },

        toJiaoCheng() {
            this.$router.push({
                name: 'allCourses',
            });
        },

        toliuyanban() {
            this.$router.push({
                name: 'messageBoard',
            });
        },
        toZiyuanxiazai() {
            this.$router.push({
                name: 'resourceDownload',
            });
        },
        todengguang() {
            this.$router.push({
                name: 'screenLightSetting',
            });
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
.index {
    .index-top {
        background: #fff;
        padding: .3rem;
        display: flex;
        justify-content: center;
        align-items: center;

        .logo {
            width: 0.75rem;
        }

        img[lazy=loading] {
            width: 0.75rem;
            height: 0.75rem;
        }

        .index_right {
            padding-left: .3rem;
            letter-spacing: .1rem;
            font-size: .4rem;
            font-weight: 600;
        }
    }

    .lunbo {
        margin: 0.5rem .35rem;

        .my-swipe {
            border-radius: 0.32rem;

            img {
                width: 100%;
                text-align: center;
            }

            .van-swipe__indicator {
                width: 0.23rem;
                height: 0.23rem;
            }
        }
    }




    // 产品展示区域
    .product {
        margin: 0 0.35rem;
        padding: .6rem .5rem;
        background-color: rgb(245, 250, 254);
        border-radius: 0.32rem;

        .section-title {
            font-size: 0.5rem;
            font-weight: 600;
            text-align: center;
            margin-bottom: 0.2rem;
            color: #333;
        }

        .section-subtitle {
            font-size: 0.28rem;
            text-align: center;
            color: #999;
            margin-bottom: 0.5rem;
        }

        .product-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.3rem;

            .product-card {
                background: #fff;
                border-radius: 0.2rem;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                transition: transform 0.3s;

                &:active {
                    transform: scale(0.98);
                }

                .product-cover {
                    position: relative;
                    width: 100%;
                    height: 3.5rem;
                    background: #f5f5f5;
                    overflow: hidden;

                    .product-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.3s;
                    }

                    .product-overlay {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        padding: 0.3rem 0.25rem;
                        background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
                        display: flex;
                        align-items: flex-end;

                        .product-name {
                            font-size: 0.32rem;
                            font-weight: 600;
                            color: #fff;
                            margin: 0;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            width: 100%;
                        }
                    }
                }

                .product-footer {
                    padding: 0.25rem;
                    background: #fff;

                    .product-price-row {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;

                        .price {
                            font-size: 0.36rem;
                            font-weight: 700;
                            color: #ff4400;
                        }

                        .tag {
                            font-size: 0.2rem;
                            padding: 0.05rem 0.15rem;
                            background: linear-gradient(135deg, #ff6b6b, #ff4400);
                            color: #fff;
                            border-radius: 0.1rem;
                        }
                    }
                }
            }
        }
    }

    // 功能导航区域
    .flow {
        margin: 0 0.35rem;
        padding: .6rem .5rem;
        background-color: rgb(245, 250, 254);
        border-radius: 0.32rem;

        .bcg {
            width: 100%;
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
        // width: 643px;
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
            width: 2.5rem;
            // background-color: red;

            p:nth-child(1) {
                font-size: .4rem;
                font-weight: 600;
            }

            p:nth-child(2) {
                font-size: .2rem;
                color: #ababab;
            }
        }

        img {
            width: 1.5rem;
            height: 1.5rem;
            object-fit: contain
        }

        .indexEnter {
            width: 2rem;
            height: .7rem;

            object-fit: contain
        }

    }
}
</style>
