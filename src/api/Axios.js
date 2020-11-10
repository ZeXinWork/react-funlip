import JsonP from "jsonp";
import axios from "axios";
import { Modal } from "antd";
import { handleLocalStorage } from "./index";

const token = handleLocalStorage("get", "token");
export default class Axios {
  static jsonp(options) {
    return new Promise((resolve, reject) => {
      JsonP(
        options.url,
        {
          param: "callback",
        },
        function (err, response) {
          if (response.status == "success") {
            resolve(response);
          } else {
            reject(response.messsage);
          }
        }
      );
    });
  }

  static ajax(options) {
    // let loading;
    // if (options.data && options.data.isShowLoading !== false) {
    //   loading = document.getElementById("ajaxLoading");
    //   loading.style.display = "block";
    // }
    let headers;
    if (
      options.url === "/plugin/api/v1/captcha/send" ||
      options.url === "/app/api/login/sms"
    ) {
      headers = {
        ClientType: "plugin",
      };
    } else {
      headers = { ClientType: "plugin", Authorization: token };
    }

    return new Promise((resolve, reject) => {
      let promise;
      promise = axios({
        url: options.url,
        method: "POST",
        headers: headers,
        data: options.data.params.userInfo,
      });
      promise
        .then((response) => {
          // if (options.data && options.data.isShowLoading !== false) {
          //   loading = document.getElementById("ajaxLoading");
          //   loading.style.display = "none";
          // }
          resolve(response.data);
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }
}
