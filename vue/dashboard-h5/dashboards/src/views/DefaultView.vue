<template>
  <div class="boxBg">

    <a-row class="grid-demo" gutter="20" justify="start">
      <a-col :span="5">
        <div class="card card1">
          <p>今日成交额</p>
          <h2>0</h2>
        </div>
      </a-col>
      <a-col :span="5">
        <div class="card card2">
          <p>今日成交额</p>
          <h2>0</h2>
        </div>
      </a-col>
      <a-col :span="5">
        <div class="card card3">
          <p>今日成交额</p>
          <h2>0</h2>
        </div>
      </a-col>
      <a-col :span="5">
        <div class="card card4">
          <p>今日成交额</p>
          <h2>0</h2>
        </div>
      </a-col>
    </a-row>

    <a-tabs default-active-key="1" style="margin-top:30px">
      <a-tab-pane key="1" title="销售金额">
        <div id="chart"></div>
      </a-tab-pane>
      <a-tab-pane key="2" title="收益金额">
        Content of Tab Panel 2
      </a-tab-pane>
      <a-tab-pane key="3">
        <template #title>销售笔数</template>
        Content of Tab Panel 3
      </a-tab-pane>
    </a-tabs>
  </div>
</template>



<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Message } from '@arco-design/web-vue';
import { setToken, UserInfo, addUsers, deleteAll, deleteUsers, getUserLists } from '@/utils/auth'
import {
  IconCaretRight,
  IconCaretLeft,
  IconHome,
  IconCalendar,
} from '@arco-design/web-vue/es/icon';
import { EChartsOption, init } from 'echarts';

@Options({
  components: {
    IconCaretRight,
    IconCaretLeft,
    IconHome,
    IconCalendar,
  },
})

export default class Home extends Vue {

  created() {

  }
  mounted() {
    // 获取dom，断言HTMLElement类型，否则会报错
    const chartEle: HTMLElement = document.getElementById('chart') as HTMLElement;
    const chart = init(chartEle);
    const option: EChartsOption = {

      title: {
        text: ''
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {},
      toolbox: {
        show: false,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          dataView: { readOnly: false },
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
          name: '本月',
          type: 'line',
          data: [100, 454, 4524, 4045, 41004, 10000, 20000, 10000]

        },
        {
          name: '上月',
          type: 'line',
          data: [5000, 4000, 3000, 15651, 65156, 35496, 89120, 1000, 41004, 10000, 20000, 10000]
        }
      ]
    };
    option && chart.setOption(option);
  }


}
</script>


<style scoped lang="scss">
body {
  min-height: 100%;
}

.boxBg {

  width: 96%;
  height: 100%;
  padding: 0 1%;
  position: absolute;

}

.grid-demo {
  width: 100%;
  height: auto;
}


.card {
  text-align: left;
  padding: 10px;
  font-size: 16px;
  border-radius: 6px;

}

.card p {
  font-size: 14px;
}

.card1 {
  background-image: linear-gradient(90deg, #f94a65, #ff8a92);
}

.card2 {
  background-image: linear-gradient(90deg, #ffb009, #ffc600);
}

.card3 {
  background-image: linear-gradient(90deg, #31c17b, #8bdfb6);
}

.card4 {
  background-image: linear-gradient(90deg, #4687eb, #53c3ff);
}

#chart {
  width: 90%;
  height: 550px;
}
</style>
