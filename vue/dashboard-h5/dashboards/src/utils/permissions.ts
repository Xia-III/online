
import { menuItem, menuType } from '@/api/index';
import { removeToken, getToken } from '@/utils/auth'
import jwt_decode from "jwt-decode";
import { useRouter } from 'vue-router'
import store from '@/store'

let menuList: Array<menuItem> = new Array<menuItem>();

export function setMenuList(data: any) {
    menuList = data;
}





export default function (app: any) {
    app.directive('hasPermission', {
        mounted(el: any, binding: any) {
            const { value } = binding;
            const token = getToken()
            const data = jwt_decode(token) as any;
            if (data.role == "Administrator")
                return true;
            menuList = store.state.menuList;

            const menu = menuList.find(x => x.authorize == value);

            const falg = menu == undefined || menu == null ? false : true;//checkArray(value);

            if (!falg) {
                ///如果不满足则通过dom元素销毁这个按钮
                el.parentNode && el.parentNode.removeChild(el);
            }
        }
    })

}





