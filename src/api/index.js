import Axios from "./Axios";

//获取验证码接口
export function getCaptcha(userInfo) {
  return Axios.ajax({
    url: "/plugin/api/v1/captcha/send",
    data: {
      params: {
        userInfo,
      },
    },
  }).then((res) => {
    return res;
  });
}

//验证码登录接口
export function reqLogin(userInfo) {
  return Axios.ajax({
    url: "/app/api/login/sms",

    data: {
      params: {
        userInfo,
      },
    },
  }).then((res) => {
    return res;
  });
}

//密码页请求密码接口(流程:1 bg发请求获取用户密码 保存本地 密码页再发请求去本地拿)

//密码页搜索密码
export function searchPassword(userInfo) {
  return Axios.ajax({
    url: "/plugin/api/v1/password/search",
    data: {
      params: {
        userInfo,
      },
    },
  }).then((res) => {
    return res;
  });
}

//新增/保存密码（流程：1 新增密码页面发请求 获取新密码 把新密码发送给bg bg获取后修改本地密码数据 然后发数据给密码库页面 密码库页面更新界面 ）

export function addNewInfo(userInfo) {
  return Axios.ajax({
    url: "/plugin/api/v1/password/store",
    data: {
      params: {
        userInfo,
      },
    },
  }).then((res) => {
    return res;
  });
}

//删除密码信息接口
export function deletePswItem(userInfo) {
  return Axios.ajax({
    url: "/plugin/api/v1/password/delete",
    data: {
      params: {
        userInfo,
      },
    },
  }).then((res) => {
    return res;
  });
}

//封装localStorage获取删除存储
export function handleLocalStorage(method, key, value) {
  switch (method) {
    case "get": {
      let temp = window.localStorage.getItem(key);
      if (temp) {
        return temp;
      } else {
        return false;
      }
    }
    case "set": {
      window.localStorage.setItem(key, value);

      break;
    }
    case "remove": {
      window.localStorage.removeItem(key);
      break;
    }
    default: {
      return false;
    }
  }
}
