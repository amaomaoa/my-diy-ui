import request from "@/utils/request";

// 查询配件类别列表
export function listCategory(query) {
    return request({
        url: "/system/category/list",
        method: "get",
        params: query,
    });
}

// 查询配件类别详细
export function getCategory(id) {
    return request({
        url: "/system/category/" + id,
        method: "get",
    });
}
// 查询部门列表（排除节点）
export function listCategoryExcludeChild(deptId) {
    return request({
        url: "/system/category/list/exclude/" + deptId,
        method: "get",
    });
}

// 新增配件类别
export function addCategory(data) {
    return request({
        url: "/system/category",
        method: "post",
        data: data,
    });
}

// 修改配件类别
export function updateCategory(data) {
    return request({
        url: "/system/category",
        method: "put",
        data: data,
    });
}

// 删除配件类别
export function delCategory(id) {
    return request({
        url: "/system/category/" + id,
        method: "delete",
    });
}
