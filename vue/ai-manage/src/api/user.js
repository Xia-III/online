import request3 from '../utils/request3'

export const register = data => request3({
    method: 'POST',
    url: 'q1/User/Register',
    params: data
})


export const login = data => request3({
    method: 'POST',
    url: 'q1/User/Login',
    params: data

})

// 获取用户信息
export const getUserInfo = () => request3({
    method: 'GET',
    url: 'q1/User/UserInfo',
})

// 退出登录
export const logout = () => request3({
    method: 'POST',
    url: 'q1/User/Logout',
})

//根据id获取用户信息
export const getUserInfoById = data => request3({
    method: 'GET',
    url: 'q1/User/FindById',
    params: data
})

//获取用户列表
export const getUserList = () => request3({
    method: 'GET',
    url: 'q1/User/FindAll'
})
//根据用户名和账号分页查询用户列表
export const getUserListByPage = data => request3({
    method: 'GET',
    url: 'q1/User/FindAllByPage',
    params: data
})

//管理员添加用户
export const AdminAddUser = data => request3({
    method: 'POST',
    url: 'q1/User/AdminAddUser',
    params: data
})
//更新用户状态
export const UpdateUserStatus = data => request3({
    method: 'PUT',
    url: 'q1/User/UpdateUserStatus',
    params: data
})
//重置密码
export const ResetPassword = data => request3({
    method: 'PUT',
    url: 'q1/User/ResetPassword',
    params: data
})
//删除用户
export const DeleteUser = data => request3({
    method: 'DELETE',
    url: 'q1/User/DeleteById',
    params: data
})

//修改用户信息
export const UpdateUserInfo = data => request3({
    method: 'PUT',
    url: 'q1/User/UpdateUser',
    data: data
})

//根据id更新用户姓名和邮箱
export const UpdateUserNameAndEmail = data => request3({
    method: 'PUT',
    url: 'q1/User/UpdateUserNameAndEmail',
    params: data
})
//修改密码
export const UpdatePassword = data => request3({
    method: 'PATCH',
    url: 'q1/User/UpdatePassword',
    params: data
})
//更新用户头像
export const UpdateUserAvatar = data => request3({
    method: 'PATCH',
    url: 'q1/User/UpdateAvatar',
    params: data
})

