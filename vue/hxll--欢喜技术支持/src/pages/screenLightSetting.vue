<template>
    <div class="account">
        <div class="header">
            <van-nav-bar title="灯光PK榜" left-text="返回" left-arrow @click-left="onClickLeft">
            </van-nav-bar>
        </div>

        <div class="out">
            <div class="content">进入欢喜后台管理，可以设置您喜欢的灯带模板，截图保存到相册，在下方上传<span class="more">更多<van-icon
                        name="arrow-down" /></span></div>
            <div class="comments">
                <span>昵称显示:</span><input type="text" placeholder="请输入昵称..." v-model="nickname" />
            </div>
            <div class="comment">
                <div>
                    <span>上传图片：</span>
                    <van-uploader :after-read="onRead" v-model="fileList" accept="image/*" multiple :max-count="1"
                        class="uploader" />
                </div>
                <p class="submit_box" @click="onSubmit">
                    <button class="submit">发布</button>
                </p>
            </div>
            <div class="contentList">
                <div class="list">
                    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                        <van-list v-model="loading" :finished="finished" @load="getPost">
                            <div class="row" v-for="(item, index) in arrList" :key="index">
                                <span style="color: rgb(25, 169, 252);">{{ item.nickname }}：</span>
                                <img v-lazy="`${globalHttpUrl}/` + item.images" :key="item.images"
                                    @click="yltp(item.images, index)">
                            </div>
                            <div class="footer" v-if="showAllList && arrList.length <= 0">暂无图片</div>
                            <div class="footer" v-if="showAllList && arrList.length > 3">没有更多图片了</div>
                        </van-list>
                    </van-pull-refresh>
                </div>
            </div>
            <div class="count">
                共{{ totalPage }}张图片
            </div>
        </div>
        <van-popup class="van-popup-load" :overlay="false" v-model="showLoading">
            <van-loading color="#1989fa" />
        </van-popup>
    </div>
</template>

<script>
import { Dialog, Toast, ImagePreview } from 'vant'
import global from '../utils/http-url'

const axios = require('axios').default;

export default {
    name: 'screenLightSetting',
    data() {
        return {
            email: '',
            centent: '',
            showLoading: false,
            showAllList: false,
            iptValut: "",
            totalPage: 0,
            pageSize: 10,
            pageNumber: 1,
            loading: false,//控制上拉加载的加载动画
            finished: false,//控制在页面往下移动到底部时是否调用接口获取数据
            refreshing: false,//控制下拉刷新的加载动画
            showLoading: false,
            nickname: '',
            arrList: [],
            list: [],
            fileList: [],
            baseUrl: 'https://www.huanxizn.com/publicaccount/',
            globalHttpUrl: global.httpUrl, //赋值使用
            Psrc: {}



        }
    },
    methods: {
        onClickLeft() {
            this.$router.push('/');
        },

        onRefresh() {
            this.refreshing = true;
            this.totalPage = 0;
            this.pageNumber = 1;
            // 清空列表数据
            this.finished = false;
            // 重新加载数据
            // 将 loading 设置为 true，表示处于加载状态
            this.loading = true;
            this.getPost();
        },

        getPost() {
            if (this.refreshing) {
                this.arrList = []; // 清空列表数据
                this.showAllList = false;
                this.refreshing = false;
            }
            axios.post(`${this.baseUrl}api/LedBoard/GetLedBoardPageList`,
                {
                    pageSize: this.pageSize,
                    currentPage: this.pageNumber,
                    kw: '',
                    isDeleted: 0,
                    status: -1,
                }).then((res) => {
                    console.log(res);
                    if (res.data.code == 200) {
                        console.log(res.data);
                        this.totalPage = res.data.totalCount;
                        this.arrList = this.arrList.concat(res.data.data)
                        console.log(this.arrList);
                        this.loading = false;
                        this.pageNumber++;
                        if (this.pageNumber > Math.ceil(this.totalPage / this.pageSize)) {
                            this.finished = true;
                            this.showAllList = true;
                        }
                    } else {
                        Toast(res.data.message);
                    }
                }).catch((error) => {
                    console.log(error);
                }).finally(() => {
                    // 在请求结束时执行
                });
        },

        // 预览图片
        yltp(item) {
            ImagePreview({
                images: [
                    `${this.globalHttpUrl}/` + item
                ],
                closeable: true,
            });
        },

        onRead(file) {
            //检测文件类型 
            if (file.file.type.indexOf('image') === -1) {
                Toast("请选择图片文件！");
                return false;
            }
            console.log(file);
            this.Psrc = file.file
        },

        onSubmit() {
            if (!this.nickname) {
                Toast('昵称不能为空')
                return false;
            }

            if (this.nickname.length > 6) {
                Toast('昵称最长为6位')
                return false;
            }
            const Data = new FormData();
            Data.append('ledBoardId', 0);
            Data.append('Images', this.Psrc);
            Data.append('nickname', this.nickname);
            Data.append('content', '11111');
            Data.append('phone', 1111111);
            Data.append('title', '1111');

            axios.post(`${this.baseUrl}api/LedBoard/SaveLedBoard`, Data).then((res) => {
                console.log(res);
                if (res.data.code == 200) {
                    this.onRefresh()
                    Toast('发布成功');
                } else {
                    Toast(res.data.message);
                }
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                // 在请求结束时执行
            });



        }
    },
}
</script>

<style lang="less" scoped>
// @import '../base/css/public.less';


.account {
    width: 100%;
    padding-top: 0.3rem;

    .header {
        .van-nav-bar {
            height: 1.08rem;
            line-height: 1.08rem;

            /deep/ .van-nav-bar__title {
                font-size: 0.45rem;
                background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #00ff00, #0000ff, #8b00ff);
                background-size: 400% 400%;
                color: transparent;
                -webkit-background-clip: text;
                background-clip: text;
                animation: colorAnimation 5s ease infinite;
            }

            @keyframes colorAnimation {
                0% {
                    background-position: 0% 50%;
                }

                50% {
                    background-position: 100% 50%;
                }

                100% {
                    background-position: 0% 50%;
                }
            }

            /deep/.van-nav-bar__left {
                padding: 0 0.13rem 0 0;
                font-size: 0.4rem;

                .van-nav-bar__arrow {
                    font-size: 0.48rem;
                }


            }
        }
    }

    .submit_box {
        .submit {
            width: 2.3rem;
            padding: .2rem 0;
            text-align: center;
            margin: 0 auto;
            background-color: #2ca1f5;
            border: 0px;
            color: white;
            border-radius: .2rem;
        }
    }

    .out {
        width: 90vw;
        margin: .4rem auto;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        padding: .4rem;
        box-sizing: border-box;
        background-color: #fff;

        .contentList {
            overflow: hidden;
            overflow-y: scroll;
            margin-top: .6rem;

            .list {
                margin-top: .3rem;
                height: 6.8rem;



                .row {
                    padding: .2rem 0;
                    border-bottom: 1px solid #e8e8e8;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: .4rem;
                    color: #333;

                    .text {
                        padding-right: .1rem;
                        box-sizing: border-box;
                    }

                    img {
                        width: 2rem;
                    }
                }
            }
        }

        .count {
            margin-top: .3rem;
            padding: .2rem 0;
            font-size: .4rem;
            color: rgb(25, 169, 252);
            text-align: center;
        }

        .comment {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: .2rem;


            span {
                font-size: .4rem;
            }

            .uploader {
                vertical-align: middle;

                /deep/.van-uploader__upload {
                    width: 1.7rem;
                    height: 1.2rem;
                    background-color: #ccc;

                    .van-uploader__upload-icon {
                        color: #dcdee0;
                        font-size: .6rem;
                    }
                }

                /deep/.van-uploader__preview-image {
                    width: 1.7rem;
                    height: 1.2rem;
                }
            }
        }

        .comments {
            display: flex;
            margin-top: .2rem;
            align-items: center;

            span {
                font-size: .4rem;
                margin-right: .5rem;
            }

            input {
                flex: 4;
                background: #f4f4f4;
                margin-right: .1rem;
                height: .8rem;
                border-radius: .1rem;
                padding: 0 .2rem;
                color: #333;
            }

        }

        .btn {
            margin-top: .5rem;
            display: flex;
            align-items: center;
            justify-content: flex-end;

            button {
                width: auto;
                padding: 0.2rem 0.5rem;
                height: 1.2rem;
                font-size: 0.4rem;
                border-radius: 0.1rem;
                background-color: #007bff;
                color: white;
                border: none;
                cursor: pointer;
            }
        }

        .footer {
            text-align: center;
            font-size: 0.32rem;
            color: #888;
            padding: 0.06rem 0 0.18rem;
        }
    }

    .content {
        display: block;
        text-indent: 2em;
        width: 79%;
        margin: 0 auto .4rem;
        font-size: .35rem;

        .more {
            color: #26a2ff;

            .van-icon {
                text-indent: 0rem;
                top: .05rem;
            }
        }
    }
}
</style>
