<template>
    <div class="account">
        <div class="header">
            <van-nav-bar title="留言板" left-text="返回" left-arrow @click-left="onClickLeft">
            </van-nav-bar>
        </div>
        <div class="out">
            <div class="content">为了公司更好的发展，您可以以留言的形式留下您宝贵的意见。<span class="more">更多<van-icon name="arrow-down" /></span>
            </div>

            <div class="comment">
                <span>昵称:</span><input type="text" placeholder="请输入昵称..." v-model="nickname" />
            </div>
            <div class="comment">
                <span>留言:</span><input type="text" placeholder="请输入留言..." v-model="iptValut" />

            </div>
            <div class="btn">
                <div>
                    <button size="normal" type="primary" :disabled="!iptValut.length" @click="onSubmit">发布</button>
                </div>

            </div>
            <div class="contentList">
                <div class="list">
                    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
                        <van-list v-model="loading" :finished="finished" @load="getPost">
                            <div class="row" v-for="(item, index) in arrList" :key="index">
                                <div class="text"><span style="color: rgb(25, 169, 252);">{{ item.nickname }}:</span> {{
                item.content }}</div>
                            </div>
                            <div class="footer" v-if="showAllList && arrList.length <= 0">暂无留言</div>
                            <div class="footer" v-if="showAllList && arrList.length > 3">没有更多留言了</div>
                        </van-list>
                    </van-pull-refresh>
                </div>
            </div>

            <div class="count">
                共{{ totalPage }}条留言
            </div>
        </div>

        <van-popup class="van-popup-load" :overlay="false" v-model="showLoading">
            <van-loading color="#1989fa" />
        </van-popup>
    </div>
</template>

<script>
import { Dialog, Toast } from 'vant'
import { getMessageBoardPageList } from '../api/v1blindBox'
import request from '@/utils/request'


export default {
    name: 'messageBoard',
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
            request.post(`api/MessageBoard/GetMessageBoardPageList`, 
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

        onSubmit() {
            if (!this.nickname) {
                Toast('昵称不能为空')
                return false;
            }

            if (this.nickname.length > 6) {
                Toast('昵称最长为6位')
                return false;
            }

            if (!this.iptValut) {
                Toast('留言内容不能为空')
                return false;
            }

            request.post(`api/MessageBoard/SaveMessageBoard`,
                {
                    messageBoardId: 0,
                    nickname: this.nickname.trim(),
                    content: this.iptValut.trim()
                }).then((res) => {
                    console.log(res);
                    if (res.data.code == 200) {
                        this.iptValut = '';
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
@import '../base/css/public.less';

.account {
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

    .submit_box {
        text-align: center;

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
}

.title {
    font-size: .7rem;
    text-align: center;
    color: #3c3c3c;
    padding: .4rem 0 .3rem;
}

.out {
    width: 90vw;
    margin: .4rem auto;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    padding: .4rem;
    box-sizing: border-box;
    background-color: #fff6e3;
    background-color: #fff;


    .contentList {
        overflow: hidden;
        overflow-y: scroll;

        .list {
            margin-top: .3rem;
            height: 6.8rem;

            .row {
                padding: .2rem 0;
                border-bottom: 1px solid #e8e8e8;
                display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                font-size: .4rem;
                color: #333;
            }

            .text {
                display: flex;
                padding-right: .1rem;
                box-sizing: border-box;
                word-wrap: break-word;
                word-break: break-word;
            }

            .text span {
                flex-shrink: 0;
                margin-right: .3rem;
                white-space: nowrap;
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
</style>
