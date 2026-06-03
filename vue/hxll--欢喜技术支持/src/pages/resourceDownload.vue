<template>
    <div class="resourceDownload">
        <div class="header">
            <van-nav-bar title="资源下载" left-text="返回" left-arrow @click-left="onClickLeft">
            </van-nav-bar>
        </div>
        <!-- 教程 -->
        <div class="flow">
            <div class="bcgImg" style="background-color: antiquewhite;" @click="tovidio()">
                <div class="Indextext">
                    <p>视频教程</p>
                </div>
            </div>
            <div class="bcgImg" @click="toyouyi()">
                <div class="Indextext">
                    <p>游艺设备</p>
                </div>
            </div>

            <div class="bcgImg" @click="towawaj()">
                <div class="Indextext">
                    <p>娃娃机</p>
                </div>
            </div>
            <div class="bcgImg" @click="toniudanj()">
                <div class="Indextext">
                    <p>扭蛋机</p>
                </div>
            </div>
            <div class="bcgImg" @click="tolanqiuji()">
                <div class="Indextext">
                    <p>篮球机</p>
                </div>
            </div>
            <!-- 设备屏数 -->
            <van-popup class="popup-shopping" :style="{ height: '70%' }" :close-on-click-overlay="false"
                v-model="conCategory" :overlay="true" position="bottom">
                <div class="place-selcet">
                    <div class="content-header">
                        <span class="J_goBack" @click="conCategory = false">关闭</span>
                        <span class="title">{{ extDeviceName(dev) }}</span>
                    </div>
                    <!-- 列表 -->
                    <div class="row_goods_refresh">
                        <div class="blue van-cell" style="margin-bottom: 10px;  border-radius: 30px;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3); padding: 10px 5px;" v-for="(item, index) in pingList" :key="index">
                            <div class="title" @click="choiceNumber(item)">
                                <p>{{ item.title }}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </van-popup>
            <!-- 压缩包 -->
            <van-popup class="popup-shopping" :style="{ height: '70%' }" :close-on-click-overlay="false"
                v-model="showPing" :overlay="true" position="bottom">
                <div class="place-selcet">
                    <div class="content-header">
                        <span class="J_goBack" @click="showPing = false">关闭</span>
                        <span class="title">{{ extDeviceName(dev) }}</span>
                    </div>
                    <!-- 列表 -->
                    <div class="row_goods_refresh">
                        <div class="blue van-cell" style="margin-bottom: 10px;  border-radius: 30px;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3); padding: 10px 5px;" v-for="(item, index) in rarList" :key="index">
                            <div class="title" @click="getRar(item)">
                                <p style="font-size: .5rem;">{{ item.title }}</p>
                            </div>

                        </div>
                    </div>
                </div>
            </van-popup>

            <van-popup v-model="showCenter" round :style="{ padding: '40px' }">
                <div class="titles">
                    复制链接
                </div>
                <div ref="myInput" class="excelDatas">{{ `https://www.huanxizn.com//static/resource/` + this.devtype +
                this.pingNumber + '/' +
                this.rarData }}</div>
                <van-button size="large" type="primary" @click="toCopy">一键复制</van-button>
                <div class="tips">
                    请复制此链接，然后在浏览器打开，即可获取压缩包。
                </div>
            </van-popup>

        </div>
    </div>
</template>

<script>
import $http from 'axios'
import { Dialog, Toast, ImagePreview } from 'vant'
export default {
    name: 'resourceDownload',
    data() {
        return {
            list: [],
            conCategory: false,
            pingCount: [],
            dev: 0,
            pingList: [],
            showPing: false,
            rarList: [],
            rarData: '',
            showCenter: false,
            pingNumber: 0,
            devtype: ''

        }
    },
    methods: {
        onClickLeft() {
            this.$router.push('/');
        },

        tovidio() {
            this.$router.push({
                name: 'resourceCourses',
            });
        },
        toyouyi() {
            this.conCategory = true
            this.dev = 1
            this.pingList = [
                { title: '1屏', index: 5 },
                { title: '2屏', index: 1 },
                { title: '3屏', index: 2 },
                { title: '4屏', index: 3 },
                { title: '5屏', index: 4 },



            ]
        },

        towawaj() {
            this.conCategory = true
            this.dev = 5,
                this.pingList = [
                    { title: '1屏', index: 1 },
                    { title: '2屏', index: 2 },
                    { title: '3屏', index: 3 },
                    { title: '5屏', index: 5 },
                    { title: '15屏', index: 15 }
                ]


        },
        toniudanj() {
            this.conCategory = true
            this.dev = 8
            this.pingList = [
                { title: '1屏', index: 6 },
                { title: '2屏', index: 1 },
                { title: '3屏', index: 2 },
                { title: '4屏', index: 3 },
                { title: '5屏', index: 4 },
                { title: '6屏', index: 5 },
            ]
        },
        tolanqiuji() {
            this.conCategory = true
            this.dev = 9
            this.pingList = [
                { title: '1屏', index: 4 },
                { title: '2屏', index: 1 },
                { title: '3屏', index: 2 },
                { title: '5屏', index: 5 },


            ]
        },

        choiceNumber(item) {
            console.log(item);
            if (this.dev == 5) {
                if (item.title == '3屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '中秋模板(192x32)3屏.zip', index: 3, devtype: 'claw/' },
                        { title: '国庆节模板(192x32)3屏.zip', index: 3, devtype: 'claw/' },
                        { title: 'snailtimes(3屏)(新春氛围).zip', index: 3, devtype: 'claw/' },
                        { title: 'snailtimes(3屏)(圣诞元旦氛围).rar', index: 3, devtype: 'claw/' }
                    ]
                } else if (item.title == '5屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(320x32)5屏.zip', index: 5, devtype: 'claw/' },
                        { title: '中秋模板(320x32)5屏.zip', index: 5, devtype: 'claw/' },
                        { title: 'snailtimes5屏(圣诞元旦氛围).rar', index: 5, devtype: 'claw/' },
                        { title: 'snailtimes(5屏)(新春氛围).zip', index: 5, devtype: 'claw/' },

                    ]
                } else if (item.title == '2屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(128x32)2屏.zip', index: 2, devtype: 'claw/' },
                        { title: '中秋模板(128x32)2屏.zip', index: 2, devtype: 'claw/' },
                        { title: 'snailtimes(2屏)(新春氛围).zip', index: 2, devtype: 'claw/' },
                    ]
                } else if (item.title == '1屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '中秋模板64x32(1屏).zip', index: 1, devtype: 'claw/' },
                        { title: '国庆节模板64x32(1屏).zip', index: 1, devtype: 'claw/' },
                    ]
                }
                else {
                    Toast('暂无压缩包')
                }

            } else if (this.dev == 8) {
                if (item.title == '4屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: 'snailtimes(4屏)(新春氛围).zip', index: 4, devtype: 'gashapon/' },
                        { title: '2层扭蛋机(256x32)(国庆模板).zip', index: 4, devtype: 'gashapon/' },
                        { title: '2层扭蛋机(256x32)(中秋模板).zip', index: 4, devtype: 'gashapon/' },


                    ]
                } else if (item.title == '1屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '中秋模板64x32(1屏).zip', index: 1, devtype: 'gashapon/' },
                        { title: '国庆节模板64x32(1屏).zip', index: 1, devtype: 'gashapon/' },
                    ]
                }
                else if (item.title == '6屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: 'snailtimes(6屏)(新春氛围).zip', index: 6, devtype: 'gashapon/' },
                        { title: '3层扭蛋机(384x32)(国庆模板).zip', index: 6, devtype: 'gashapon/' },
                        { title: '3层扭蛋机(384x32)(中秋模板).zip', index: 6, devtype: 'gashapon/' },

                    ]
                } else if (item.title == '2屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(128x32)2屏.zip', index: 2, devtype: 'gashapon/' },
                        { title: '中秋模板(128x32)2屏.zip', index: 2, devtype: 'gashapon/' },
                    ]
                } else if (item.title == '3屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆节模板(192x32)3屏.zip', index: 3, devtype: 'gashapon/' },
                        { title: '中秋模板(192x32)3屏.zip', index: 3, devtype: 'gashapon/' },
                    ]
                } else if (item.title == '5屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(320x32)5屏.zip', index: 5, devtype: 'gashapon/' },
                        { title: '中秋模板(320x32)5屏.zip', index: 5, devtype: 'gashapon/' },
                    ]
                }
                else {
                    Toast('暂无压缩包')
                }

            } else if (this.dev == 1) {
                if (item.title == '4屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: 'snailtimes(4屏)(新春氛围).zip', index: 4, devtype: 'amusement/' },

                    ]
                } else if (item.title == '1屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '中秋模板64x32(1屏).zip', index: 1, devtype: 'amusement/' },
                        { title: '国庆节模板64x32(1屏).zip', index: 1, devtype: 'amusement/' },
                    ]
                }
                else if (item.title == '2屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(128x32)2屏.zip', index: 2, devtype: 'amusement/' },
                        { title: '中秋模板(128x32)2屏.zip', index: 2, devtype: 'amusement/' },
                    ]
                } else if (item.title == '3屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆节模板(192x32)3屏.zip', index: 3, devtype: 'amusement/' },
                        { title: '中秋模板(192x32)3屏.zip', index: 3, devtype: 'amusement/' },

                    ]
                } else if (item.title == '5屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(320x32)5屏.zip', index: 5, devtype: 'amusement/' },
                        { title: '中秋模板(320x32)5屏.zip', index: 5, devtype: 'amusement/' },
                    ]
                }

            } else if (this.dev == 9) {
                if (item.title == '2屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(128x32)2屏.zip', index: 2, devtype: 'basketball/' },
                        { title: '中秋模板(128x32)2屏.zip', index: 2, devtype: 'basketball/' },
                        { title: 'snailtimes(2屏)(新春氛围).zip', index: 2, devtype: 'basketball/' },

                    ]
                } else if (item.title == '1屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '中秋模板64x32(1屏).zip', index: 1, devtype: 'basketball/' },
                        { title: '国庆节模板64x32(1屏).zip', index: 1, devtype: 'basketball/' },
                    ]
                }
                else if (item.title == '3屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆节模板(192x32)3屏.zip', index: 3, devtype: 'basketball/' },
                        { title: '中秋模板(192x32)3屏.zip', index: 3, devtype: 'basketball/' },

                    ]
                } else if (item.title == '5屏') {
                    this.showPing = true
                    this.rarList = [
                        { title: '国庆模板(320x32)5屏.zip', index: 5, devtype: 'basketball/' },
                        { title: '中秋模板(320x32)5屏.zip', index: 5, devtype: 'basketball/' },
                    ]
                }

            } else {
                Toast('暂无压缩包')
            }


        },
        getRar(item) {
            this.showCenter = true
            this.rarData = item.title
            this.pingNumber = item.index
            this.devtype = item.devtype

        },
        extDeviceName(value) {
            if (value == 1) {
                return '游艺设备';
            } else if (value == 5) {
                return '娃娃机';
            } else if (value == 8) {
                return '扭蛋机';
            } else if (value == 9) {
                return '篮球机';
            } else {
                return '普通机器';
            }
        },
        toCopy() {
            console.log(this.devtype);
            var copyInput = document.createElement('input')
            copyInput.setAttribute('value', `https://www.huanxizn.com//static/resource/` + `${this.devtype}` + this.pingNumber + '/' + this.rarData)
            document.body.appendChild(copyInput)
            copyInput.select()

            try {
                var copyed = document.execCommand('copy')
                if (copyed) {
                    document.body.removeChild(copyInput)
                    alert('复制成功')
                }
            } catch (e) {
                alert('复制失败，请检查浏览器兼容')
            }
        },

    }


}
</script>

<style lang="less" scoped>
.resourceDownload {
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

    .flow,
    .product {
        margin: 0 0.35rem;
        padding: .6rem .5rem;
        background-color: rgb(245, 250, 254);
        border-radius: 0.32rem;

        .bcg {
            width: 100%;
            // display: block;
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
                font-size: .45rem;
                font-weight: 600;
            }

            p:nth-child(2) {
                font-size: .3rem;
                color: #ababab;
            }
        }

    }

    .popup-shopping {


        .place-selcet {
            height: 100%;
            background-color: rgb(245, 245, 245);

            .content-header {
                padding: 0.3rem;
                border-bottom: 1px solid #d5d5d5;
                font-size: 0.42rem;
                // text-align: center;
                display: flex;
                align-items: center;

                .J_goBack {

                    color: #4e89ef;
                    padding: 0 0.4rem;
                    padding-right: 2.8rem;

                }

                .title {
                    text-align: center;
                }

                .c-blue {
                    color: #4e89ef;
                    padding-right: 0.3rem;
                }
            }

            .row_goods_refresh {
                height: 89%;
                overflow: auto;
                // overflow-y: scroll;

                margin-bottom: 0.1rem;

                .title {
                    width: 100%;
                    height: 1rem;



                    p {
                        text-align: center;
                        line-height: 1rem;
                        font-size: .6rem;

                    }
                }

                .value {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    flex: 1;
                    font-size: .5rem;

                    .edit {
                        padding-right: .5rem;
                        color: rgb(25, 137, 250);
                    }

                    .del {

                        color: rgb(238, 10, 36);
                    }

                }
            }
        }
    }

    .titles {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: .6rem;
        font-size: .5rem;
        font-weight: 700;
    }

    .excelDatas {
        width: 9rem;
        font-size: .4rem;
        /* 减小字体 */
        background-color: rgb(246, 246, 246);
        height: 3rem;
        z-index: 100;
        overflow-wrap: break-word;
        overflow: auto;
        margin-bottom: .5rem;
    }

    .tips {
        margin-top: .6rem;
        text-align: center;
    }

}
</style>
