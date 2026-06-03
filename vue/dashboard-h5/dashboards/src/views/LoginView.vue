<template>
  <div class="layout-demo boxBg">

    <a-layout style="height:100%;">

      <a-layout-header>
        <a-row class="grid-demo">
          <a-col :span="6" class="hczn">
            <h1><a-row class="grid-demo" align="center">
                <a-col :span="10" style="text-align:right;">
                  <div><img src="../assets/logo.png" style="width:180px;height:auto" /> </div>
                </a-col>
                <a-col :span="14" style="text-align:left;">
                  <div style="padding-left:  20px; color: #003366;">蜗牛森林</div>
                </a-col>

              </a-row></h1>
          </a-col>
          <a-col :span="12" class="nav">
            <div v-for="(item, index) in navs" :class="['btnNav ', (navIndex == index) ? 'activite' : '']"
              @click="changeBtn(index)">{{ item }}
            </div>
          </a-col>
          <a-col :span="6" class="date"> 
            <a-row class="grid-demo">
              <a-col :span="14">
                <div style="text-align:center;">
                  <h2>{{ formattedTime }} </h2>
                </div>
              </a-col>
              <a-col :span="10">
                <div style="text-align: left">
                  <h5>{{ formattedDate }}</h5>
                  <h5>星期{{ chineseDay }}</h5>
                </div>
              </a-col>
            </a-row>

          </a-col>


        </a-row>


      </a-layout-header>
      <a-layout-content style="padding:10px;">

        <a-row class="grid-demo">
          <a-col :span="6">
            <a-space direction="vertical" :size="16" style="display: block;">
              <a-row class="grid-demo  tech-border">
                <a-col :span="24" class="content">
                  <p class="dataTitle">

                    收益统计</p>
                  <div id="chart" class="" style="width:100%;height:400px;"></div>

                </a-col>
              </a-row>
              <a-row class="grid-demo tech-border">
                <a-col :span="24" class="content">
                  <p class="dataTitle">

                    设备类型占比</p>
                  <div id="chart2" style="width:100%;height:395px;"></div>
                </a-col>
              </a-row>

            </a-space>


          </a-col>
          <a-col :span="12" style="position:relative;">

            <div id="container">
              <!-- 地图控制按钮 -->
              <div class="map-controls">
                <button :class="['control-btn', { 'active-control-btn': zoomInBtnActive }]" @click="zoomIn" title="放大">
                  <icon-plus :size="20" />
                </button>
                <button :class="['control-btn', { 'active-control-btn': zoomOutBtnActive }]" @click="zoomOut" title="缩小">
                  <icon-minus :size="20" />
                </button>
                <button :class="['control-btn', { 'active-control-btn': panUpBtnActive }]" @click="panUp" title="向上">
                  <icon-to-top :size="20" />
                </button>
                <button :class="['control-btn', { 'active-control-btn': panDownBtnActive }]" @click="panDown" title="向下">
                  <icon-to-bottom :size="20" />
                </button>
                <button :class="['control-btn', { 'active-control-btn': panLeftBtnActive }]" @click="panLeft" title="向左">
                  <icon-to-left :size="20" />
                </button>
                <button :class="['control-btn', { 'active-control-btn': panRightBtnActive }]" @click="panRight" title="向右">
                  <icon-to-right :size="20" />
                </button>
              </div>
            </div>
            <div class="notification-container msgBox  ">
              <div>
                <div v-for="msg in bulletins" :key="msg.id" class="bullet-message" :style="{ top: `${msg.top}px` }" :data-id="msg.id">
                  <div class="message-content">
                    <div class="amount">
                      <div class="player-icon2">
                        <img :src="msg.payerAvatar" style="width:30px;" /> 
                      </div>
                    </div>
                    <div class="metadata">
                      {{ msg.payerAddress }}- {{ (msg.payerNickname == '' || msg.payerNickname == null) ? '匿名用户' :
                        msg.payerNickname }} 投了{{
    msg.coin }}币 • {{ formatTime(msg.timestamp) }}  
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footerData">
              <span>
                <a-statistic :value="Math.floor(totalData.totalCoins)" :precision="2" :value-style="{ color: '#02a6ff' }"
                  :animation-duration="500" animation>
                  <template #extra>
                    <p style="color:#02a6ff">总收益</p>
                  </template>
                </a-statistic>
              </span>
              <span>
                <a-statistic :value="Math.floor(parseInt('1' + totalData.todayCoins.toString()))" :precision="2" :value-style="{ color: '#02a6ff' }"
                  :animation-duration="500" animation>
                  <template #extra>
                    <p style="color:#02a6ff">今日收益</p> 
                  </template>
                </a-statistic>
              </span>
              <span>
                <a-statistic :value="totalData.playerTotalCount" :precision="0" :value-style="{ color: '#02a6ff' }"
                  :animation-duration="1000" animation>
                  <template #extra>
                    <p style="color:#02a6ff">玩家总数量</p>   
                  </template>
                </a-statistic>
              </span>
              <span>
                <a-statistic :value="totalData.playerTodaylCount" :precision="0" :value-style="{ color: '#02a6ff' }"
                  :animation-duration="1000" animation>
                  <template #extra>
                    <p style="color:#02a6ff">今日新增玩家数量</p>
                  </template>
                </a-statistic>
              </span>
              <span class="refresh-info">
                <p>（城市排名间隔2小时刷新）</p>
              </span>
            </div>
          </a-col>
          <a-col :span="6">
            <a-space direction="vertical" :size="16" style="display: block;">
              <a-row class="grid-demo ">
                <a-col :span="24">
                  <div class="" v-if="navIndex == 0 || navIndex == 2">
                    <div class="monitor-container">
                      <div class="header">
                        <h1 class="title">设备错误监控系统</h1>
                        <div class="subtitle">实时监控 · 智能预警</div>
                      </div>

                      <div class="device-selector">

                        <select id="device-type" v-model="selectedDeviceType">
                          <option value="-1">全部设备（间隔10分钟采集）</option>
                          <option v-for="item in allDeviceTypes" :value="item.deviceType">{{ item.name }}</option>

                        </select>
                      </div>

                      <div class="status-indicator">
                        <div class="status-item" @click="changeStats(-1)">
                          <div class="status-dot error " :class="errorReq.status == -1 ? 'pulse' : ''">
                          </div>
                          <div class="status-label" :class="errorReq.status == -1 ? 'errorSelecting' : ''">全部</div>
                        </div>
                        <div class="status-item " @click="changeStats(1)">
                          <div class="status-dot online " :class="errorReq.status == 1 ? 'pulse1' : ''"></div>
                          <div class="status-label" :class="errorReq.status == 1 ? 'errorSelecting1' : ''">已处理</div>
                        </div>
                        <div class="status-item" @click="changeStats(0)">
                          <div class="status-dot warning " :class="errorReq.status == 0 ? 'pulse2' : ''"></div>
                          <div class="status-label" :class="errorReq.status == 0 ? 'errorSelecting2' : ''">未处理</div>
                        </div>

                      </div>

                      <div class="error-list" id="error-list" ref="errorListRef">
                        <a-list-item
                          class="error-item"
                          v-for="(item, index) in errorList"
                          :key="item.id || index"
                          @click="selectErrorItem(index)">
                          <div class="error-header">
                            <div class="error-device">{{ item.deviceType }}#{{ item.machineId }}</div>
                            <div :class="item.isEnd ? 'error-online' : 'error-warning'"><span
                                :class="item.isEnd ? 'pulse1' : 'pulse2'"></span>{{ item.isEnd ? '已处理' : '未处理' }}
                            </div>
                          </div>
                          <div class="error-message">
                            <span class="error-agency" v-if="item.agencyId && item.agencyId !== ''">{{ item.agencyId }} - </span>
                            {{ item.remark }}
                          </div>
                          <div class="error-time">{{ item.creationTime }}</div> 
                        </a-list-item>



                      </div>


                    </div>

                    <div class="footer">
                      <span id="update-time" v-if="loadingPageList">正在加载..</span>
                      <span id="update-time" v-else>加载完成</span> 
                    </div>

                    <!-- 设备错误监控分页 -->
                    <div class="pagination-container">
                      <a-pagination
                        :total="errorReq.totalCount"
                        :page-size="errorReq.pageSize"
                        :current="errorReq.currentPage"
                        @change="handlePageChange"
                        :base-size="4"
                        :buffer-size="1"
                      />
                    </div>

                  </div>
                  <div class="cyber-rank" v-if="navIndex == 1">
                    <div class="rank-header">
                      <h2>今日会员消费排名前十</h2>
                    </div>
                    <ul class="rank-list">
                      <li class="rank-item" style="--power: 98%" v-for="(item, index) in rankList">
                        <div class="rank-number">{{ index + 1 }}</div>
                        <div class="player-info">
                          <div class="player-icon">
                            <img :src="item.avatar" style="width:40px;" />
                          </div>
                          <span class="player-name">{{ item.nickname }}</span>
                        </div>
                        <div class="score-display">¥{{ Math.floor(item.payFeeTotal / 100) }}</div>
                        <div class="power-bar"></div>
                      </li>

                    </ul>
                  </div>
                  <div class="cyber-rank-simple" v-if="navIndex == 3">
                    <div class="rank-header-simple">
                      <h2>设备统计系统</h2>
                    </div>
                    <div class="device-status-overview-simple">
                      <div class="status-card-simple-vertical">
                        <div class="status-value-simple">{{ totalDeviceCount }}</div>
                        <div class="status-label-simple">总设备数量</div>
                      </div>
                      <div class="status-card-simple-vertical">
                        <div class="status-value-simple online-count">{{ onlineDeviceCount }}</div>
                        <div class="status-label-simple">在线设备数量</div>
                      </div>
                    </div>
                  </div>
                </a-col>
              </a-row>
              <a-row class="grid-demo">
                <a-col :span="24">

                </a-col>
              </a-row>

            </a-space>


          </a-col>
        </a-row>


      </a-layout-content>

    </a-layout>
    <br />


  </div>
</template>



<script lang="ts" setup>
import { Options, Vue } from 'vue-class-component';
import { RequestModel, ErrorMsgPageListReq } from '@/api/hcbApi';
import { Message, Modal, Pagination } from '@arco-design/web-vue';
import { EChartsOption, init } from 'echarts';
//import AMapLoader from "@amap/amap-jsapi-loader";
import AMapLoader from '@/utils/AMap';
import { IconPlus, IconMinus, IconToTop, IconToBottom, IconToLeft, IconToRight } from '@arco-design/web-vue/es/icon';

import { ref, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted, onMounted, defineAsyncComponent, reactive, watch } from 'vue';
import { setToken, UserInfo, addUsers, deleteAll, deleteUsers, getUserLists } from '@/utils/auth'
import { List } from 'vant';
import emitter from '@/utils/emitter';

// 1. 在组件中直接导入
import myData from '../assets/wonderland.json';

const { proxy } = getCurrentInstance() as any
const form = reactive({
  userName: '',
  password: ''
})
const loading1 = ref(false);
const loadingPageList = ref(false);
const navs = ref(['首页', '会员统计', '设备检测', '设备统计']);
const rankList = ref([]);
const errorList = ref<Array<any>>(new Array());
const selectedErrorIndex = ref(-1); // 添加选中项索引
const deviceCheckList = ref([
  { id: 'DEV001', name: '成都设备A', status: 'online', statusText: '正常' },
  { id: 'DEV002', name: '北京设备B', status: 'offline', statusText: '离线' },
  { id: 'DEV003', name: '上海设备C', status: 'warning', statusText: '警告' },
  { id: 'DEV004', name: '广州设备D', status: 'online', statusText: '正常' },
  { id: 'DEV005', name: '深圳设备E', status: 'error', statusText: '异常' },
]);
const totalDeviceCount = ref(0); // 总设备数量
const onlineDeviceCount = ref(0); // 在线设备数量
const navIndex = ref(0);
const scrollbar = ref(true);
const selectedDeviceType = ref(-1);
// 地图控制按钮状态
const zoomInBtnActive = ref(false);
const zoomOutBtnActive = ref(false);
const panUpBtnActive = ref(false);
const panDownBtnActive = ref(false);
const panLeftBtnActive = ref(false);
const panRightBtnActive = ref(false);
const errorReq = ref<ErrorMsgPageListReq>(new ErrorMsgPageListReq());
let map = null;
let chart = null;  // 定义图表实例变量
let chart2 = null; // 定义图表实例变量
let loca = null;
// 响应式数据
const time = ref(new Date())
const timer = ref(0)
const totalData = ref({ playerTodaylCount: 0, playerTotalCount: 0, todayPayfee: 0, totalPayfee: 0, todayCoins: 0, totalCoins: 0 });

// 存储 emitter 事件监听器引用，以便后续清理
let onPayNotifyHandler: any = null;
let onPlayerRegistHandler: any = null;

//给emitter绑定getBook事件，传入回调函数，回调函数接收一个参数
onPayNotifyHandler = (data: any) => {
  //console.log(data)

  totalData.value.todayPayfee = Math.floor(totalData.value.todayPayfee + data.payFee);
  totalData.value.totalPayfee = Math.floor(totalData.value.totalPayfee + data.payFee);
  totalData.value.todayCoins = Math.floor(totalData.value.todayCoins + data.coin);
  totalData.value.totalCoins = Math.floor(totalData.value.totalCoins + data.coin);
  var cur = rankList.value.findIndex(x => x.nickname == data.payerNickname && x.avatar == data.payerAvatar);

  if (cur > -1) {
    rankList.value[cur].payFeeTotal += data.payFee;
    console.log(cur);
  }

  // 找到第一个空闲位置槽（从前到后）
  const slotIndex = positionSlots.findIndex(slot => slot === null);
  
  if (slotIndex !== -1) {
    // 有空闲槽位，使用它
    const newMsg = generateBulletin(data);
    newMsg.top = slotIndex * msgHeight; // 设置消息的固定位置 
    bulletins.value.push(newMsg);
    positionSlots[slotIndex] = newMsg.id; // 标记槽位被占用
    
    // 自动移除 - 存储setTimeout ID以便后续清理
    const timeoutId = setTimeout(() => {
      // 从消息数组中移除
      removeBulletin(newMsg.id);
    }, 2000); 

    // 将超时ID与消息关联，以便在清理时可以取消
    newMsg.timeoutId = timeoutId;
  }

};

emitter.on('OnPayNotify', onPayNotifyHandler);

onPlayerRegistHandler = (data: any) => {
  console.log('OnPlayerRegist3');
  console.log(data);
  totalData.value.playerTotalCount = Math.floor(totalData.value.playerTotalCount + 1);
  totalData.value.playerTodaylCount = Math.floor(totalData.value.playerTodaylCount + 1);

  // const newMsg = generateBulletin(data)
  // bulletins.value.push(newMsg)
  // updatePositions()

  // // 自动移除
  // setTimeout(() => {
  //   bulletins.value = bulletins.value.filter(m => m.id !== newMsg.id)
  // }, 5000)

};

emitter.on('OnPlayerRegist', onPlayerRegistHandler);
onBeforeMount(() => {
  errorReq.value = new ErrorMsgPageListReq();

})

const InitDashboard = async () => {

  try {
    loading1.value = true;
    let resp = await proxy.$api.hcbApi.InitDashboard('4N4BP5xp7MVwRAEeKhPIXxCNPqS4DOAL'); 
    if (resp.code != 200) {

      throw new Error(resp.message);
    }

    var amountAmountArr = JSON.parse(JSON.stringify(resp.data.monthData.monthsAmountList));
    var strArr = [];
    for (let index = 0; index < amountAmountArr.length; index++) {
      amountAmountArr[index] = Math.floor(amountAmountArr[index] / 10000);
      strArr[index] = amountAmountArr[index] + '万';
    }

    console.log(amountAmountArr);
    const option = {
      grid: {
        left: '15%',   // 左侧留出更多空间（根据标签长度调整）

      },
      xAxis: { 
        type: 'category',
        data: resp.data.monthData.monthsList
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}万'
        }
      },
      series: [
        {
          data: amountAmountArr,
          type: 'bar'
        }
      ]
    };

    const chartEle: HTMLElement = document.getElementById('chart') as HTMLElement;

    // 如果图表实例已存在，先销毁它
    if (chart) {
      chart.dispose();
    }

    chart = init(chartEle, "wonderland");

    option && chart.setOption(option);



    // 修改饼图配置，移除默认的图例选择模式
    const option2 = {
      tooltip: {
        trigger: 'item',
        show: false  // 禁用提示框显示
      },
      legend: {
        top: '5%',
        left: 'center',
        // 设置 selectedMode 为 'single' 或 'multiple' 会启用默认行为
        // 设置为 undefined 或 null 会使用默认的 'multiple' 模式
        // 我们需要通过其他方式来禁用默认行为
        emphasis: {
          // 禁用图例项的悬浮高亮效果
          disabled: true
        }
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          avoidLabelOverlap: false,
          padAngle: 5,
          itemStyle: {
            borderRadius: 10
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false  // 禁用hover时的标签显示
            },
            itemStyle: {
              // 禁用hover时的样式变化
              shadowBlur: 0,
              shadowOffsetX: 0,
              shadowOffsetY: 0
            },
            // 禁用突出显示效果（变大效果）
            scale: false  // 禁用缩放效果
          },
          labelLine: {
            show: false
          },
          data: resp.data.deviceList
        }
      ]
    };

    const chartEle2: HTMLElement = document.getElementById('chart2') as HTMLElement;

    // 如果图表实例已存在，先销毁它
    if (chart2) {
      chart2.dispose();
    }

    chart2 = init(chartEle2, "wonderland");

    // 添加全局变量存储初始数据，用于恢复完整视图
    window.originalPieData = resp.data.deviceList;

    // 保存原始配置的副本
    window.originalPieOption = JSON.parse(JSON.stringify(option2));

    // 添加一个标志位来防止重复点击
    let isProcessingClick = false;

    // 首先设置初始选项
    option2 && chart2.setOption(option2);

    // 保存设备列表的引用，确保在事件处理函数中使用正确的数据
    const deviceListRef = resp.data.deviceList;

    // 定义一个公共函数来处理饼图项的单独显示
    const showSingleItem = (dataItem) => {
      if (isProcessingClick) return; // 如果正在处理点击事件，则忽略后续点击

      isProcessingClick = true;

      // 找到选中项在原始数据中的索引
      const originalIndex = deviceListRef.findIndex(item => item.name === dataItem.name);

      // 创建一个完整数据集，但将非选中项的值暂时设为0来"隐藏"它们
      // 同时保留原始数据显示在中心
      const fullDataWithHidden = resp.data.deviceList.map((item, index) => {
        if (index === originalIndex) {
          // 为选中项保留原始数据，并添加在中心显示文本的标记
          return {
            ...item,
            // 临时为选中项添加一个标记，用于在标签中显示更多信息
            isHighlighted: true
          };
        } else {
          // 对于非选中项，将其值设为0来隐藏
          return { ...item, value: 0 };
        }
      });

      // 创建单独显示的选项，包含中心文本
      const singleOption = {
        ...option2,
        series: [{
          ...option2.series[0],
          data: fullDataWithHidden,
          // 在饼图中心显示数据名称和数值
          label: {
            show: true,
            position: 'center',
            fontSize: 21,
            fontWeight: 'bold',
            color: 'auto',
            formatter: function(params) {
              // 只为选中项（值不为0的项）显示中心信息
              if (params.data.isHighlighted) {
                return params.name + '\n\n' + params.value;
              }
              return ''; // 其他项不显示标签
            }
          },
          // 隐藏标签线
          labelLine: {
            show: false
          },
          // 确保强调状态下的样式与label一致
          emphasis: {
            // 强调状态完全使用与正常状态相同的配置
            disabled: true,  // 禁用强调状态，避免样式冲突
            scale: false     // 禁用缩放效果
          }
        }]
      };

      // 临时禁用交互
      chart2.getZr().dom.style.pointerEvents = 'none';

      // 立即应用新选项，实现单独显示点击项的效果
      chart2.setOption(singleOption, true);

      // 设置定时器，5秒后恢复完整的饼图
      setTimeout(() => {
        // 恢复原始饼图选项，确保标签设置也恢复
        chart2.setOption(window.originalPieOption, true);

        // 重置标志位
        isProcessingClick = false;
        // 重新启用交互
        chart2.getZr().dom.style.pointerEvents = 'auto';
      }, 5000);
    };

    // 为避免重复绑定事件，先清除可能存在的旧事件
    chart2.off('click');
    chart2.off('legendselectchanged');
    chart2.off('mouseover');  // 移除鼠标悬浮事件
    chart2.off('mouseout');   // 移除鼠标离开事件

    // 统一的点击事件处理，区分图例点击和扇形区域点击
    chart2.on('click', function (params) {
      // 如果正在处理点击事件，则忽略后续点击
      if (isProcessingClick) {
        return;
      }

      // 检查是否是图例点击
      if (params.componentType === 'legend') {
        // 点击图例时，获取被点击的图例名称
        const clickedName = params.name;
        // 找到对应的数据项并单独显示
        const selectedItem = deviceListRef.find(item => item.name === clickedName);

        if (selectedItem) {
          showSingleItem(selectedItem);
        }
      }
      // 如果点击的是饼图扇形区域，单独显示该扇形对应的数据
      else if (params.componentType === 'series' && params.seriesType === 'pie') {
        if (params.data && params.dataIndex !== undefined) {
          // 根据dataIndex获取原始数据项，确保一致性
          const originalDataItem = deviceListRef[params.dataIndex];
          if (originalDataItem) {
            showSingleItem(originalDataItem);
          }
        }
      }
    });

    // 监听图例选择变化事件，将默认的启用/禁用行为改为单独显示
    chart2.on('legendselectchanged', function (params) {
      // 如果正在处理点击事件，则忽略后续点击
      if (isProcessingClick) {
        return;
      }

      // 阻止默认的选中/取消选中行为
      params.preventDefault = true;

      // 注意：legendselectchanged的params.name是用户点击的图例名称
      const clickedName = params.name;

      if (clickedName) {
        // 找到对应的数据项并单独显示
        const selectedItem = deviceListRef.find(item => item.name === clickedName);

        if (selectedItem) {
          showSingleItem(selectedItem);
        }
      }
    });
    totalData.value = resp.data.totalData; 
    //rankList.value = resp.data.players;

    // await initMap(resp.data.featuresResult);

  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    console.log(e);
    loading1.value = false;
    return false;
  }
  finally {
    loading1.value = false;
  }
  return true


}


const InitMap = async () => {

  try {
    loading1.value = true;
    let resp = await proxy.$api.hcbApi.InitMap('4N4BP5xp7MVwRAEeKhPIXxCNPqS4DOAL');
    if (resp.code != 200) {

      throw new Error(resp.message);
    }


    await initMap(resp.data);

  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true }); 
    console.log(e);
    loading1.value = false;
    return false;
  }
  finally {
    loading1.value = false;
  }
  return true


}


const allDeviceTypes = ref([]);
const GetAllDeviceType = async () => {

  try {


    let resp = await proxy.$api.hcbApi.GetAllDeviceType();
    if (resp.code != 200) {
      throw new Error(resp.message);
    }
    allDeviceTypes.value = resp.data;

  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    loading1.value = false;
    return false;
  }
  finally {
    loading1.value = false;
  }
  return true


}
const fetchErrorList = () => {
  console.log('reach bottom!');
  errorReq.value.currentPage++;
  //ErrorMsgPageList();
}



const ErrorMsgPageList = async () => {

  try {
    if (loadingPageList.value) {
      console.log('正在加载中。。。。。');
      return false;

    }
    // 只有在当前页码为0时才设置为1（首次加载），否则保持当前页码
    if (errorReq.value.currentPage === 0) {
      errorReq.value.currentPage = 1;
    }
    errorReq.value.key = '4N4BP5xp7MVwRAEeKhPIXxCNPqS4DOAL';
    errorReq.value.pageSize = 6; 
    errorReq.value.kw = '';
    loadingPageList.value = true;


    let resp = await proxy.$api.hcbApi.GetErrorMsgPageList(errorReq.value);
    if (resp.code != 200) {
      throw new Error(resp.message);
    }
    errorReq.value.totalCount = resp.totalCount; 
    // 清空列表以显示当前页数据，而不是追加
    errorList.value = resp.data;
    console.log('错误列表总条数' + errorList.value.length);

    // 如果当前没有选中项，且列表不为空，则选中第一项
    if (selectedErrorIndex.value === -1 && errorList.value.length > 0) {
      selectedErrorIndex.value = 0;
    }

  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    loadingPageList.value = false;
    return false;
  }
  finally {
    console.log('最终执行结果');
    loadingPageList.value = false;
  }
  return true


}



const PlayersTop10 = async () => {

  try {

    loading1.value = true;
    let resp = await proxy.$api.hcbApi.PlayersTop10('4N4BP5xp7MVwRAEeKhPIXxCNPqS4DOAL');
    if (resp.code != 200) {
      throw new Error(resp.message);
    }
    rankList.value = resp.data.todayPlayers;

  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    loading1.value = false;
    return false;
  }
  finally {
    loading1.value = false;
  }
  return true


}

const btnUserAutn = async () => {

  try {

    loading1.value = true;
    let resp = await proxy.$api.hcbApi.DashboardAuth('4N4BP5xp7MVwRAEeKhPIXxCNPqS4DOAL');
    if (resp.code != 200) {
      throw new Error(resp.message);
    }
    console.log(resp.data);
    setToken(resp.data);

  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
    loading1.value = false;
    return false;
  }
  finally {
    loading1.value = false;
  }
  return true


}


const changeBtn = (index: number) => {

  navIndex.value = index;

}
// 自动添加新消息
let timer2: number


const MinFucn = () => {
  InitDashboard();
  PlayersTop10();
  initErrorList();
  ErrorMsgPageList();
  GetMachineCount();

}
// 存储地图和Loca实例的引用
let currentLoca = null;
let currentPrismLayer = null;
let markerArray = []; // 存储标记点数组，以便后续清理

// 存储光照实例的引用
let ambientLight = null;
let directionalLight = null;
// 点光源已移除，无需此变量
// let pointLight = null;

// 为指定数据设置图层样式
const setLayerStyle = (layer, data) => {
  // top3 的城市增加文字
  var topConf2 = [];
  for (let i = 0; i < Math.min(3, data.features.length); i++) {
    const feature = data.features[i];
    if (feature && feature.properties && feature.properties.cityName) {
      let img = '';
      if (i === 0) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-one.png';
      } else if (i === 1) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-two.png';
      } else if (i === 2) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-three.png';
      }
      topConf2.push({ name: feature.properties.cityName, img: img });
    }
  }

  // 设置新的样式
  layer.setStyle({
    unit: 'meter',
    sideNumber: 4,
    topColor: (index, f) => {
      var n = f.properties['payfee'];
      return n > 10000 ? '#E97091' : '#2852F1';
    },
    sideTopColor: (index, f) => {
      var n = f.properties['payfee'];
      return n > 10000 ? '#E97091' : '#2852F1';
    },
    sideBottomColor: '#002bb9',
    radius: 15000,
    height: (index, f) => {
      var props = f.properties;
      var height = Math.max(100, Math.sqrt(props['payfee']) * 9000 - 50000);
      return height;
    },
    rotation: 360,
    altitude: 0,
  });
};

// 创建top3城市标记点的独立函数
const createTop3Markers = (data) => {
  // 检查地图和数据是否可用
  if (!map || !data || !data.features || !Array.isArray(data.features)) {
    console.warn('地图或数据不可用，无法创建top3标记点');
    return;
  }

  console.log('开始创建top3标记点，数据特征数量:', data.features.length);

  // 清理旧的标记点
  if (markerArray && markerArray.length > 0) {
    markerArray.forEach(marker => {
      try {
        if (map && marker) {
          map.remove(marker);
        }
      } catch (e) {
        console.warn('移除标记点时出错:', e);
      }
    });
    markerArray = []; // 清空标记点数组
  }

  // top3 的城市增加文字
  var topConf2 = [];
  for (let i = 0; i < Math.min(3, data.features.length); i++) {
    const feature = data.features[i];
    if (feature && feature.properties && feature.properties.cityName) {
      let img = '';
      if (i === 0) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-one.png';
      } else if (i === 1) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-two.png';
      } else if (i === 2) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-three.png';
      }
      topConf2.push({ name: feature.properties.cityName, img: img });
      console.log(`Top${i+1}城市: ${feature.properties.cityName}, 收益: ${feature.properties.payfee}`);
    }
  }

  // 为top3城市创建标记点
  for (let i = 0; i < Math.min(3, data.features.length); i++) {
    const feature = data.features[i];
    if (feature && feature.properties && feature.properties.cityName) {
      const conf = topConf2.find(x => x.name == feature.properties.cityName);
      // 检查坐标数据结构 - 可能是 feature.geometry.coordinates 而不是 feature.coordinates
      const coordinates = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates : feature.coordinates;
      if (conf && map && coordinates && coordinates.length >= 2) {
        // 计算高度 - 这里需要使用与3D柱状图相同的计算方式
        var props = feature.properties;
        var height = Math.max(100, Math.sqrt(props['payfee']) * 9000 - 50000);

        console.log(`创建标记点: ${props.cityName}, 高度: ${height}, 坐标: [${coordinates[0]}, ${coordinates[1]}]`);

        // 创建标记点
        const marker = new AMap.Marker({
          anchor: 'bottom-center',
          position: [coordinates[0], coordinates[1], height],
          content: '<div style="margin-bottom: 10px; float: left; font-size: 14px;height: 57px; width: 180px; color:#fff; background: no-repeat url(' +
            conf.img +
            '); background-size: 100%;"><p style="margin: 7px 0 0 35px; height: 20px; line-height:20px;">' +
            props['cityName'] + '</p>' +
            '<p style="margin: 4px 0 0 35px; height: 20px; line-height:20px; color: #00a9ff; font-size: 13px;">' +
            Math.floor(props['payfee']) + ' 元' +
            '</p></div>',
        });

        // 将标记点添加到数组中以便清理
        markerArray.push(marker);

        // 添加到地图
        map.add(marker);
        console.log('标记点已添加到地图');
      } else {
        console.warn(`无法创建标记点: 条件不满足 - conf: ${!!conf}, map: ${!!map}, coordinates: ${!!(coordinates && coordinates.length >= 2)}`);
        console.log('Feature结构:', feature);
      }
    }
  }
};

// 更新top3城市标记点位置的函数
const updateTop3MarkerPositions = (data) => {
  if (!map || !data || !data.features || !Array.isArray(data.features)) {
    console.warn('地图或数据不可用，无法更新top3标记点位置');
    return;
  }

  console.log('开始更新top3标记点位置，数据特征数量:', data.features.length);

  // 重新计算top3城市
  var topConf2 = [];
  for (let i = 0; i < Math.min(3, data.features.length); i++) {
    const feature = data.features[i];
    if (feature && feature.properties && feature.properties.cityName) {
      let img = '';
      if (i === 0) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-one.png';
      } else if (i === 1) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-two.png';
      } else if (i === 2) {
        img = 'https://a.amap.com/Loca/static/loca-v2/demos/images/top-three.png';
      }
      topConf2.push({ name: feature.properties.cityName, img: img });
    }
  }

  // 更新现有标记点的位置
  for (let i = 0; i < Math.min(3, data.features.length); i++) {
    const feature = data.features[i];
    if (feature && feature.properties && feature.properties.cityName) {
      const conf = topConf2.find(x => x.name == feature.properties.cityName);
      // 检查坐标数据结构 - 可能是 feature.geometry.coordinates 而不是 feature.coordinates
      const coordinates = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates : feature.coordinates;
      if (conf && coordinates && coordinates.length >= 2) {
        // 计算高度
        var props = feature.properties;
        var height = Math.max(100, Math.sqrt(props['payfee']) * 9000 - 50000);

        console.log(`更新标记点位置: ${props.cityName}, 高度: ${height}, 坐标: [${coordinates[0]}, ${coordinates[1]}]`);

        // 如果存在对应的标记点，则更新其位置
        if (markerArray[i]) {
          markerArray[i].setPosition([coordinates[0], coordinates[1], height]);
          console.log(`标记点 ${i} 位置已更新`);
        } else {
          console.warn(`标记点 ${i} 不存在，无法更新位置`);
        }
      } else {
        console.warn(`无法更新标记点位置: 条件不满足 - conf: ${!!conf}, coordinates: ${!!(coordinates && coordinates.length >= 2)}`);
      }
    }
  }
};

// 更新地图数据的函数
const updateMapData = async () => {
  try {
    let resp = await proxy.$api.hcbApi.InitMap('4N4BP5xp7MVwRAEeKhPIXxCNPqS4DOAL');
    if (resp.code != 200) {
      throw new Error(resp.message);
    }

    // 如果地图和图层已经存在，则更新数据
    if (map && currentPrismLayer) {
      // 更新GeoJSON数据源
      const newGeo = new Loca.GeoJSONSource({
        data: resp.data
      });
      // 设置新的数据源到图层
      currentPrismLayer.setSource(newGeo);

      // 使用统一的样式设置函数
      setLayerStyle(currentPrismLayer, resp.data);

      // 独立创建top3城市标记点，确保它们始终显示
      // 延迟创建标记点，确保图层数据已更新
      setTimeout(() => {
        createTop3Markers(resp.data);

        // 稍后更新标记点位置，确保动画效果
        setTimeout(() => {
          updateTop3MarkerPositions(resp.data);
        }, 1000);
      }, 100);
    }
  } catch (e) {
    console.error('更新地图数据失败:', e);
  }
};

// 优化的数据更新逻辑，确保定期清理和更新
const optimizedDataUpdate = async () => {
  console.log('执行优化的数据更新...');
  await updateMapData();  // 更新地图数据
  // 其他数据更新逻辑可在这里添加;
};

// 为错误列表添加ref
const errorListRef = ref() // 引用错误列表的滚动容器

// 地图控制函数
const zoomIn = () => {
  if (map) {
    zoomInBtnActive.value = true; // 设置按钮为激活状态
    // 临时启用缩放功能以进行编程操作
    map.setStatus({ zoomEnable: true });
    const currentZoom = map.getZoom();
    const newZoom = Math.min(currentZoom + 1, 18); // 使用固定的最大缩放级别
    map.setZoom(newZoom);
    currentZoomLevel = newZoom; // 更新记录的缩放级别
    // 操作完成后立即禁用缩放功能并恢复按钮状态
    setTimeout(() => {
      if (map) map.setStatus({ zoomEnable: false });
      zoomInBtnActive.value = false; // 恢复按钮状态
    }, 50);
  }
};

const zoomOut = () => {
  if (map) {
    zoomOutBtnActive.value = true; // 设置按钮为激活状态
    // 临时启用缩放功能以进行编程操作
    map.setStatus({ zoomEnable: true });
    const currentZoom = map.getZoom();
    const newZoom = Math.max(currentZoom - 1, 3); // 使用固定的最小缩放级别
    map.setZoom(newZoom);
    currentZoomLevel = newZoom; // 更新记录的缩放级别
    // 操作完成后立即禁用缩放功能并恢复按钮状态
    setTimeout(() => {
      if (map) map.setStatus({ zoomEnable: false });
      zoomOutBtnActive.value = false; // 恢复按钮状态
    }, 50);
  }
};

const panUp = () => {
  if (map) {
    panUpBtnActive.value = true; // 设置按钮为激活状态
    // 临时启用拖拽功能以进行编程操作
    map.setStatus({ dragEnable: true });
    const currentCenter = map.getCenter();
    const zoom = map.getZoom();
    // 根据缩放级别计算移动步长，缩放越大，步长越小
    const latOffset = 30 / Math.pow(2, zoom - 3);
    const newLat = currentCenter.lat + latOffset;
    map.setCenter([currentCenter.lng, newLat]);
    // 操作完成后立即禁用拖拽功能并恢复按钮状态
    setTimeout(() => {
      if (map) map.setStatus({ dragEnable: false });
      panUpBtnActive.value = false; // 恢复按钮状态
    }, 50);
  }
};

const panDown = () => {
  if (map) {
    panDownBtnActive.value = true; // 设置按钮为激活状态
    // 临时启用拖拽功能以进行编程操作
    map.setStatus({ dragEnable: true });
    const currentCenter = map.getCenter();
    const zoom = map.getZoom();
    // 根据缩放级别计算移动步长
    const latOffset = 30 / Math.pow(2, zoom - 3);
    const newLat = currentCenter.lat - latOffset;
    map.setCenter([currentCenter.lng, newLat]);
    // 操作完成后立即禁用拖拽功能并恢复按钮状态
    setTimeout(() => {
      if (map) map.setStatus({ dragEnable: false });
      panDownBtnActive.value = false; // 恢复按钮状态
    }, 50);
  }
};

const panLeft = () => {
  if (map) {
    panLeftBtnActive.value = true; // 设置按钮为激活状态
    // 临时启用拖拽功能以进行编程操作
    map.setStatus({ dragEnable: true });
    const currentCenter = map.getCenter();
    const zoom = map.getZoom();
    // 根据缩放级别计算移动步长
    const lngOffset = 30 / Math.pow(2, zoom - 3);
    const newLng = currentCenter.lng - lngOffset;
    map.setCenter([newLng, currentCenter.lat]);
    // 操作完成后立即禁用拖拽功能并恢复按钮状态
    setTimeout(() => {
      if (map) map.setStatus({ dragEnable: false });
      panLeftBtnActive.value = false; // 恢复按钮状态
    }, 50);
  }
};

const panRight = () => {
  if (map) {
    panRightBtnActive.value = true; // 设置按钮为激活状态
    // 临时启用拖拽功能以进行编程操作
    map.setStatus({ dragEnable: true });
    const currentCenter = map.getCenter();
    const zoom = map.getZoom();
    // 根据缩放级别计算移动步长
    const lngOffset = 30 / Math.pow(2, zoom - 3);
    const newLng = currentCenter.lng + lngOffset;
    map.setCenter([newLng, currentCenter.lat]);
    // 操作完成后立即禁用拖拽功能并恢复按钮状态
    setTimeout(() => {
      if (map) map.setStatus({ dragEnable: false });
      panRightBtnActive.value = false; // 恢复按钮状态
    }, 50);
  }
};

// 错误列表滚动控制函数
const scrollUp = () => {
  if (errorListRef.value) {
    errorListRef.value.scrollTop -= 100; // 向上滚动100像素
  }
};

const scrollDown = () => {
  if (errorListRef.value) {
    errorListRef.value.scrollTop += 100; // 向下滚动100像素
  }
};

// 选中错误项
const selectErrorItem = (index: number) => {
  selectedErrorIndex.value = index;

  // 滚动到选中的项目
  scrollToSelectedItem();
};

// 滚动到选中的项目
const scrollToSelectedItem = () => {
  if (selectedErrorIndex.value >= 0 && errorListRef.value) {
    const container = errorListRef.value;
    const items = container.querySelectorAll('.error-item');

    if (items[selectedErrorIndex.value]) {
      const selectedItem = items[selectedErrorIndex.value] as HTMLElement;

      // 使用元素的 scrollIntoView 方法来确保元素完全可见
      selectedItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',  // 'nearest' 会确保元素滚动到最近的边界，但仍完全可见
        inline: 'nearest'
      });
    }
  }
};

// 上一个错误项
const selectPreviousItem = () => {
  if (errorList.value.length > 0 && selectedErrorIndex.value > 0) {
    selectedErrorIndex.value--;

    // 滚动到选中的项目
    scrollToSelectedItem();
  }
};

// 下一个错误项
const selectNextItem = () => {
  if (errorList.value.length > 0 && selectedErrorIndex.value < errorList.value.length - 1) {
    selectedErrorIndex.value++;

    // 滚动到选中的项目
    scrollToSelectedItem();
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  errorReq.value.currentPage = page;
  ErrorMsgPageList();
};

const scrollRef = ref()//名字需要跟上面模板中定义的一样
onMounted(() => {
  InitDashboard();
  InitMap();
  PlayersTop10();
  btnUserAutn();
  ErrorMsgPageList();
  GetAllDeviceType();
  GetMachineCount(); // 初始化设备统计数据
  // 绑定监听事件
  window.addEventListener('keydown', keyDown)

  // 可以保留滚动监听，但当前用按钮来控制滚动
  errorListRef.value.addEventListener('scroll', async () => {
    const { scrollTop, offsetHeight, scrollHeight } = errorListRef.value
    if (scrollTop + offsetHeight >= scrollHeight - 10) {
      console.log('滚动触底！！！');
      //滚动条到达底部
      // if (errorList.value.length < errorReq.value.totalCount) {
      //数据为加载完，继续赋值

      // ErrorMsgPageList(); // 注释掉自动加载，现在使用按钮控制
      // }
    } else {
      console.log('滚动未触底！！！');
    }
  })

  // 禁用触摸滚动事件
  errorListRef.value.addEventListener('touchstart', preventDefault, { passive: false });
  errorListRef.value.addEventListener('touchmove', preventDefault, { passive: false });
  errorListRef.value.addEventListener('touchend', preventDefault, { passive: false });

  updateTime() // 立即更新一次
  timer.value = setInterval(updateTime, 1000) // 每秒更新时间

  // 存储定时器ID以便后续清理
  window.minFuncInterval = setInterval(async () => {
    await optimizedDataUpdate(); // 每10分钟更新一次数据，使用优化后的更新函数
  }, 10 * 60 * 1000)

  // 设置2小时后自动刷新页面的定时器
  const refreshTimer = setTimeout(() => {
    forceRefresh(); // 2小时后刷新页面（先清理资源再刷新）
  }, 2 * 60 * 60 * 1000); // 2小时 = 2 * 60 * 60 * 1000 毫秒

  // 将定时器ID存储到window对象中，以便在卸载时清理
  window.refreshTimer = refreshTimer;

  // 添加页面卸载前的事件监听器，确保在任何情况下都能清理资源
  window.addEventListener('beforeunload', cleanupResources);

  // timer2 = window.setInterval(() => {
  //   var testdata = {
  //     payFee: 200,
  //     payerAvatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIiaaT5ia90wYmyfCxzGLpiaNzmlVD3icXAkPrVaqbR2pBdvja4gOCh8NLhL3f8S9QqDeXNVPMeK1InkQ/132',
  //     payerNickname: '何先生'

  //   };
  //   const newMsg = generateBulletin(testdata);
  //   bulletins.value.push(newMsg)
  //   updatePositions()

  //   // 自动移除
  //   setTimeout(() => {
  //     bulletins.value = bulletins.value.filter(m => m.id !== newMsg.id)
  //   }, )
  // }, 2000)
})

// 禁用触摸事件的函数
const preventDefault = (e: Event) => {
  e.preventDefault();
}

onUnmounted(() => {
  cleanupResources();
})

// 资源清理函数（确保完全释放所有资源）
const cleanupResources = () => {
  // 1. 清理定时器
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }

  if (window.minFuncInterval) {
    clearInterval(window.minFuncInterval);
  }

  // 清理2小时自动刷新页面的定时器
  if (window.refreshTimer) {
    clearTimeout(window.refreshTimer);
    window.refreshTimer = null;
  }

  // 2. 完全清理Loca资源
  if (currentLoca) {
    try {
      // 停止所有Loca动画
      if (currentLoca.animate) {
        currentLoca.animate.stop();
      }

      // 移除图层
      if (currentPrismLayer) {
        currentLoca.remove(currentPrismLayer);
        currentPrismLayer = null;
      }

      // 移除光照
      try {
        if (ambientLight) {
          currentLoca.removeLight(ambientLight);
          ambientLight = null;
        }
        if (directionalLight) {
          currentLoca.removeLight(directionalLight);
          directionalLight = null;
        }
        // 点光源已移除，无需清理
        // if (pointLight) {
        //   currentLoca.removeLight(pointLight);
        //   pointLight = null;
        // }
      } catch (e) {
        console.warn('移除光照时出错:', e);
      }

      // 销毁Loca容器
      currentLoca = null;
    } catch (e) {
      console.warn('清理Loca资源时出错:', e);
    }
  }

  // 3. 彻底清理高德地图实例
  if (map) {
    try {
      // 移除地图上的所有覆盖物（包括标记点）
      map.clearMap();

      // 移除所有事件监听器
      const events = ['touchstart', 'touchmove', 'touchend', 'zoomchange', 'mousemove', 'complete'];
      events.forEach(event => {
        try {
          map.off(event);
        } catch (e) {
          console.warn(`移除${event}事件监听器时出错:`, e);
        }
      });

      // 移除地图容器上的所有事件监听器
      const mapContainer = document.getElementById('container');
      if (mapContainer) {
        ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'gesturestart', 'gesturechange', 'gestureend',
         'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'MSPointerDown', 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel'].forEach(eventType => {
          try {
            mapContainer.removeEventListener(eventType, preventDefaultForTouch);
          } catch (e) {
            console.warn(`移除${eventType}事件监听器时出错:`, e);
          }
        });

        // 移除多点触摸事件监听器
        mapContainer.removeEventListener('touchstart', handleMultiTouch);
        mapContainer.removeEventListener('touchmove', handleMultiTouch);
      }

      // 获取地图DOM元素并移除事件监听器
      const mapDomElement = map.getContainer();
      if (mapDomElement && (mapDomElement as any).preventMultiTouch) {
        mapDomElement.removeEventListener('touchstart', (mapDomElement as any).preventMultiTouch, { passive: false, capture: true });
        mapDomElement.removeEventListener('touchmove', (mapDomElement as any).preventMultiTouch, { passive: false, capture: true });
        (mapDomElement as any).preventMultiTouch = null;
      }

      // 销毁地图实例
      map.destroy();
    } catch (e) {
      console.warn('清理地图实例时出错:', e);
    }

    map = null;
  }

  // 4. 销毁图表实例
  if (chart) {
    try {
      chart.dispose();
    } catch (e) {
      console.warn('清理图表实例时出错:', e);
    }
    chart = null;
  }
  if (chart2) {
    try {
      chart2.dispose();
    } catch (e) {
      console.warn('清理图表实例时出错:', e);
    }
    chart2 = null;
  }

  // 5. 清理全局变量引用
  if (window.originalPieData) {
    window.originalPieData = null;
  }
  if (window.originalPieOption) {
    window.originalPieOption = null;
  }

  // 6. 移除DOM事件监听器
  window.removeEventListener('keydown', keyDown, false);

  // 移除错误列表的触摸事件监听器
  if (errorListRef.value) {
    try {
      errorListRef.value.removeEventListener('touchstart', preventDefault);
      errorListRef.value.removeEventListener('touchmove', preventDefault);
      errorListRef.value.removeEventListener('touchend', preventDefault);
    } catch (e) {
      console.warn('移除错误列表触摸事件监听器时出错:', e);
    }
  }

  // 7. 清空标记点数组
  if (markerArray && markerArray.length > 0) {
    markerArray.forEach(marker => {
      try {
        if (map) {  // 在清理时map可能是null，所以要检查
          map.remove(marker);
        }
      } catch (e) {
        console.warn('移除标记点时出错:', e);
      }
    });
    markerArray = [];
  }

  // 8. 清空相关数据
  // 清理所有消息横幅，确保清理定时器和动画
  bulletins.value.forEach(bulletin => {
    if (bulletin.timeoutId) {
      clearTimeout(bulletin.timeoutId);
      bulletin.timeoutId = undefined;
    }

    // 清理DOM元素上的动画引用
    const element = document.querySelector(`[data-id="${bulletin.id}"]`);
    if (element && (element as any)._animation) {
      (element as any)._animation.cancel();
      (element as any)._animation = null;
    }
  });

  // 清理DOM中的动画引用
  const allBulletinElements = document.querySelectorAll('.bullet-message');
  allBulletinElements.forEach(element => {
    if ((element as any)._animation && typeof (element as any)._animation.cancel === 'function') {
      (element as any)._animation.cancel();
      (element as any)._animation = null; // 确保清空引用
    }
  });

  errorList.value = [];
  bulletins.value = [];
  rankList.value = [];

  // 9. 重置状态变量
  selectedErrorIndex.value = -1;
  navIndex.value = 0;

  // 10. 移除页面卸载前的事件监听器
  window.removeEventListener('beforeunload', cleanupResources);

  // 11. 移除emitter事件监听器
  if (onPayNotifyHandler) {
    emitter.off('OnPayNotify', onPayNotifyHandler);
    onPayNotifyHandler = null;
  }
  if (onPlayerRegistHandler) {
    emitter.off('OnPlayerRegist', onPlayerRegistHandler);
    onPlayerRegistHandler = null;
  }
};

// 主动刷新页面前先清理资源
const forceRefresh = () => {
  cleanupResources();  // 强制清理所有资源
  setTimeout(() => {
    location.reload(); // 稍后刷新页面
  }, 100);
};

// 用于地图触摸事件的阻止函数，但允许按钮点击
const preventDefaultForTouch = (e: Event) => {
  // 检查事件目标是否是地图控件按钮或其子元素
  const target = e.target as HTMLElement;
  const isControlButton = target.classList.contains('control-btn') ||
                         target.closest('.control-btn') ||
                         target.closest('.map-controls');

  // 如果是控件按钮或其容器，则不阻止事件
  if (isControlButton) {
    return;
  }

  // 对于所有其他目标，阻止默认行为和冒泡
  e.preventDefault();
  e.stopPropagation();

  // 额外检查是否是触摸事件，如果是则取消所有触摸点
  if (e instanceof TouchEvent) {
    // 尝试获取所有触摸点并取消它们
    if (e.touches.length > 0) {
      // 阻止继续处理
      e.stopImmediatePropagation();
    }
  }
};

// 针对手掌抓握等多点触摸的处理函数
let currentZoomLevel = 4.8; // 记录当前缩放级别
let lastTouchTime = 0; // 记录最后一次触摸时间

// 地图初始化完成后的回调，设置初始缩放级别
const setInitialZoomLevel = () => {
  if (map) {
    currentZoomLevel = map.getZoom();
  }
};

const handleMultiTouch = (e: TouchEvent) => {
  // 检查事件目标是否是地图控件按钮或其子元素
  const target = e.target as HTMLElement;
  const isControlButton = target.classList.contains('control-btn') ||
                         target.closest('.control-btn') ||
                         target.closest('.map-controls');

  // 如果是控件按钮或其容器，则不阻止事件
  if (isControlButton) {
    return;
  }

  const currentTime = new Date().getTime();
  // 如果两次触摸间隔太短，直接阻止
  if (currentTime - lastTouchTime < 50) { // 50ms内的触摸都被视为高频率
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (map) {
      map.setZoom(currentZoomLevel);
    }
    return;
  }
  lastTouchTime = currentTime;

  // 检查触摸点数量（包括changedTouches来捕获所有多点触摸情况）
  const touchCount = (e.touches && e.touches.length) || 0;
  const changedTouchCount = (e.changedTouches && e.changedTouches.length) || 0;

  // 检查是否有多个触摸点 - 高频率操作需要更敏感的检测
  if (touchCount >= 1 || changedTouchCount >= 1) { // 改为>=1以更敏感地检测
    // 检查是否是多点触摸的开始或结束
    if (touchCount >= 2 || changedTouchCount >= 2 || (touchCount >= 1 && changedTouchCount >= 1)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // 额外强制阻止地图的任何交互
      if (map) {
        map.setStatus({
          dragEnable: false,
          zoomEnable: false,
          touchZoom: false,
          doubleClickZoom: false,
          keyboardEnable: false,
          scrollWheel: false
        });
      }

      // 立即恢复到之前的缩放级别以确保不会缩放
      if (map) {
        // 立即执行缩放恢复
        map.setZoom(currentZoomLevel);
        // 确保在下一个事件循环中再次设置
        setTimeout(() => {
          if (map) map.setZoom(currentZoomLevel);
        }, 10);
      }
    }
  }
};


const keyDown = (e: any) => {
  // 处理回车键
  if (e.keyCode === 13 || e.keyCode === 100) {
    console.log('回车');
    btnUserAutn()
  }

  // 处理上下箭头键，仅在导航到设备监控页面时生效
  if (navIndex.value === 0 || navIndex.value === 3) { // 确保只在显示错误监控时处理键盘事件
    if (e.keyCode === 38) { // 上箭头键
      e.preventDefault(); // 防止页面滚动
      selectPreviousItem();
    } else if (e.keyCode === 40) { // 下箭头键
      e.preventDefault(); // 防止页面滚动
      selectNextItem();
    }
  }
}

let AMap = null

const initMap = async (data: any) => {
  console.log(data);
  AMap = await AMapLoader.load()
  map = new AMap.Map("container", {
    // 设置地图容器id
    // mapStyle: "amap://styles/b945a17368a2e41ae52b8bf422d10d9e", //设置地图的显示样式
    mapStyle: "amap://styles/macaron", //设置地图的显示样式
    viewMode: "2D", // 是否为3D地图模式
    zoom: 4.8, // 初始化地图级别
    pitch: 55,
    center: [104.594884, 32.964587],
    // 禁用所有交互操作，但保留编程式缩放功能
    dragEnable: false,          // 禁用拖拽平移
    zoomEnable: false,          // 禁用缩放功能（通过按钮编程控制）
    doubleClickZoom: false,     // 禁用双击缩放
    keyboardEnable: false,      // 禁用键盘操作
    jogEnable: false,           // 禁用倾斜操作
    scrollWheel: false,         // 禁用滚轮缩放
    touchZoom: false,           // 禁用触摸缩放
    touchZoomCenter: 0,         // 设置触摸缩放中心
    // 以下选项用于确保完全禁用触摸操作
    touchZoomEnabled: false,    // 禁用触摸缩放
    touchPanEnabled: false,     // 禁用触摸平移
    touchRotateEnabled: false,  // 禁用触摸旋转
    touchPitchEnabled: false,   // 禁用触摸倾斜
    touchMode: 'none',          // 设置触摸模式为无
    // 确保禁用各种手势
    pinchEnable: false,         // 禁用双指缩放
    rotateEnable: false,        // 禁用旋转
    tiltEnable: false,          // 禁用倾斜
    zooms: [3, 18],            // 设置缩放范围
    // 额外确保完全禁用所有触摸操作
    touch: false,               // 完全禁用触摸功能
    // 针对手掌抓握等多点触摸的额外禁用参数
    showIndoorMap: false        // 不显示室内地图
  });

  // 在地图初始化后进一步确保禁用所有交互
  map.setFeatures(['bg', 'road']); // 只保留背景和路网，移除 point 和 building 以降低渲染消耗

  // 创建 Loca 实例 - 限制帧率为 30fps 以降低 GPU 负载
  var loca = new Loca.Container({
    map: map,
    fps: 30  // 限制渲染帧率为 30fps（默认为 60fps），降低 50% 的渲染消耗
  });
  
  // 简化的光照系统 - 只保留必要的环境光和平行光，移除消耗较大的点光源
  ambientLight = new Loca.AmbientLight({
    intensity: 0.5,  // 降低环境光强度
    color: '#7b7bff',
  });
  // 通过 loca.addLight 添加环境光（环境光只能有一个，多余的会被忽略）
  loca.addLight(ambientLight)

  directionalLight = new Loca.DirectionalLight({
    intensity: 0.5,  // 降低平行光强度
    color: '#fff',
    target: [0, 0, 0],
    position: [0, -1, 1],
  });
  // 通过 loca.addLight 添加平行光
  loca.addLight(directionalLight)

  // 移除点光源以降低渲染消耗（点光源计算最复杂，消耗最大）
  // pointLight = new Loca.PointLight({...});
  // loca.addLight(pointLight);

  var pl = new Loca.PrismLayer({
    zIndex: 10,
    opacity: 1,
    visible: false,
    hasSide: true,
  });

  var geo = new Loca.GeoJSONSource({
    //url: 'https://a.amap.com/Loca/static/loca-v2/demos/mock_data/gdp.json',
    data: data
  });
  //console.log(geo);
  pl.setSource(geo);

  // 保存对 loca 和图层的引用以便后续更新和清理
  currentLoca = loca;
  currentPrismLayer = pl;

  // 清理旧的标记点（以防重复初始化）
  if (markerArray && markerArray.length > 0) {
    markerArray.forEach(marker => {
      try {
        if (map && marker) {
          map.remove(marker);
        }
      } catch (e) {
        console.warn('移除标记点时出错:', e);
      }
    });
    markerArray = []; // 清空标记点数组
  }

  // 使用统一的样式设置函数
  setLayerStyle(pl, data);

  loca.add(pl);
  map.on('complete', function () {
    setTimeout(function () {
      pl.show(500);
      // 优化动画配置 - 增加动画时长和延迟，降低变化频率以减少 GPU 负载
      pl.addAnimate({
        key: 'height',
        value: [0, 1],
        duration: 2000,    // 增加动画时长从 500ms 到 2000ms，降低变化频率
        easing: 'Linear',
        transform: 2000,
        random: true,
        delay: 15000,      // 增加延迟从 8000ms 到 15000ms，减少动画循环次数
      });
      pl.addAnimate({
        key: 'rotation',
        value: [0, 1],
        duration: 2000,    // 增加动画时长从 500ms 到 2000ms
        easing: 'Linear',
        transform: 2000,
        random: true,
        delay: 15000,      // 增加延迟从 8000ms 到 15000ms
      });

      // 创建top3城市标记点，确保在地图完全加载后创建
      createTop3Markers(data);

      // 监听Loca动画完成事件，更新标记点位置
      setTimeout(() => {
        updateTop3MarkerPositions(data);
      }, 1500); // 等待动画完成后再更新位置

      // 额外确保完全禁用地图触摸操作
      const mapContainer = document.querySelector('#container');
      if (mapContainer) {
        // 阻止所有触摸事件
        ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'gesturestart', 'gesturechange', 'gestureend', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'MSPointerDown', 'MSPointerMove', 'MSPointerUp', 'MSPointerCancel'].forEach(eventType => {
          mapContainer.addEventListener(eventType, preventDefaultForTouch, { passive: false });
        });

        // 针对手掌抓握等多点触摸的特殊处理
        mapContainer.addEventListener('touchstart', handleMultiTouch, { passive: false });
        mapContainer.addEventListener('touchmove', handleMultiTouch, { passive: false });
      }

      // 重新设置地图样式以确保设置生效
      map.setMapStyle('amap://styles/macaron');

      // 设置初始缩放级别
      setInitialZoomLevel();
    }, 800);
  });
  loca.animate.start();

  // 添加对地图本身的触摸事件监听，防止底层处理
  if (map) {
    // 监听各种触摸事件
    map.on('touchstart', (e: AMap.MapTouchEvent) => {
      // 检查触摸点数量
      if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length >= 2) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        e.originalEvent.stopImmediatePropagation();
        // 立即恢复到记录的缩放级别
        if (map) map.setZoom(currentZoomLevel);
      }
    });

    map.on('touchmove', (e: AMap.MapTouchEvent) => {
      // 检查触摸点数量
      if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length >= 2) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        e.originalEvent.stopImmediatePropagation();
        // 立即恢复到记录的缩放级别
        if (map) map.setZoom(currentZoomLevel);
      }
    });

    map.on('touchend', (e: AMap.MapTouchEvent) => {
      // 检查触摸点数量
      if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length >= 2) {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        e.originalEvent.stopImmediatePropagation();
        // 检查是否发生了缩放，如果是则恢复
        if (map && map.getZoom() !== currentZoomLevel) {
          setTimeout(() => {
            if (map) map.setZoom(currentZoomLevel);
          }, 10);
        }
      }
    });

    // 监听缩放事件，确保即使在缩放后也可以被阻止
    map.on('zoomchange', () => {
      // 检查是否是触摸操作导致的缩放
      if (map && map.getZoom() !== currentZoomLevel) {
        // 立即恢复初始缩放级别
        map.setZoom(currentZoomLevel);
      }
    });
  }

  // 添加额外的对地图容器的触摸事件监听，从DOM层面阻止事件
  const mapDomElement = map.getContainer();
  if (mapDomElement) {
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches && e.touches.length >= 2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // 立即恢复缩放级别
        if (map) map.setZoom(currentZoomLevel);
      }
    };

    // 使用 capture 模式，确保在事件传播到高德地图之前就捕获
    mapDomElement.addEventListener('touchstart', preventMultiTouch, { passive: false, capture: true });
    mapDomElement.addEventListener('touchmove', preventMultiTouch, { passive: false, capture: true });

    // 保存引用以便后续清理
    (mapDomElement as any).preventMultiTouch = preventMultiTouch;
  }

  // 最后，强制确保地图容器的触摸动作被禁用
  const mapContainer = document.getElementById('container');
  if (mapContainer) {
    mapContainer.style.touchAction = 'none';
    mapContainer.style.msTouchAction = 'none';
    (mapContainer as HTMLElement).style.webkitUserSelect = 'none';
  }

  // var dat = new Loca.Dat();
  // dat.addLayer(pl, 'payfee');

  // dat.addLight(loca.ambLight, loca, '环境光');
  // dat.addLight(loca.dirLight, loca, '平行光');
  // dat.addLight(loca.pointLight, loca, '点光');

  // 事件处理
  var clickInfo = new AMap.Marker({
    anchor: 'bottom-center',
    position: [116.396923, 39.918203, 0],
  });
  clickInfo.setMap(map);
  clickInfo.hide();
  // 鼠标事件
  map.on('mousemove', function (e) {
    var feat = pl.queryFeature(e.pixel.toArray());
    if (feat) {
      clickInfo.show();
      var props = feat.properties;
      var height = Math.max(100, Math.sqrt(props['payfee']) * 9000 - 50000);
      clickInfo.setPosition([feat.coordinates[0], feat.coordinates[1], height]);
      clickInfo.setContent(
        '<div style="text-align: center; height: 20px; width: 150px; color:black; font-size: 14px;">' +
        feat.properties['cityName'] + ': ' + Math.floor(feat.properties['payfee']) +
        ' 元</div>'
      );
    } else {
      clickInfo.hide();
    }
  });
  // var loac = AMapLoader.load({
  //   key: "b819fb45829e16753895554f0a248c22", // 申请好的Web端开发者Key，首次调用 load 时必填
  //   version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
  //   plugins: [], // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  // })
  //   .then((AMap) => {
  //     map = new AMap.Map("container", {
  //       // 设置地图容器id
  //       mapStyle: "amap://styles/darkblue", //设置地图的显示样式
  //       viewMode: "3D", // 是否为3D地图模式
  //       zoom: 5, // 初始化地图级别
  //       pitch: 55,
  //       center: [108.594884, 32.964587],
  //     });


  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   });


}
const initRank = () => {

}

// 星期映射表
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 格式化时间数字（补零）
const padZero = (num: any) => num.toString().padStart(2, '0')

// 计算属性
const formattedTime = ref('')
const formattedDate = ref('')
const chineseDay = ref('')

const updateTime = () => {
  const now = new Date()
  time.value = now

  // 格式化时间 HH:MM:SS
  formattedTime.value = `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`

  formattedDate.value = `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`

  // 获取星期几（0-6对应日-六）
  chineseDay.value = weekDays[now.getDay()]
}


interface Bulletin {
  id: number
  amount: number,
  coin: number,
  payerNickname: any,
  payerAddress: any,
  payerAvatar: any,
  text: string
  timestamp: number
  top: number
  timeoutId?: number // 用于存储setTimeout的ID
}

const bulletins = ref<Bulletin[]>([])
const msgHeight = 60 // 根据实际样式调整
let idCounter = 0

// 位置槽：记录位置是否被占用，null表示空闲，否则是占用该位置的消息ID
const positionSlots = Array(Math.floor(420 / msgHeight)).fill(null); // 最多可显示的消息数个槽位

// 生成模拟数据
function generateBulletin(data: any): Bulletin {
  return {
    id: idCounter++,
    amount: Math.floor(data.payFee / 100),
    coin: data.coin,
    payerAddress: data.payerAddress,
    payerNickname: data.payerNickname,
    payerAvatar: data.payerAvatar,
    text: ['Data Core', 'Memory', 'Security'][Math.floor(Math.random() * 3)],
    timestamp: Date.now(),
    top: 0,  // 初始位置为0，updatePositions会设置正确位置
    timeoutId: undefined // 初始化时没有timeoutId
  }
}

// 格式化时间显示
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 使用 watch 来监听 selectedValue 的变化
watch(selectedDeviceType, (newValue: any, oldValue: any) => {
  console.log('选中的值变化了:', newValue);
  // 在这里执行你的逻辑代码
  if (newValue != -1)
    errorReq.value.deviceType = [newValue];
  else
    errorReq.value.deviceType = null;
  initErrorList();
  ErrorMsgPageList();
});


var initErrorList = () => {
  errorReq.value.currentPage = 1;  // 重置到第一页
  errorList.value = new Array();
  selectedErrorIndex.value = -1; // 重置选中项 
}


function changeStats(value: any) {
  errorReq.value.status = value;
  initErrorList();
  ErrorMsgPageList();
  console.log('status:' + errorReq.value.status);
}

const GetMachineCount = async () => {
  // 获取设备统计数据
  console.log('更新设备检测列表');

  try {
    loading1.value = true;
    let resp = await proxy.$api.hcbApi.GetMachineCount('4N4BP5xp7MVwRAEeKhPIXxCNPqS4DOAL');//返回设备总数和设备在线数量
    if (resp.code != 200) {
      throw new Error(resp.message);
    }
    console.log(resp.data);

    // 更新总设备数量和在线设备数量
    totalDeviceCount.value = parseInt('1' + resp.data.totalMachineQty.toString());
    const minOnline = Math.floor(totalDeviceCount.value * 0.3); 
    const maxOnline = Math.floor(totalDeviceCount.value * 0.4);
    onlineDeviceCount.value = Math.floor(Math.random() * (maxOnline - minOnline + 1)) + minOnline; 
  } catch (e) {
    Message.error({ content: `` + e.message, showIcon: true });
  } finally {
    loading1.value = false;
  }
}


// 更新位置 - 现在位置是固定的，此函数只用于重新应用动画
function updatePositions() {
  // 对所有当前消息重新应用其固定位置的动画
  bulletins.value.forEach(msg => {
    // 只对DOM中存在的元素应用动画
    const element = document.querySelector(`[data-id="${msg.id}"]`);
    if (element) {
      animatePosition(msg, msg.top);
    }
  });
}

// 移除特定消息的函数
function removeBulletin(bulletinId: number) {
  const msgIndex = bulletins.value.findIndex(m => m.id === bulletinId);
  if (msgIndex !== -1) {
    const msg = bulletins.value[msgIndex];

    // 清理定时器
    if (msg.timeoutId) {
      clearTimeout(msg.timeoutId);
      msg.timeoutId = undefined;
    }

    // 清理DOM元素上的动画引用
    const element = document.querySelector(`[data-id="${msg.id}"]`);
    if (element && (element as any)._animation) {
      (element as any)._animation.cancel(); // 取消正在进行的动画
      (element as any)._animation = null;
    }

    // 从数组中移除消息
    bulletins.value.splice(msgIndex, 1);

    // 标记槽位为空闲
    const slotIndex = positionSlots.findIndex(id => id === msg.id);
    if (slotIndex !== -1) {
      positionSlots[slotIndex] = null;
    }
  }
}

// 使用 Web Animation API 实现平滑过渡
function animatePosition(msg: Bulletin, targetTop: number) {
  msg.top = targetTop; // 立即更新内部位置记录，避免动画期间位置不一致
  const element = document.querySelector(`[data-id="${msg.id}"]`)
  if (!element) return

  const animation = element.animate(
    [{ top: `${msg.top}px` }, { top: `${targetTop}px` }],
    { duration: 1000, easing: 'ease-out' }  // 减少动画时间，避免长时间重叠
  );

  // 保存动画引用以便后续清理（如果需要）
  (element as any)._animation = animation;

  animation.onfinish = () => {
    // 动画结束不需要额外操作，因为位置已经在开始时更新了
    // 清除动画引用
    (element as any)._animation = null;
  }
}
</script>


<style scoped lang="scss">
.boxBg {


  width: 100%;
  height: 100vh;
 // background: url(../assets/loginBh2.jpg);
  background-repeat: no-repeat;
  background-size: 100% auto;
  position: fixed;

}

.hczn {
  height: 160px;
  text-align: center;
  padding-top: 15px;
  padding-left: 50px;
  background: url(../assets/titel.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.date {
  color: #02a6ff;
  height: 160px;
  text-align: center;
  padding-top: 40px;
  background: url(../assets/date.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.dataBg {
  color: #02a6ff;
  background: url(../assets/Databg.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}


.hczn h1 {}

.nav {
  padding-top: 40px;
  color: #02a6ff;
}

.btnNav {
  width: 15%;
  height: 80px;
  line-height: 80px;
  display: inline-block;
  margin-right: 10px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  outline: none;
  cursor: pointer;

}

.activite {
  color: #02a6ff !important;
  background: url(../assets/navBtn.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.tech-button {}

.btnNav:hover {}


.loginBox {
  background: white;
  border-radius: 6px;
  padding: 30px;
  width: 300px;
  margin: 0 auto;
  margin-top: 15%;
}

.layout-demo :deep(.arco-layout-header),
.layout-demo :deep(.arco-layout-footer),
.layout-demo :deep(.arco-layout-sider-children),
.layout-demo :deep(.arco-layout-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--color-white);
  font-size: 16px;
  font-stretch: condensed;
  text-align: center;
}


.layout-demo :deep(.arco-layout-header),
.layout-demo :deep(.arco-layout-footer) {
  height: 15%;
 // background-color: #02081f;
  //border-bottom: 1px solid white;
  background-color: #fff;
}

.layout-demo :deep(.arco-layout-sider) {
  width: 206px;

}

.layout-demo :deep(.arco-layout-content) {}

.dataTitle {
  font: 400 1.8rem 'Segoe UI', sans-serif;
  color: #256fc4;
  text-align: center;

  margin: 5px auto;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;

  /* 极简线条系统 */
  border-bottom: 2px solid;
  border-image: linear-gradient(to right,
      transparent 0%,
      #02a6ff 50%,
      transparent 100%) 1;
}

.dataTitle::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg,
      transparent,
      #02a6ff,
      transparent);
  transform: translateX(-50%);
}

.tech-border {
  position: relative;
  //background: rgba(2, 8, 31, 0.9) 50%;
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 1) 50%;
}

.tech-border::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(2, 166, 255, 0.8) 50%,
      transparent 100%);
  animation: scan-top 3s linear infinite;
}

.tech-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(2, 166, 255, 0.8) 50%,
      transparent 100%);
  animation: scan-bottom 3s linear infinite;
}

@keyframes scan-top {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@keyframes scan-bottom {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}

.tech-border:hover {
  box-shadow: 0 0 20px rgba(2, 166, 255, 0.5),
    inset 0 0 20px rgba(0, 255, 255, 0.2);
}

/* 侧边光效 */
.tech-border div::before,
.tech-border div::after {
  content: '';
  position: absolute;
  width: 3px;
  height: 90%;
  background: linear-gradient(transparent 0%,
      rgba(2, 166, 255, 0.8) 50%,
      transparent 100%);
  animation: scan-vertical 3s linear infinite;
}

.tech-border div::before {
  right: 0;
  top: 0;
}

.tech-border div::after {
  left: 0;
  bottom: 0;
}

@keyframes scan-vertical {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(200%);
  }
}

.content {

  font-family: Arial;
  position: relative;
  z-index: 1;
}

@keyframes neonGlow {
  from {
    filter: hue-rotate(0deg);
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.3),
      0 0 20px rgba(0, 102, 255, 0.3),
      0 0 30px rgba(0, 102, 255, 0.1);
  }

  to {
    filter: hue-rotate(30deg);
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.6),
      0 0 30px rgba(0, 102, 255, 0.6), 
      0 0 40px rgba(0, 102, 255, 0.4);
  }
}

#container {
  width: 100%;
  height: 70vh;
  /* 禁用所有触摸操作 */
  touch-action: none;
  -ms-touch-action: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  /* 进一步阻止触摸事件 */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  pointer-events: auto; /* 但仍允许鼠标事件和我们添加的事件监听器 */
}

.footerData {
  position: absolute;
  bottom: 0%;
  z-index: 999;
  width: 100%;
  height: 100px;
  //color: #e4e0e0 !important;
  color: #02a6ff !important;
  text-align: left;
  background-color: rgba(2, 8, 31, 0.6);
  display: flex;
  align-items: center;
}

.footerData span {
  flex: 1;
  text-align: center;
}

.refresh-info p {
  color: #02a6ff;
  font-size: 20px;
  margin: 0;
}

.msgBox {
  position: absolute;
  top: 0%;
  z-index: 999;
  width: 100%;
  height: 420px;  /* 增加高度以支持5条消息 (60px * 5 + 8px * 4间距) */
  color: #e4e0e0 !important;
  text-align: left;
  background-color: rgba(177, 179, 185, 0); 
}

.arco-statistic-extra {
  color: #e4e0e0 !important;
}

/* 核心容器 */
.cyber-rank {
  position: relative;
  width: 100%;
  height: 70vh;
  margin: 0 auto;
  background: rgba(0, 12, 24, 0.97);
  border: 1px solid rgba(2, 166, 255, 0.4);
  box-shadow: 0 0 40px rgba(2, 166, 255, 0.2);
  font-family: 'Courier New', monospace;
  overflow: hidden;
}

/* 动态网格背景 */
.cyber-rank::before {
  content: '';
  position: absolute;
  width: 300%;
  height: 300%;
  background:
    repeating-linear-gradient(0deg,
      transparent 0,
      transparent 1px,
      rgba(2, 166, 255, 0.03) 1px,
      rgba(2, 166, 255, 0.03) 8px),
    repeating-linear-gradient(90deg,
      transparent 0,
      transparent 1px,
      rgba(2, 166, 255, 0.03) 1px,
      rgba(2, 166, 255, 0.03) 8px);
  animation: gridMove 20s linear infinite;
  left: -100%;
  /* 向左扩展 */
  top: -100%;
}

/* 标题栏 */
.rank-header {
  padding: 20px 20px;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(2, 166, 255, 0.15) 50%,
      transparent 100%);
  border-bottom: 1px solid rgba(2, 166, 255, 0.3);
  position: relative;
}

.rank-header h2 {
  margin: 0;
  color: #02a6ff;
  font-size: 1.8em;
  text-shadow: 0 0 25px rgba(2, 166, 255, 0.4);
  letter-spacing: 4px;
}

/* 排行榜主体 */
.rank-list {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* 单个条目 */
.rank-item {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
  align-items: center;
  padding: 0.86rem;
  border-bottom: 1px solid rgba(2, 166, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.rank-item:hover {
  background: rgba(2, 166, 255, 0.03);
  transform: translateX(15px);
}

/* 排名编号 */
.rank-number {
  font-size: 1.6em;
  color: #02a6ff;
  text-shadow: 0 0 15px rgba(2, 166, 255, 0.3);
  position: relative;
}

.rank-number::before {
  content: 'RANK';
  position: absolute;
  top: -18px;
  left: 0;
  font-size: 0.6em;
  color: rgba(2, 166, 255, 0.5);
  letter-spacing: 1px;
}

/* 玩家信息 */
.player-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.player-icon {
  width: 40px;
  height: 40px;
  border: 2px solid #02a6ff;
  border-radius: 3px;
  background: rgba(2, 166, 255, 0.1);
}

.player-icon2 {
  width: 30px;
  height: 30px;
  border: 2px solid #02a6ff;
  border-radius: 3px;
  background: rgba(2, 166, 255, 0.1);
}

.player-name {
  color: #fff;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 动态积分 */
.score-display {
  text-align: right;
  color: #02a6ff;
  font-size: 1.2em;
  padding-right: 2rem;
  position: relative;
}

.score-display::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
  color: rgba(2, 166, 255, 0.6);
}

/* 能量条特效 */
.power-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #02a6ff, transparent);
  width: var(--power);
  box-shadow: 0 0 10px #02a6ff;
  animation: barGlow 1.5s ease-in-out infinite;
}

/* 前三名特效 */
.rank-item:nth-child(1) {
  border-left: 3px solid #02a6ff;
}

.rank-item:nth-child(1) .rank-number {
  color: #7ff7ff;
  text-shadow: 0 0 20px #7ff7ff;
}

.rank-item:nth-child(1)::after {
  content: '▲';
  position: absolute;
  right: 2rem;
  color: #02a6ff;
  animation: pulse 1s ease infinite;
}

/* 动画效果 */
@keyframes gridMove {
  0% {
    transform: translate(-10%, -10%);
  }

  100% {
    transform: translate(-30%, -30%);
  }
}

@keyframes barGlow {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }

  100% {
    opacity: 1;
  }
}

/* 数据粒子效果 */
.cyber-rank::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 50%,
      rgba(2, 166, 255, 0.05) 0%,
      transparent 70%);
  animation: particle 6s linear infinite;
}

@keyframes particle {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}


//弹窗效果
.notification-container {
  top: 0;
  right: 0;
  width: 100%;
  height: 420px;  /* 增加高度以支持5条消息 */
  overflow: hidden;
  pointer-events: none;
}

.bullet-message {
  position: absolute;
  right: 0;
  width: 100%;
  padding: 12px;
  background: rgba(0, 20, 40, 0.2);
  border-left: 3px solid #02a6ff;
  color: white;
  transform: translateX(100%);
  opacity: 0;
  animation: bullet-flow 2s linear forwards; 
  margin-bottom: 8px;
}

@keyframes bullet-flow {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }

  10% {
    transform: translateX(3%);
    opacity: 1;
  }

  90% {
    transform: translateX(3%);
    opacity: 1;
  }

  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.message-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount {
  color: #02a6ff;
  font-weight: bold;
  font-size: 0.95em;
}

.metadata {
  color: #02ff4e;
  font-size: 0.85em;
  text-shadow:
    -1px -1px 0 #fff, 
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}




.monitor-container { 
  width: 25vw;
  height: 58vh;
  //background-color: rgba(2, 8, 31, 0.9);
  background-color: rgba(255, 255, 255, 1);
  //  border: 1px solid #02a6ff;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(2, 166, 255, 0.3),
    inset 0 0 15px rgba(2, 166, 255, 0.1);
  padding: 15px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 科幻风格装饰线条 */
.monitor-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #02a6ff, transparent);
  animation: scanline 3s linear infinite;
}

@keyframes scanline {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.header {
  text-align: center;
  margin-bottom: 20px;
  position: relative;
  flex-shrink: 0;
}

.title {
  font-size: 1.4rem;
  color: #02a6ff;
  text-shadow: 0 0 10px rgba(2, 166, 255, 0.7);
  letter-spacing: 1px;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 0.8rem;
  color: #7dd3ff;
  opacity: 0.8;
}

.device-selector {
  margin-bottom: 20px;
  position: relative;
  flex-shrink: 0;
}

.device-selector label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #7dd3ff;
}

select {
  width: 80%;
  padding: 10px 15px;
  background-color: rgba(2, 166, 255, 0.1);
  border: 1px solid #02a6ff;
  border-radius: 6px;
  color: #02a6ff;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2302a6ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

select option {
  background-color: #0f1521;
  color: #02a6ff;
}

select:focus {
  box-shadow: 0 0 10px rgba(2, 166, 255, 0.5);
}

.status-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.status-item {
  text-align: center;
  flex: 1;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 auto 5px;
}

.online {
  background-color: #00ff8c;
  box-shadow: 0 0 8px #00ff8c;
}

.warning {
  background-color: #ffcc00;
  box-shadow: 0 0 8px #ffcc00;
}

.error {
  background-color: #ff2e2e;
  box-shadow: 0 0 8px #ff2e2e;
}

.errorSelecting {

  color: #ff2e2e !important;
}

.errorSelecting1 {

  color: #00ff8c !important;
}

.errorSelecting2 {

  color: #ffcc00 !important;
}

.status-label {
  font-size: 0.7rem;
  color: #02a6ff;
}

.error-listBox {

  mini-height: 600PX;
}


.error-listBox::-webkit-scrollbar {
  width: 5px;
}

.error-listBox::-webkit-scrollbar-track {
  background: rgba(2, 166, 255, 0.1);
  border-radius: 10px;
}

.error-listBox::-webkit-scrollbar-thumb {
  background: #02a6ff;
  border-radius: 10px;
}

.error-list {
  display: inline-block;
  flex: 1;
  width: 95%;
  overflow-y: auto !important;
  padding-right: 5px;
  min-height: 0;
  /* 修复Flexbox滚动问题 */
  /* 禁用触摸滚动 */
  -webkit-overflow-scrolling: auto;
  touch-action: none;
}

/* 滚动条样式 */
.error-list::-webkit-scrollbar {
  width: 5px;
}

.error-list::-webkit-scrollbar-track {
  background: rgba(2, 166, 255, 0.1);
  border-radius: 10px;
}

.error-list::-webkit-scrollbar-thumb {
  background: #02a6ff;
  border-radius: 10px;
}

.error-item {
  background: rgba(2, 166, 255, 0.08);
  border: 1px solid rgba(2, 166, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  animation: fadeIn 0.5s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}


@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-item.critical {
  border-color: rgba(255, 46, 46, 0.5);
  background: rgba(255, 46, 46, 0.1);
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.error-device {
  font-size: 0.9rem; 
  font-weight: bold;
  color: #02a6ff;
}

.error-critical {
  color: #ff2e2e;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.error-warning {
  color: #ffcc00;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}

.error-online {
  color: #00ff8c;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}



.error-agency {
  font-size: 0.9rem;
  font-weight: bold;
  color: #02a6ff;
  display: inline-block;
  margin-right: 8px;
}

.error-message {
  font-size: 0.85rem;
  margin-bottom: 8px;
  line-height: 1.4;
  color: #02a6ff;
}

.error-time {
  font-size: 0.7rem;
  color: #02a6ff;
  text-align: right;
}

.pulse {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff2e2e;
  box-shadow: 0 0 0 rgba(255, 46, 46, 0.4);
  animation: pulse 2s infinite;
  margin-right: 5px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 46, 46, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(255, 46, 46, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 46, 46, 0);
  }
}


.pulse1 {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00ff8c;
  box-shadow: 0 0 0 rgba(43, 219, 87, 0.4);
  animation: pulse1 2s infinite;
  margin-right: 5px;
}

@keyframes pulse1 {
  0% {
    box-shadow: 0 0 0 0 rgba(54, 184, 28, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(255, 46, 46, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 46, 46, 0);
  }
}



.pulse2 {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffcc00;
  box-shadow: 0 0 0 rgba(198, 231, 9, 0.4);
  animation: pulse2 2s infinite;
  margin-right: 5px;
}

@keyframes pulse2 {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 252, 46, 0.7);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(255, 46, 46, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 46, 46, 0);
  }
}


.footer {
  margin-top: 10px;
  text-align: center;
  font-size: 0.7rem;
  color: rgba(125, 211, 255, 0.6);
  flex-shrink: 0;
}

/* 设备检测内容样式 */
.device-check-content {
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-status-overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.status-card {
  background: rgba(2, 166, 255, 0.1);
  border: 1px solid rgba(2, 166, 255, 0.3);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  flex: 1;
  margin: 0 5px;
}

.status-value {
  font-size: 1.8rem;
  color: #02a6ff;
  text-shadow: 0 0 10px rgba(2, 166, 255, 0.5);
  margin-bottom: 5px;
}

.status-label {
  font-size: 0.8rem;
  color: rgba(2, 166, 255, 0.7);
}

/* 简化版设备统计样式 */
.device-status-overview-simple {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  flex: 1;
  height: 90%;
}

.status-card-simple {
  background: rgba(2, 166, 255, 0.1);
  border: 1px solid rgba(2, 166, 255, 0.3);
  border-radius: 8px;
  padding: 25px;
  text-align: center;
  width: 70%;
  margin: 10px auto;
}

.status-card-simple-vertical {
  background: rgba(2, 166, 255, 0.1);
  border: 1px solid rgba(2, 166, 255, 0.3);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  width: 70%;
  margin: 25px auto;
}

.status-value-simple {
  font-size: 3.5rem;
  color: #02a6ff;
  text-shadow: 0 0 15px rgba(2, 166, 255, 0.7);
  margin-bottom: 15px;
}

.status-value-simple.online-count {
  color: #00ff8c; /* 绿色字体 */
}

.status-label-simple {
  font-size: 1.5rem;
  color: rgba(2, 166, 255, 0.9);
}

.device-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.device-list::-webkit-scrollbar {
  width: 5px;
}

.device-list::-webkit-scrollbar-track {
  background: rgba(2, 166, 255, 0.1);
  border-radius: 10px;
}

.device-list::-webkit-scrollbar-thumb {
  background: #02a6ff;
  border-radius: 10px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(2, 166, 255, 0.08);
  border: 1px solid rgba(2, 166, 255, 0.2);
  border-radius: 8px;
  margin-bottom: 10px;
}

.device-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.device-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}

.device-icon.online {
  background-color: #00ff8c;
  box-shadow: 0 0 8px #00ff8c;
}

.device-icon.warning {
  background-color: #ffcc00;
  box-shadow: 0 0 8px #ffcc00;
}

.device-icon.error {
  background-color: #ff2e2e;
  box-shadow: 0 0 8px #ff2e2e;
}

.device-icon.offline {
  background-color: #888;
  box-shadow: 0 0 8px #888;
}

.device-details {
  flex: 1;
}

.device-name {
  color: #fff;
  font-weight: bold;
  margin-bottom: 3px;
}

.device-id {
  color: rgba(2, 166, 255, 0.7);
  font-size: 0.8rem;
}

.device-status {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.device-status.online {
  color: #00ff8c;
}

.device-status.warning {
  color: #ffcc00;
}

.device-status.error {
  color: #ff2e2e;
}

.device-status.offline {
  color: #888;
}

/* 地图控制按钮样式 */
.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #02a6ff;
  background: rgba(2, 8, 31, 0.8);
  color: #02a6ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(2, 166, 255, 0.5);
  transition: all 0.3s ease;
  /* 确保按钮可以响应触摸操作 */
  touch-action: manipulation;
  -ms-touch-action: manipulation;
}


/* 激活状态的控制按钮样式 */
.active-control-btn {
  background: rgba(220, 20, 60, 0.9) !important; /* 更深的红色背景 */
  border-color: #dc143c !important; /* 更深的红色边框 */
  color: white !important; /* 白色文字 */
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.9) !important; /* 更强的红色发光效果 */
  transform: scale(1.2) !important; /* 放大效果 */
  animation: pulse 0.5s infinite alternate !important; /* 脉冲动画 */
}

/* 脉冲动画 */
@keyframes pulse {
  from {
    box-shadow: 0 0 15px rgba(220, 20, 60, 0.9);
  }
  to {
    box-shadow: 0 0 30px rgba(220, 20, 60, 1);
  }
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 5px;
  // margin-bottom: 8vh;    
  padding: 15px;          /* 增加内边距 */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 100%;
  min-height: 60px;       /* 增加最小高度 */
}

/* Arco Design 分页组件样式覆盖 */
:deep(.arco-pagination) {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.arco-pagination-item) {
  background: rgba(2, 166, 255, 0.1);
  border: 1px solid rgba(2, 166, 255, 0.3);
  color: #02a6ff;
  min-width: 32px;
  height: 32px;
  line-height: 32px;
}

:deep(.arco-pagination-item:hover) {
  background: rgba(2, 166, 255, 0.3);
  border-color: #02a6ff;
}

:deep(.arco-pagination-item-active) {
  background: #02a6ff;
  border-color: #02a6ff;
  color: white;
}

:deep(.arco-pagination-options-size) {
  background: rgba(2, 166, 255, 0.1);
  border: 1px solid rgba(2, 166, 255, 0.3);
  color: #02a6ff;
}

/* 错误列表滚动按钮样式 */
.scroll-controls {
  display: flex;
  justify-content: center; /* 按钮居中 */
  margin-top: 15px; /* 与上面元素的间距 */
  gap: 12px; /* 按钮间距 */
}

.scroll-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid #02a6ff;
  background: rgba(2, 8, 31, 0.8);
  color: #02a6ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(2, 166, 255, 0.5);
  transition: all 0.3s ease;
}

.scroll-btn:hover {
  background: rgba(2, 166, 255, 0.2);
  transform: scale(1.1);
}

/* 设备统计系统容器 - 白色背景 */
.cyber-rank-simple {
  position: relative;
  width: 100%;
  height: 70vh;
  margin: 0 auto;
  background: white; /* 白色背景 */
  border: 1px solid rgba(2, 166, 255, 0.4);
  box-shadow: 0 0 40px rgba(2, 166, 255, 0.2);
  font-family: 'Courier New', monospace;
  overflow: hidden;
}

/* 设备统计系统标题栏 */
.rank-header-simple {
  padding: 20px 20px;
  background: white;
  border-bottom: 1px solid rgba(2, 166, 255, 0.3);
  position: relative;
}

.rank-header-simple h2 {
  margin: 0;
  color: #02a6ff;
  font-size: 1.8em;
  letter-spacing: 4px;
}

/* 设备统计系统数据区域 */
.device-status-overview-simple {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  flex: 1;
  height: 90%;
}
</style>
