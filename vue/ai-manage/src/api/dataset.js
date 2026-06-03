import request2 from '../utils/request2'
const embedding_model_provider = 'langgenius/jina/jina'
const embedding_model = 'jina-embeddings-v3'
// 获取知识库列表
export const getDatasetList = data => request2({
    method: 'GET',
    url: 'v1/datasets',
    params: data,
})

// 获取知识库详情
export const getKnowledgeDetail = data => request2({
    method: 'GET',
    url: 'v1/datasets/' + data
})

//获取知识库文档列表
export const getKnowledgeDocumentList = (dataset_id,data) => request2({
    method: 'GET',
    url: 'v1/datasets/' + dataset_id + '/documents',
    params: data,
})
//获取文档分段详情
export const getKnowledgeDocumentSegmentDetail = (dataset_id,document_id,data) => request2({
    method: 'GET',
    url: 'v1/datasets/'+dataset_id+'/documents/'+document_id+'/segments',
    params: data,
})
//创建知识库
export const createKnowledgeDataset = (name) => request2({
    method: 'POST',
    url: 'v1/datasets',
    data: {
        "name": name,
        "indexing_technique": "high_quality",
        "doc_form": "hierarchical_model",
        "retrieval_model": {
            "search_method": "hybrid_search",
            "reranking_enable": true,
            "reranking_mode": "reranking_model",
            "reranking_model": {
                "reranking_provider_name": "langgenius/siliconflow/siliconflow",
                "reranking_model_name": "BAAI/bge-reranker-v2-m3"
            },
            "top_k": 1,
            "score_threshold_enabled": true,
            "score_threshold": 0.5
        },
        "embedding_model_provider": embedding_model_provider,
        "embedding_model": embedding_model
    },
})
//删除知识库
export const deleteKnowledgeDataset = (dataset_id) => request2({
    method: 'DELETE',
    url: 'v1/datasets/' + dataset_id,
})
//修改知识库
export const updateKnowledgeDataset = (dataset_id,name) => request2({
    method: 'PATCH',
    url: 'v1/datasets/' + dataset_id,
    data: {
        "name": name,
        "indexing_technique": "high_quality",
        "doc_form": "hierarchical_model",
        "retrieval_model": {
            "search_method": "hybrid_search",
            "reranking_enable": true,
            "reranking_mode": "reranking_model",
            "reranking_model": {
                "reranking_provider_name": "langgenius/siliconflow/siliconflow",
                "reranking_model_name": "BAAI/bge-reranker-v2-m3"
            },
            "top_k": 1,
            "score_threshold_enabled": true,
            "score_threshold": 0.5
        },
        "embedding_model_provider": embedding_model_provider,
        "embedding_model": embedding_model
    },
})
//创建空文档
export const createKnowledgeDocument = (dataset_id,name) => request2({
    method: 'POST',
    url: 'v1/datasets/'+dataset_id+'/document/create-by-text',
    data: {
        "name": name,
        "text": "",
        "indexing_technique": "high_quality",
        "doc_form": "hierarchical_model",
        "process_rule": {
            "mode": "hierarchical",
            "rules": {
                "pre_processing_rules": [
                    { "id": "remove_extra_spaces", "enabled": true },
                    { "id": "remove_urls_emails", "enabled": false }
                ],
                "parent_mode": "paragraph",
                "segmentation": {
                    "separator": "###",
                    "max_tokens": 3072
                },
                "subchunk_segmentation": {
                    "separator": "\n",
                    "max_tokens": 512
                }
            }
        },
        "retrieval_model": {
            "search_method": "hybrid_search",
            "reranking_enable": true,
            "reranking_mode": "reranking_model",
            "reranking_model": {
                "reranking_provider_name": "langgenius/siliconflow/siliconflow",
                "reranking_model_name": "BAAI/bge-reranker-v2-m3"
            },
            "top_k": 1,
            "score_threshold_enabled": true,
            "score_threshold": 0.5
        },
        "embedding_model_provider": embedding_model_provider,
        "embedding_model": embedding_model
    }
    ,
})

//更新文档名字
export const updateKnowledgeDocumentName = (dataset_id, document_id, data) => request2({
    method: 'POST',
    url: 'v1/datasets/' + dataset_id + '/documents/' + document_id + '/update-by-text',
    data: {
        "name": data,
        "doc_form": "hierarchical_model",
        "process_rule": {
            "mode": "hierarchical",
            "rules": {
                "pre_processing_rules": [
                    { "id": "remove_extra_spaces", "enabled": true },
                    { "id": "remove_urls_emails", "enabled": false }
                ],
                "parent_mode": "paragraph",
                "segmentation": {
                    "separator": "###",
                    "max_tokens": 3072
                },
                "subchunk_segmentation": {
                    "separator": "\n",
                    "max_tokens": 512
                }
            }
        }
    }
})

//创建文档分段
export const createKnowledgeDocumentSegment = (dataset_id, document_id, data) => request2({
    method: 'POST',
    url: 'v1/datasets/' + dataset_id + '/documents/' + document_id + '/segments',
    data: {
        "segments": [
            {
                "content": data
            }
        ]
    }
})
//删除文档
export const deleteKnowledgeDocument = (dataset_id,document_id) => request2({
    method: 'DELETE',
    url: 'v1/datasets/'+dataset_id+'/documents/'+document_id,
})


//删除文档分段
export const deleteKnowledgeDocumentSegment = (dataset_id,document_id,segment_id) => request2({
    method: 'DELETE',
    url: 'v1/datasets/'+dataset_id+'/documents/'+document_id+'/segments/'+segment_id,
})
//更新文档分段
export const updateKnowledgeDocumentSegment = (dataset_id,document_id,segment_id,data) => request2({
    method: 'POST',
    url: 'v1/datasets/'+dataset_id+'/documents/'+document_id+'/segments/'+segment_id,
    data: {
        "segment": 
            {
                "content": data,
                "regenerate_child_chunks":true 
            }
    }
})