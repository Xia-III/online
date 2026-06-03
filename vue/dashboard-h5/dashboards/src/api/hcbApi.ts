import request, { IResp } from '@/utils/request'


export class RequestModel {
  constructor() {
    this.kw = null;
    this.startDate = null;
    this.endDate = null;
    this.currentPage = 1;
    this.pageSize = 10;
    this.status = -1;
    this.totalCount = 0;
    this.isDeleted = 0;
  }

  kw!: any;
  pageSize!: number;
  currentPage!: number;
  status!: number;
  isDeleted!: number;
  totalCount!: number;
  startDate!: any;
  endDate!: any;
}
export class AddressListReq extends RequestModel {
  timeStart!: string;
  timeEnd!: string;
}



export class MerchantEntry {

  merchantEntryId!: string
  showName!: string
  regionCode!: string
  province!: string
  city!: string
  county !: string
  address!: string
  accountName!: string
  accountNo!: string
  bindMobile!: string
  accountIdCard!: string
  idCardStartDate!: string
  idCardEndDate!: string
  bankCode!: string
  bankName!: string
  bankViewId!: number
  bankCityId!: number
  rate!: number
  constructor() {

  }
}

export class BankView {

  bankViewId!: number
  name!: string

}
export class BankArea {

  areaCode!: number
  name!: string
  children!: Array<BankArea>
}
export class GetBanksReq extends RequestModel {

  bankViewId!: number
  cityId!: number
}
export class SaveMenuReq {

  menuId!: number
  menuName!: string
  menuIcon!: string
  menuUrl!: string
  menuType!: number
  authorize!: string
  menuStatus!: number
  remark!: string
  parentId!: number
  menuSort!: number

}
export class SaveSystemRoleReq {

  systemRoleId!: number
  name!: string
  status!: number
  remark!: string
  menuIds!: Array<number>

}
export class SaveUserReq {

  userId!: number
  nickName!: string
  loginName!: string
  password!: string
  wxAppId!: string
  payAuthDir!: string
  mobilePhone!: string
  status!: number
  roleIds!: Array<number>

}


export class ErrorMsgPageListReq extends RequestModel {
  key!: string;
  deviceType !: any;
}



export default class hcbApi {
  //apiDomain = '/hcb';
  apiDomain = '';

  async UserAuth(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/Auth/UserAuth', data });

    return response.data;
  }


  async RecognizeCard(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/RecognizeCard', data });

    return response.data;
  }
  async GetBankViewList(): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/GetBankViewList' });

    return response.data;
  }

  async GetBankAreas(): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/GetBankAreas' });

    return response.data;
  }

  async GetBanks(data: GetBanksReq): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/GetBanks', data });

    return response.data;
  }

  async SaveMerchantEntry(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/SaveMerchantEntry', data });

    return response.data;
  }


  async GetMerchantEntryPageList(data: RequestModel): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/GetMerchantEntryPageList', data });

    return response.data;
  }
  async GetMerchantEntry(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/MerchantEntry/GetMerchantEntry?id=' + data });

    return response.data;
  }
  async SettlementCardAlteration(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/SettlementCardAlteration', data });

    return response.data;
  }

  async WxPublicApply(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/MerchantEntry/WxPublicApply', data });

    return response.data;
  }


  async GetMenuTreeData(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/Menu/GetMenuTreeData?isNeedTop=' + data });

    return response.data;
  }


  async SaveMenu(data: SaveMenuReq): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/Menu/SaveMenu', data });

    return response.data;
  }
  async GetMenuTreePageList(data: RequestModel): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/Menu/GetMenuTreePageList', data });

    return response.data;
  }
  async GetMenu(id: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/Menu/GetMenu?menuId=' + id });

    return response.data;
  }


  async RemoveMenu(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/Menu/RemoveMenu', data });

    return response.data;
  }

  async GetSystemRoleTreeData(): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/SystemRole/GetSystemRoleTreeData' });

    return response.data;
  }

  async GetSystemRolePageList(data: RequestModel): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/SystemRole/GetSystemRolePageList', data });

    return response.data;
  }

  async SaveSystemRole(data: SaveSystemRoleReq): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/SystemRole/SaveSystemRole', data });

    return response.data;
  }
  async GetSystemRole(id: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/SystemRole/GetSystemRole?systemRoleId=' + id });

    return response.data;
  }
  async RemoveSystemRole(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/SystemRole/RemoveSystemRole', data });

    return response.data;
  }

  async GetUserPageList(data: RequestModel): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/User/GetUserPageList', data });

    return response.data;
  }

  async SaveUser(data: SaveUserReq): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/User/SaveUser', data });

    return response.data;
  }
  async GetUser(id: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/User/GetUser?userId=' + id });

    return response.data;
  }

  async RemoveUser(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/User/RemoveUser', data });

    return response.data;
  }

  async ResetPwd(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/User/ResetPwd', data });

    return response.data;
  }

  async SetPwd(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/User/SetPwd', data });

    return response.data;
  }


  async GetMenuAuthorizeList(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/Home/GetMenuAuthorizeList', data });

    return response.data;
  }

  async InitDashboard(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/api/Dashboard/Init?key=' + data });

    return response.data;
  }

  async DashboardAuth(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/api/Dashboard/DashboardAuth?key=' + data });

    return response.data;
  }
  async PlayersTop10(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/api/Dashboard/PlayersTop10?key=' + data });

    return response.data;
  }


  async GetErrorMsgPageList(data: any): Promise<IResp> {
    const response = await request({ method: 'post', url: this.apiDomain + '/api/Dashboard/ErrorMsgPageList', data });

    return response.data;
  }

  async GetAllDeviceType(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/api/v2/Machine/GetAllDeviceType', data });

    return response.data;
  }

  async InitMap(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/api/Dashboard/InitMap?key=' + data });

    return response.data;
  }

  async GetMachineCount(data: any): Promise<IResp> {
    const response = await request({ method: 'get', url: this.apiDomain + '/api/Dashboard/GetMachineCount?key=' + data });

    return response.data;
  }
}

