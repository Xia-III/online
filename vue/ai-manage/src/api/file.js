import request3 from '../utils/request3'

// 上传文件
export const uploadFile = (file) => {
    const formData = new FormData()
    formData.append('file', file)  // 参数名必须与后端 IFormFile file 一致
    
    return request3({
        method: 'POST',
        url: 'q1/Upload',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
//将文件和文档绑定
export const bindFile = (data) => request3({
    method: 'POST',
    url: 'q1/BindFile',
    params: data,
})
//删除绑定文件
export const deleteBindFile = (data) => request3({
    method: 'DELETE',
    url: 'q1/DeleteBindFile',
    params: data,
})
//更新绑定文件
export const updateBindFile = (data) => request3({
    method: 'POST',
    url: 'q1/UpdateBindFile',
    params: data,
})

//清理未使用文件
export const clearUnuseFile = () => request3({
    method: 'DELETE',
    url: 'q1/ClearUnuseFile',
})