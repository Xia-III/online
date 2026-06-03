<template>
  <a-cascader :default-value="defaultOpt" :options="areasOptions" @change="handleChange" :field-names="areasfieldNames"
    placeholder="请选择地址" />
</template>

<script setup lang="ts">
import { defineExpose, reactive, ref, getCurrentInstance, onBeforeMount } from "vue";
import { IconEdit, IconPlus } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import Areas from '@/utils/areas';
import { fa, fi } from "element-plus/es/locale";
const { proxy } = getCurrentInstance() as any
const props = defineProps(['defaultValue'])
// 这个emits声明选项不是必须的
const emits = defineEmits({
  // 没有校验
  onChangeSuccess: null
})
var areasOptions = [];
var defaultOpt = ref([]);
const areasfieldNames = { value: 'areaCode', label: 'name' }

const areasLoadMore = (option: any, done: any) => {
  console.log(option);
  if (option.areaLevel == "省") {
    const items = Areas.cityList.filter(x => x.parentAreaCode == option.areaCode);
    done(items)
  } else if (option.areaLevel == "市") {
    const items = Areas.countyList.filter(x => x.parentAreaCode == option.areaCode);
    items.forEach(element => {
      element.isLeaf = true;
    });
    console.log(items[0]);
    done(items)
  } else {

  }

  // const nodes = [{
  //   areaCode: `${option.value}-option1`,
  //   name: `${option.label}-Option1`,
  //   isLeaf: true
  // }, {
  //   areaCode: `${option.value}-option2`,
  //   name: `${option.label}-Option2`,
  //   isLeaf: true
  // }]
  // done(nodes)
};


onBeforeMount(() => {
  areasOptions = Areas.provinceList
  var cityList = Areas.cityList
  cityList.forEach(element => {
    element.children = Areas.countyList.filter(x => x.parentAreaCode == element.areaCode);
  });
  areasOptions.forEach(row => {
    row.children = cityList.filter(x => x.parentAreaCode == row.areaCode);

  });

  if (proxy.$api.checkIsEmpty(props.defaultValue) == false) {
    var countyCode = props.defaultValue;
    var cityCode = '';
    var provinceCode = '';
    var county = Areas.countyList.find(x => x.areaCode == countyCode);
    if (county) {
      cityCode = county.parentAreaCode;
    }
    var city = Areas.cityList.find(x => x.areaCode == cityCode);
    if (city) {
      provinceCode = city.parentAreaCode;
    }
    var arr = [];
    arr.push(provinceCode);
    arr.push(cityCode);
    arr.push(countyCode);
    defaultOpt.value = defaultOpt.value.push(arr);

  }


})

const handleChange = (path: any) => {
  emits('onChangeSuccess', path)
}

const onSubmit = () => {

};
const setAddress = (data: any) => {
  console.log(data);

  var countyCode = '';
  var cityCode = '';
  var provinceCode = '';


  var province = Areas.provinceList.find(x => x.name == data.province);
  if (province) {
    provinceCode = province.areaCode;
  }
  var city = Areas.cityList.find(x => x.name == data.city);
  if (city) {
    cityCode = city.areaCode;
  }
  var county = Areas.countyList.find(x => x.name == data.county);
  if (county) {
    countyCode = county.areaCode;
    emits('onChangeSuccess', countyCode)
  }
  var arr = [];

  arr.push(provinceCode);
  arr.push(cityCode);
  arr.push(countyCode);
  defaultOpt.value = defaultOpt.value.push(arr);
  console.log(arr);

};
defineExpose({ setAddress });
</script>
<!-- 

<script lang="ts">
import { Options, Vue } from 'vue-class-component';

@Options({
  components: {
  },
  props: {
    userId: { type: Number },

  }
})
export default class UserForm extends Vue {
  form = {
    name: '',
    post: '',
    isRead: false,
    radio: "1"
  };

  onSubmit() {
    return true;

  }

}
</script> -->

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.ctitle {
  padding-left: 15px;
  padding-top: 0px;
  text-align: left;
  font-size: large;
  font-weight: bold;
}

.cfield {
  font-size: large;
  font-weight: bold;
}

.van-field {
  padding: 0 0px;
}
</style>
