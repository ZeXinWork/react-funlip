/*global chrome*/
import { handleLocalStorage, getCaptcha } from "../api";
import localforage from "localforage";

import qs from "qs";
let passwordItem;
let data;
let count = 0;
let url = "";
let userName = "";
let password = "";
let setIntervalFlag = true;
let firstInterval;

//获取用户数据流程 （内存-》本地-》接口）
// 1、建立一个本地仓库（同步执行）
localforage.config({
  driver: localforage.INDEXEDDB,
  name: "I-heart-indexDB2",
});
//2、封装从接口获取用户信息的代码
const getData = async () => {
  const token = handleLocalStorage("get", "token");
  const pluginID = handleLocalStorage("get", "pluginID");
  const value = {
    pluginId: pluginID,
  };
  return fetch("http://106.53.103.199:8088/plugin/api/v1/password/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ClientType: "plugin",
      Authorization: token,
    },
    body: JSON.stringify(value),
  }).then((response) => response.text());
};

//3、判断本地是否有数据（异步）如果有 就直接获取 没有就发请求给接口
const getDataBaseLen = async () => {
  let res;
  const getLen = async () => {
    const res = await localforage.keys();
    return res.length;
  };
  const getLength = async () => {
    res = await getLen();
  };
  await getLength();
  return res;
};

//4、获取接口或本地用户信息数据 并存在内存data中
const getAllData = async () => {
  let userInfo;

  const getLocalData = async () => {
    const res = localforage
      .getItem("userInfo")
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value;
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      });
    return res;
  };
  userInfo = await getLocalData();

  if (userInfo) {
    data = userInfo;
  } else {
    const getServeData = async () => {
      //将值设置在本地数据库
      const initData = async () => {
        let res = await getData();
        userInfo = res;
        userInfo = JSON.parse(userInfo);
        data = userInfo;
        localforage
          .setItem("userInfo", userInfo)
          .then(function (value) {
            // 当离线仓库中的值被载入时，此处代码运行
          })
          .catch(function (err) {
            // 当出错时，此处代码运行
          });
      };
      await initData();
    };
    await getServeData();
  }

  return userInfo;
};

//往数据库里添加数据，并添加到内存返回给密码库页面
const addItem = async (value) => {
  value = JSON.parse(value);
  const localState = await localforage
    .getItem("userInfo")
    .then(function (value) {
      // 当离线仓库中的值被载入时，此处代码运行
      return value;
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    });

  localState.push(value);
  localforage
    .setItem("userInfo", localState)
    .then(function (value) {
      data = value;
      const cmd = "addSuccess";
      chrome.runtime.sendMessage(cmd, function (response) {});
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    });
  //
  // let arr = JSON.parse(localState);
  // arr.push(value);
  //
  //
  //
  // data = arr;
  //
  // localforage
  //   .setItem("userInfo", arr)
  //   .then(function (value) {})
  //   .catch(function (err) {
  //     // 当出错时，此处代码运行
  //   });
};

//删除数据库指定数据,并添加到内存返回给密码库页面
const deletePsdItem = async (deleteItem, config, targetObj) => {
  let value = JSON.parse(deleteItem);
  let idArrays = [];
  value.data.map((item) => {
    idArrays.push(item.id);
  });
  const localState = await localforage
    .getItem("userInfo")
    .then(function (value) {
      // 当离线仓库中的值被载入时，此处代码运行
      return value;
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    });
  for (let i = 0; i < localState.length; i++) {
    localState[i].index = i;
    idArrays.map((item) => {
      if (localState[i].id === item) {
        localState.splice(localState[i].index, 1);
      }
    });
  }
  const newData = await localforage
    .setItem("userInfo", localState)
    .then(function (value) {
      return value;
    })
    .catch(function (err) {});
  data = newData;
  let targetId = value.data[0].id;

  if (config) {
    const localFolderState = await localforage
      .getItem("folderList")
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value;
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      });
    if (localFolderState) {
      for (let i = 0; i < localFolderState.length; i++) {
        for (let j = 0; j < localFolderState[i].passwords.length; j++) {
          if (localFolderState[i].passwords[j].id == targetId) {
            localFolderState[i].passwords.splice(j, 1);
            localFolderState[i].passwords.push(targetObj);
          }
        }
      }
      localforage
        .setItem("folderList", localFolderState)
        .then(function (value) {
          return value;
        })
        .catch(function (err) {});
    }
  }
  const cmd = "deleteSuccess";
  if (!config) {
    const localFolderState = await localforage
      .getItem("folderList")
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value;
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      });

    if (localFolderState) {
      for (let i = 0; i < localFolderState.length; i++) {
        for (let j = 0; j < localFolderState[i].passwords.length; j++) {
          if (localFolderState[i].passwords[j].id == targetId) {
            localFolderState[i].passwords.splice(j, 1);
          }
        }
      }

      localforage
        .setItem("folderList", localFolderState)
        .then(function (value) {
          return value;
        })
        .catch(function (err) {});
    }
  }

  chrome.runtime.sendMessage(cmd, function (response) {});
};

const editItem = async (value) => {
  value = JSON.parse(value);
  const localState = await localforage
    .getItem("userInfo")
    .then(function (value) {
      // 当离线仓库中的值被载入时，此处代码运行
      return value;
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    });
  localState.push(value);
  localforage
    .setItem("userInfo", localState)
    .then(function (value) {
      data = value;
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    });
};

const sendDataToPopup = (data) => {
  const cmd = {
    type: "popupGetData",
    data,
  };
  chrome.runtime.sendMessage(cmd, function (response) {});
};
chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // 运行插件运行的页面URL规则
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: {} }),
        ],
        actions: [new window.chrome.declarativeContent.ShowPageAction()],
      },
    ]);
  });
});

// bg监听由content.js或者popup发来的信息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  let { type } = message.mes;
  let { requestType } = message.mes;
  const autoFill = handleLocalStorage("get", "autoFill"); //设置是否自动填充
  const autoStore = handleLocalStorage("get", "autoStore");
  let BASE = "106.53.103.199:8088";
  if (type === "autofill") {
    if (autoFill == 1) {
      let userInfoData = { data };
      userInfoData.test = "autofill";
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, userInfoData, function (
          response
        ) {});
      });
    }
  } else if (type === "mesToBackground") {
    passwordItem = message.mes;
    passwordItem.test = "mesToBackground";

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, passwordItem, function (response) {});
    });
  } else if (type === "autolock") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message.mes, function (response) {});
    });
  } else if (type === "first-lock") {
    handleLocalStorage("set", "autolock", "lock");
  } else if (type === "getUserList") {
    const getData = async () => {
      const data = await getAllData();

      if (data) {
        sendDataToPopup(data);
      }
    };
    getData();
  } else if (type === "showSave") {
    //判断当前是否应该打开自动保存页面
    url = message.mes.url;
  } else if (type === "isShowSave") {
    //判断当前是否应该打开自动保存页面
    let sendUrl = {
      showUrl: url,
      password: password,
      userName: userName,
    };
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, sendUrl, function (response) {});
    });
  } else if (type === "cancelSave") {
    url = "";
  } else if (type === "savePsUs") {
    userName = message.mes.userName;
    password = message.mes.password;
  } else if (type === "cancelCP") {
    userName = "";
    password = "";
  } else if (type === "goUrl") {
    const { url } = message.mes;

    const gonewURL = {
      toNewUrl: url,
      type: "goNewUrl",
    };
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, gonewURL, function (response) {});
    });
  } else if (type === "showImage3") {
    let cmd = "showImage3";
    chrome.runtime.sendMessage(cmd, function (response) {});
  } else if (type === "showImage2") {
    let cmd = "showImage2";
    chrome.runtime.sendMessage(cmd, function (response) {});
  } else if (type === "showImage4") {
    let cmd = "showImage4";
    chrome.runtime.sendMessage(cmd, function (response) {});
  } else if (requestType === "getNumbers") {
    let { areaCode, phone, type } = message.mes;
    const { NumberType } = message.mes;

    if (NumberType) {
      type = "FORGOT_PASSWORD";
    }
    fetch("http://106.53.103.199:8088/plugin/api/v1/captcha/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
      },
      body: JSON.stringify({
        areaCode,
        phone,
        type,
      }),
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "checkNumber") {
    const {
      captcha,
      client_ip,
      device_name,
      phone,
      phone_area_code,
    } = message.mes;
    let userInfo = {
      phone,
      captcha,
      client_ip,
      phone_area_code,
      device_name,
    };
    userInfo = qs.stringify(userInfo);
    fetch("http://106.53.103.199:8088/app/api/login/sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ClientType: "plugin",
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "saveNewPsw") {
    const pluginId = handleLocalStorage("get", "pluginID");
    const token = handleLocalStorage("get", "token");
    const { title, pwd, note, website, account } = message.mes;
    let userInfo = {
      title,
      pwd,
      note,
      website,
      account,
      pluginId,
    };
    userInfo = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/password/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => {
        const setLocalData = async () => {
          await addItem(text);
          sendResponse(text);
        };
        setLocalData();
      })
      // .then((text) => addItem(text))
      .catch((error) => {});
    // self.props.history.push("/home/psd");
    return true;
  } else if (requestType === "deleteItem") {
    const token = handleLocalStorage("get", "token");

    const { pluginId, passwordIds, editConfig, targetObj } = message.mes;

    let userInfo = {
      pluginId,
      passwordIds,
    };
    userInfo = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/password/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => {
        deletePsdItem(text, editConfig, targetObj);
        sendResponse(text);
      })
      .catch((error) => {});
    // self.props.history.push("/home/psd");
    return true;
  } else if (requestType === "editNewPsw") {
    const token = handleLocalStorage("get", "token");
    const { title, pwd, note, website, account, pluginId } = message.mes;
    let userInfo = {
      title,
      pwd,
      note,
      website,
      account,
      pluginId,
    };
    const finished = "finished";
    userInfo = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/password/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => {
        const getSet = async () => {
          await editItem(text);
          sendResponse(text);
        };
        getSet();
      })

      .catch((error) => {});
    // self.props.history.push("/home/psd");
    return true;
  } else if (requestType === "outLogin") {
    const token = handleLocalStorage("get", "token");
    fetch("http://106.53.103.199:8088/app/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: "",
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "saveMainPassword") {
    const token = handleLocalStorage("get", "token");
    const { password } = message.mes;
    let mainPass = JSON.stringify(password);
    fetch("http://106.53.103.199:8088/plugin/api/v1/mainpass/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: mainPass,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .then(() => {
        data = "";
      })
      .catch((error) => {});
    return true;
  } else if (requestType === "searchPsw") {
    const token = handleLocalStorage("get", "token");

    const { searchInfo } = message.mes;

    let reqData = JSON.stringify(searchInfo);

    fetch("http://106.53.103.199:8088/plugin/api/v1/password/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: reqData,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "setAutoFill") {
    const token = handleLocalStorage("get", "token");
    const pluginId = handleLocalStorage("get", "pluginID");
    let { config } = message.mes;

    if (config == "open") {
      config = "OPEN_AUTO_FILL";
    } else {
      config = "CLOSE_AUTO_FILL";
    }
    let userInfo = {
      pluginId,
      setting: config,
    };

    let data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/setting/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "setAutoStore") {
    const token = handleLocalStorage("get", "token");
    const pluginId = handleLocalStorage("get", "pluginID");
    let { config } = message.mes;
    if (config == "open") {
      config = "OPEN_AUTO_STORE";
    } else {
      config = "CLOSE_AUTO_STORE";
    }
    let userInfo = {
      pluginId,
      setting: config,
    };
    let data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/setting/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "verifyPassword") {
    const token = handleLocalStorage("get", "token");
    const { mainPass } = message.mes;
    let userInfo = {
      mainPass,
    };
    let data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/mainpass/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "resetMainPsw") {
    const token = handleLocalStorage("get", "token");
    const { userInfo } = message.mes;

    let data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/mainpass/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "addNewFolder") {
    let { pluginId, name } = message.mes;
    const token = handleLocalStorage("get", "token");
    let userInfo = {
      pluginId,
      name,
    };
    data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/folder/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "getFolderList") {
    let { pluginId } = message.mes;
    const token = handleLocalStorage("get", "token");
    const pluginID = handleLocalStorage("get", "pluginID");
    if (!pluginId) {
      pluginId = pluginID;
    }
    let userInfo = {
      pluginId,
    };
    data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/folder/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "addPswToFolder") {
    const token = handleLocalStorage("get", "token");
    let { folderId, passwordIds } = message.mes;

    let userInfo = {
      folderId,
      passwordIds,
    };
    data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/password/move/to", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "deleteFolder") {
    const token = handleLocalStorage("get", "token");
    let { folderId, pluginId } = message.mes;
    let userInfo = {
      folderId,
      pluginId,
    };
    data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/folder/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "renameFolder") {
    const token = handleLocalStorage("get", "token");
    let { folderId, name } = message.mes;
    let userInfo = {
      folderId,
      name,
    };
    data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/folder/rename", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "outFolder") {
    const token = handleLocalStorage("get", "token");
    let { folderId, passwordIds } = message.mes;
    let userInfo = {
      folderId,
      passwordIds,
    };

    data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/password/move/out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  } else if (requestType === "setLockDelay") {
    const token = handleLocalStorage("get", "token");
    let { pluginId, lockedDelay } = message.mes;
    let userInfo = {
      lockedDelay,
      pluginId,
    };
    data = JSON.stringify(userInfo);
    fetch("http://106.53.103.199:8088/plugin/api/v1/setting/update/locked", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ClientType: "plugin",
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {});
    return true;
  }
  return true;
});

//监听用户关闭Popup页面 然后根据用户设置的数据进行锁定
chrome.runtime.onConnect.addListener(function (externalPort) {
  externalPort.onDisconnect.addListener(function () {
    count = 0;
    firstInterval = null;
    const clickTime = () => {
      const autoLock = handleLocalStorage("get", "autoLock");
      if (autoLock) {
        return;
      } else {
        let targetTime = handleLocalStorage("get", "lockedDelay");

        if (targetTime == 4) {
          targetTime = targetTime * 60 * 60;
        } else {
          targetTime = targetTime * 60;
        }
        if (targetTime == 0) {
          handleLocalStorage("set", "autoLock", true);
        } else if (targetTime == -1) {
          return;
        } else {
          console.log("进来");
          if (!setIntervalFlag) {
            setIntervalFlag = true;
            console.log("拜拜");
            return;
          } else {
            let mid = setInterval(() => {
              setIntervalFlag = false;
              let targetTime = handleLocalStorage("get", "lockedDelay");
              if (targetTime == 4) {
                targetTime = targetTime * 60 * 60;
              } else {
                targetTime = targetTime * 60;
              }
              if (!firstInterval) {
                firstInterval = targetTime;
              }

              if (firstInterval != targetTime) {
                firstInterval = targetTime;
                count = 0;
                clearInterval(mid);
                clickTime();
                return;
              }
              count++;
              console.log("执行");
              if (count == targetTime) {
                handleLocalStorage("set", "autoLock", true);
                clearInterval(mid);
                setIntervalFlag = true;
              }
            }, 1000);
          }
        }
      }
    };
    clickTime();
  });
});
// const secondInterval = () => {
//   let targetTime = handleLocalStorage("get", "lockedDelay");
//   if (targetTime == 4) {
//     targetTime = targetTime * 60 * 60;
//   } else if (targetTime == 0) {
//     handleLocalStorage("set", "autoLock", true);
//     return;
//   } else if (targetTime == -1) {
//     return;
//   } else {
//     targetTime = targetTime * 60;
//   }
//   if (targetTime > 0) {
//     let mid = setInterval(() => {
//       let targetTime = handleLocalStorage("get", "lockedDelay");
//       if (targetTime == 4) {
//         targetTime = targetTime * 60 * 60;
//       } else {
//         targetTime = targetTime * 60;
//       }

//       if (firstInterval != targetTime) {
//         firstInterval = targetTime;
//         clearInterval(mid);
//         count = 0;
//         secondInterval();
//         return;
//       }

//       count++;
//
//       if (count == targetTime) {
//         handleLocalStorage("set", "autoLock", true);
//         clearInterval(mid);
//         setIntervalFlag = true;
//         firstInterval = "";
//       }
//     }, 1000);
//   } else {
//     secondInterval();
//   }
// };
