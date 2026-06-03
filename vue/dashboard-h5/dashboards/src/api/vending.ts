import request, { IResp } from '@/utils/request'

export class UserAuthReq {
  userName!: string;
  password!: string;
  verifyCode!: string;
  code!: string;
}

export class UserRegistReq {
  userName!: string;
  password!: string;
  nickname!: string;
  verifyCode!: string;
  code!: string;
}
export class AddressDailyReportIndexReq {
  timeStart!: string;
  timeEnd!: string;
}
export class AddressDailyReportIndexResp {
  isMerchantError!: boolean
  offlineCoinInToday!: number
  offlineCoinInTotal!: number
  offlineFeeTotal!: number
  onlineCoinInToday!: number
  onlineCoinInTotal!: number
  onlineCoinsBindInToday!: number
  onlineCoinsBindInTotal!: number
  onlineRechargeCoinInToday!: number
  onlineRechargeCoinInTotal!: number
  payFeeToday!: number
  payFeeTotal!: number
}

export class RequestModel {
  constructor() {
    this.kw = null;
    this.currentPage = 1;
    this.pageSize = 10;
    this.status = -1;
  }

  kw!: any;
  pageSize!: number;
  currentPage!: number;
  status!: number
}
export class AddressListReq extends RequestModel {
  timeStart!: string;
  timeEnd!: string;
}

export class AddressListResp {

  addressId!: number
  addrType!: string
  province!: string
  city!: string
  district!: string
  isDefault!: boolean
  isSystem!: boolean
  machineCnt!: number
  machineOnline!: number
  maxAutoRefundCount!: number
  maxRefundCount!: number
  merchantId!: number
  merchantName!: string
  name!: string
  payFeeTotal!: number
  remainAutoRefundCount!: number
  remainRefundCount!: number
  shopMode!: number
  street!: string
  ticketFee!: number
  ticketNumber!: string
  ticketToCoinEnable!: boolean

  constructor() {

  }
}



export default class Vending {
    apiDomain = '/vending';

  verifyCode(): string {

    return process.env.VUE_APP_BASE_API + this.apiDomain + '/api/Auth/VerifyCode?' + Math.random();
  }

  async UserAuth(data: UserAuthReq): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/api/Auth/UserAuth', data });

    return response.data;
  }

}
