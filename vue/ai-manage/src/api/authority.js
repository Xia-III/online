import request3 from '../utils/request3'

//设置权限
export const authorityAdd = data => request3({
    method: 'POST',
    url: 'q1/Authority/Add',
    params: data
})
//获取能管理的知识库列表
export const getManageDatasetsList = data => request3({
    method: 'GET',
    url: 'q1/Authority/FindManageAllPage',
    params: data
})
//根据知识库ID查询对应的管理员列表
export const getKnowledgeDocumentAdminListByDatasetsId = data => request3({
    method: 'GET',
    url: 'q1/Authority/FindByDatasetsId',
    params: data
})
//删除知识库管理员
export const deleteKnowledgeDocumentAdmin = data => request3({
    method: 'DELETE',
    url: 'q1/Authority/DeleteById',
    params: data
})




