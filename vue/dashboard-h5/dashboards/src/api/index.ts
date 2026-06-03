
import { HubConnection, HubConnectionBuilder, JsonHubProtocol, LogLevel, HttpTransportType, IHttpConnectionOptions } from "@microsoft/signalr"
import Vending from "./vending";
import HcbApi from "./hcbApi";
import { inject, reactive, ref } from 'vue';
import emitter from '@/utils/emitter';




import { getToken } from "../utils/auth";

export enum menuType {
  page = 0,//页面
  catalogue = 1,//目录
  subpage = 2,//子页面
}
export class menuItem {
  menuId!: string;
  menuName!: string;
  parentId!: string;
  menuType!: menuType;//0 页面 1 目录 2子页面
  menuUrl!: string;
  authorize!: string;
  children!: Array<menuItem>;
  params!: any;
}


export class Api {

  vending: Vending = new Vending();
  hcbApi: HcbApi = new HcbApi();


  checkIsEmpty(value: any): boolean {
    if (value != null && value != undefined && value != '' && value != 'null' && value != 'undefined')
      return false;
    else
      return true;

  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  dateFormat(fmt: string, date: Date): string {
    let ret;
    const opt: any = {
      "Y+": date.getFullYear().toString(),        // 年
      "m+": (date.getMonth() + 1).toString(),     // 月
      "d+": date.getDate().toString(),            // 日
      "H+": date.getHours().toString(),           // 时
      "M+": date.getMinutes().toString(),         // 分
      "S+": date.getSeconds().toString()          // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (const k in opt) {
      ret = new RegExp("(" + k + ")").exec(fmt);
      if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
      }
    }
    return fmt;
  }

  getBeforeDate(date: Date, day: number) {
    const base = date.getTime();
    const beforeDay = 24 * 3600 * 1000 * day

    const now = new Date(base - beforeDay);
    const str = this.dateFormat('YYYY-mm-dd', now);

    return str
  }




  getMDDateString(time: string | Date) {
    const date = new Date(time);

    return this.dateFormat("mm-dd", date)
  }

  getDateString(time: string | Date) {
    const date = new Date(time);
    return this.dateFormat("YYYY-mm-dd", date)
  }

  getTimeString(time: string | Date) {
    const date = new Date(time);
    return this.dateFormat("YYYY-mm-dd HH:MM:SS", date)
  }



  connection = new HubConnectionBuilder()
    .withUrl(process.env.VUE_APP_BASE_API + "/hub/dashboard", { accessTokenFactory: () => getToken(), withCredentials: true }) // 此处填服务器地址
    .withAutomaticReconnect([5000, 10000, 30000])  // 断开自动重连
    // .withAutomaticReconnect({
    //   nextRetryDelayInMilliseconds: retryContext => {
    //     return Math.random() * 10000;   //隔10000毫秒无限连接
    //   }
    // })
    .configureLogging(LogLevel.Information)
    .build();



  async stop() {
    await this.connection.stop();
  }


  async start() {
    try {
      await this.connection.start().then(() => {
        this.connection.on("OnPayNotify", data => {
          // this.OnPayNotify(data);
          emitter.emit('OnPayNotify', data);


        });
        this.connection.on("OnPlayerRegist", data => {
          // this.OnPayNotify(data);
          emitter.emit('OnPlayerRegist', data);


        });


      });
      return true;
    }
    catch {
      return false;

    }


  }
  private events: Record<string, Function[]> = {};
  public state = reactive({
    data: null as any
  });
  on(event: string, callback: Function) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  OnPayNotify(data: any) {
    emitter.emit('OnPlayerRegist', {});
    //childRef.value.updateData({ key: 'value' });

    emitter.emit('OnPayNotify', { "payerAvatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/iboOtGDibcEAiakKUOjibaYibytyJeEEZFEe0QiaDmeehkhDZ67w9w04AwlfzHAWgicLfsMoDy4bgaVDFibmoNFHOnYRAg/132", "payerNickname": "XXXX", payFee: 100 });


  }

  SignalRSend(msg: string) {
    // 调用后端方法（直接调用invoke注入，需要和后端对接方法名及参数）
    this.connection.invoke("PostMessage", msg)  // invoke(方法名, 参数)
      .then(() => console.log("send succeed!"));
  }

}



const api = new Api();
//api.SignalRStart();

export default {
  install: (app: any) => {
    app.config.globalProperties.$api = api;
  }
}
