// api文件夹下 各个请求模块js，都统一来到index.js再向外导出
import {
    chatMessages, conversations, messages, annotations, messageFeedback, handleStreamResponse
} from './v3paybox1'

// ai相关接口：
export const chatMessagesAPI = chatMessages
export const conversationsAPI = conversations
export const messagesAPI = messages
export const annotationsAPI = annotations
export const messageFeedbackAPI = messageFeedback
export const handleStreamResponseAPI = handleStreamResponse

import { login, register, getUserInfo, logout, getUserInfoById,getUserList,getUserListByPage,AdminAddUser,UpdateUserStatus,
    ResetPassword,DeleteUser,UpdateUserInfo,UpdateUserNameAndEmail,UpdatePassword,UpdateUserAvatar } from './user'
// 登录注册接口：
export const loginAPI = login
export const registerAPI = register
export const getUserInfoAPI = getUserInfo
export const logoutAPI = logout
export const getUserInfoByIdAPI = getUserInfoById
export const getUserListAPI = getUserList
export const getUserListByPageAPI = getUserListByPage
export const AdminAddUserAPI = AdminAddUser
export const UpdateUserStatusAPI = UpdateUserStatus
export const ResetPasswordAPI = ResetPassword
export const DeleteUserAPI = DeleteUser
export const UpdateUserInfoAPI = UpdateUserInfo
export const UpdateUserNameAndEmailAPI = UpdateUserNameAndEmail
export const UpdatePasswordAPI = UpdatePassword
export const UpdateUserAvatarAPI = UpdateUserAvatar

import { uploadFile, clearUnuseFile,bindFile,updateBindFile,deleteBindFile } from './file'
// 文件接口：
export const uploadFileAPI = uploadFile
export const clearUnuseFileAPI = clearUnuseFile
export const bindFileAPI = bindFile
export const updateBindFileAPI = updateBindFile
export const deleteBindFileAPI = deleteBindFile

import { getDatasetList, getKnowledgeDetail,getKnowledgeDocumentList,createKnowledgeDocument,getKnowledgeDocumentSegmentDetail,
    deleteKnowledgeDocument,deleteKnowledgeDocumentSegment,createKnowledgeDocumentSegment,updateKnowledgeDocumentSegment,createKnowledgeDataset,
    deleteKnowledgeDataset,updateKnowledgeDataset,updateKnowledgeDocumentName } from './dataset'
// 知识库接口：
export const getDatasetListAPI = getDatasetList
export const getKnowledgeDetailAPI = getKnowledgeDetail
export const getKnowledgeDocumentListAPI = getKnowledgeDocumentList
export const createKnowledgeDocumentAPI = createKnowledgeDocument
export const getKnowledgeDocumentSegmentDetailAPI = getKnowledgeDocumentSegmentDetail
export const deleteKnowledgeDocumentAPI = deleteKnowledgeDocument
export const deleteKnowledgeDocumentSegmentAPI = deleteKnowledgeDocumentSegment
export const createKnowledgeDocumentSegmentAPI = createKnowledgeDocumentSegment
export const updateKnowledgeDocumentSegmentAPI = updateKnowledgeDocumentSegment
export const updateKnowledgeDocumentNameAPI = updateKnowledgeDocumentName
export const createKnowledgeDatasetAPI = createKnowledgeDataset
export const deleteKnowledgeDatasetAPI = deleteKnowledgeDataset
export const updateKnowledgeDatasetAPI = updateKnowledgeDataset

import { authorityAdd, getManageDatasetsList,getKnowledgeDocumentAdminListByDatasetsId,deleteKnowledgeDocumentAdmin } from './authority'
// 权限记录接口：
export const authorityAddAPI = authorityAdd
export const getManageDatasetsListAPI = getManageDatasetsList
export const getKnowledgeDocumentAdminListByDatasetsIdAPI = getKnowledgeDocumentAdminListByDatasetsId
export const deleteKnowledgeDocumentAdminAPI = deleteKnowledgeDocumentAdmin


import { generateImage } from './siliconflow'
// 图片生成接口：
export const generateImageAPI = generateImage
