<template>
  <a-upload :tip="tip" action="/" :fileList="file ? [file] : []" :show-file-list="false" @change="onChange"
    @progress="onProgress" @on-before-upload="onBefore" :auto-upload="false">
    <template #upload-button>
      <div :class="`arco-upload-list-item${file && file.status === 'error' ? ' arco-upload-list-item-error' : ''
        }`">
        <div class="arco-upload-list-picture custom-upload-avatar" v-if="file && file.url">
          <img :src="file.url" />
          <div class="arco-upload-list-picture-mask">
            <IconEdit />
          </div>
          <a-progress v-if="file.status === 'uploading' && file.percent < 100" :percent="file.percent" type="circle"
            size="mini" :style="{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translateX(-50%) translateY(-50%)',
            }" />
        </div>
        <div class="arco-upload-picture-card" v-else>
          <div class="arco-upload-picture-card-text">
            <IconPlus />

          </div>
        </div>
      </div>
    </template>
  </a-upload>
  <a-spin v-if="curLoading" :tip="loadingMsg" :loading="curLoading" />
</template>

<script setup lang="ts">
import { defineExpose, reactive, ref, getCurrentInstance } from "vue";
import { IconEdit, IconPlus } from '@arco-design/web-vue/es/icon';
import { Message } from '@arco-design/web-vue';
import { fa, fi } from "element-plus/es/locale";
const { proxy } = getCurrentInstance() as any
const props = defineProps(['tip', 'isAutoUpload', 'credentialType'])
// 这个emits声明选项不是必须的
const emits = defineEmits({
  // 没有校验
  onUploadSuccess: null,
  onChangeSuccess:null
})

var file = ref();
var curLoading = ref(false);
var loadingMsg = '正在上传图片..';
const form = reactive({
  name: '',
  post: '',
  isRead: false,
  radio: "1"
});
const onChange = async (currentFile: any) => {

  var type = props.credentialType;

  file.value = currentFile[currentFile.length > 0 ? currentFile.length - 1 : 0];
  emits('onChangeSuccess', type, file.value)

  if (props.isAutoUpload) {
    curLoading.value = true;
    let data = new FormData();

    data.append('File', file.value.file);
    data.append('CredentialType', props.credentialType);
    console.log(data);
    try {
      let resp = await proxy.$api.hcbApi.RecognizeCard(data);
      console.log(resp);
      if (resp.code == 200) {
        var respdata = resp.data;
        emits('onUploadSuccess', type, respdata)
      }
      else {
        Message.info({ content: `${resp.message}`, showIcon: true });
      }
    } catch (e) {
      Message.info({ content: `${e}`, showIcon: true });

    } finally {
      curLoading.value = false;
    }

  }
};
const onProgress = (currentFile: any) => {
  file.value = currentFile;
  console.log(file.value);
};

const onBefore = (file: any) => {
  console.log("file:" + file);

}
const onSubmit = () => {
  console.log(props.tip);
  return true;
};
defineExpose({ onSubmit });
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
