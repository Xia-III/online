<template>
    <div id="app">
    	<keep-alive exclude="classify,detail">
    		<router-view></router-view>
    	</keep-alive>    
    </div>
</template>

<script>
import { Dialog, Toast } from 'vant'
export default {
	name: 'App'
}
</script>

<style lang="scss">
@import './base/css/normalize.scss';

// iOS Safari 兼容性修复 - 固定根元素 font-size
html {
  background: #f5f5f5;
  // 禁止 iOS 自动调整文字大小
  -webkit-text-size-adjust: 100%;
  -moz-text-size-adjust: 100%;
  -ms-text-size-adjust: 100%;
  text-size-adjust: 100%;
  // 修复 iOS 100vh 问题
  height: 100%;
  overflow-x: hidden;
}

body {
  background-color: #f5f5f5;
  // iOS Safari 兼容性修复
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  
  #app {
    background-color: #f5f5f5;
    font-family: Microsoft YaHei;
    // 确保在 iOS 上正确渲染
    -webkit-overflow-scrolling: touch;
  }
}	

	.swiper-pagination-bullet{
		width:8px;
		height:8px;
		[data-dpr="2"] & {
	    	width:16px;
			height:16px;
	    }
	    [data-dpr="3"] & {
         	width:24px;
     		height:24px;
	    }
	}
    .van-dialog {
        font-size: 0.4rem;
        border-radius: 0.1rem;
        width: 85%;
        .van-dialog__content{
            .van-dialog__message {
                padding: 0.4rem 0.14rem;
                font-size: 0.38rem;
            }
        }
        .van-hairline--top{
            border-top: 1px solid #eee;
            .van-button--large {
                height: 1.2rem;
                line-height: 1.08rem;    
                font-size: 0.48rem;
            }
        }
    }
    .van-pull-refresh {
        .van-pull-refresh__track {
            .van-pull-refresh__head {
                font-size: 0.4rem;
            }
        }
    }
    .van-toast--default{
        width: 4rem;
        min-height: 1.6rem;
        border-radius: 0.2rem;
        .van-toast__icon{
            font-size: 0.98rem;
            margin-top: 0.3rem;
        }
        .van-toast__text{
            font-size: 0.43rem;
            margin: 0.4rem 0;
            line-height: 0.76rem;
        }
    }
    .van-loading__spinner{
		width: 0.6rem !important;
		height: 0.6rem !important;
	}
	.van-loading__text{
		font-size: 0.4rem;
	}
    .van-toast--text{
		padding: 0.15rem 0.32rem;
		font-size: 0.43rem;
		line-height: 0.6rem;
		border-radius: 0.18rem;
	}
</style>