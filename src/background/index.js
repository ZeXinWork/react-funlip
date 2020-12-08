/*global chrome*/
import { handleLocalStorage } from '../api'

import localforage from 'localforage'
import qs from 'qs'

let passwordItem
let data
let count = 0
let url = ''
let userName = ''
let password = ''
let setIntervalFlag = true
let currentTabId = undefined
let timeFlag = true
let firstInterval
let isRealShow = true
let isAutofill = true
let currentLoginTime = undefined

//判断是不是重启锁定插件
chrome.windows.onRemoved.addListener(function () {
  const token = handleLocalStorage('get', 'token')
  const autoLock = handleLocalStorage('get', 'autoLock')
  let targetTime = handleLocalStorage('get', 'lockedDelay')
  if (token) {
    if (!autoLock && targetTime == -2) {
      handleLocalStorage('set', 'autoLock', true)
    }
  }
})
//获取用户数据流程 （内存-》本地-》接口）
// 1、建立一个本地仓库（同步执行）
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'I-heart-indexDB2',
})
//2、封装从接口获取用户信息的代码
const getData = async () => {
  let BASE = 'https://devfunlipextapi.xmwefun.com/'
  // let BASE = "http://106.53.103.199:8088/";

  const token = handleLocalStorage('get', 'token')
  const pluginID = handleLocalStorage('get', 'pluginID')
  const value = {
    pluginId: pluginID,
  }
  return fetch(`${BASE}plugin/api/v1/password/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ClientType: 'plugin',
      Authorization: token,
    },
    body: JSON.stringify(value),
  }).then((response) => response.text())
}

//3、判断本地是否有数据（异步）如果有 就直接获取 没有就发请求给接口
const getDataBaseLen = async () => {
  let res
  const getLen = async () => {
    const res = await localforage.keys()
    return res.length
  }
  const getLength = async () => {
    res = await getLen()
  }
  await getLength()
  return res
}

//4、获取接口或本地用户信息数据 并存在内存data中
const getAllData = async () => {
  let userInfo

  const getLocalData = async () => {
    const res = localforage
      .getItem('userInfo')
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })
    return res
  }
  userInfo = await getLocalData()

  if (userInfo && userInfo.length > 0) {
    let arr1 = []
    Object.assign(arr1, userInfo)
    let temp = null
    for (let i = 0; i < arr1.length - 1; i++) {
      for (let j = 0; j < arr1.length - 1 - i; j++) {
        if (arr1[j].title.length > 0) {
          if (arr1[j].title > arr1[j + 1].title) {
            temp = arr1[j]
            arr1[j] = arr1[j + 1]
            arr1[j + 1] = temp
          }
        }
      }
    }

    data = userInfo
  } else {
    const getServeData = async () => {
      //将值设置在本地数据库
      const initData = async () => {
        let res = await getData()
        userInfo = res
        userInfo = JSON.parse(userInfo)
        data = userInfo
        localforage
          .setItem('userInfo', userInfo)
          .then(function (value) {
            // 当离线仓库中的值被载入时，此处代码运行
          })
          .catch(function (err) {
            // 当出错时，此处代码运行
          })
      }
      await initData()
    }
    await getServeData()
  }

  return userInfo
}

//往数据库里添加数据，并添加到内存返回给密码库页面
const addItem = async (value, isFolderAdd) => {
  value = JSON.parse(value)
  if (value.id) {
    const localState = await localforage
      .getItem('userInfo')
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })

    localState.push(value)
    localforage
      .setItem('userInfo', localState)
      .then(function (value) {
        data = value
        let cmd

        if (!isFolderAdd) {
          cmd = 'addSuccess'
          chrome.runtime.sendMessage(cmd, function (response) {})
        }
      })
      .catch(function (err) {})
  }
}

//删除数据库指定数据,并添加到内存返回给密码库页面
const deletePsdItem = async (deleteItem, config, targetObj) => {
  let value = JSON.parse(deleteItem)
  let idArrays = []
  value.data.map((item) => {
    idArrays.push(item.id)
  })
  const localState = await localforage
    .getItem('userInfo')
    .then(function (value) {
      // 当离线仓库中的值被载入时，此处代码运行
      return value
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    })
  for (let i = 0; i < localState.length; i++) {
    localState[i].index = i
    idArrays.map((item) => {
      if (localState[i].id === item) {
        localState.splice(localState[i].index, 1)
      }
    })
  }
  const newData = await localforage
    .setItem('userInfo', localState)
    .then(function (value) {
      return value
    })
    .catch(function (err) {})
  data = newData
  let targetId = value.data[0].id

  if (config) {
    const localFolderState = await localforage
      .getItem('folderList')
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })
    if (localFolderState) {
      for (let i = 0; i < localFolderState.length; i++) {
        for (let j = 0; j < localFolderState[i].passwords.length; j++) {
          if (localFolderState[i].passwords[j].id == targetId) {
            localFolderState[i].passwords.splice(j, 1)
            localFolderState[i].passwords.push(targetObj)
          }
        }
      }
      for (let i = 0; i < localFolderState.length; i++) {
        localFolderState[i].fileNum = localFolderState[i].passwords.length
      }

      localforage
        .setItem('folderList', localFolderState)
        .then(function (value) {
          return value
        })
        .catch(function (err) {})
    }
  }
  const cmd = 'deleteSuccess'

  if (!config) {
    const localFolderState = await localforage
      .getItem('folderList')
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })
    if (localFolderState && localFolderState.length > 0) {
      for (let i = 0; i < localFolderState.length; i++) {
        if (localFolderState[i].passwords) {
          for (let j = 0; j < localFolderState[i].passwords.length; j++) {
            if (localFolderState[i].passwords[j].id == targetId) {
              localFolderState[i].passwords.splice(j, 1)
            }
          }
        }
      }
      for (let i = 0; i < localFolderState.length; i++) {
        localFolderState[i].fileNum = localFolderState[i].passwords.length
      }

      localforage
        .setItem('folderList', localFolderState)
        .then(function (value) {
          return value
        })
        .catch(function (err) {})
    }
  }
  function sendCmd() {
    chrome.runtime.sendMessage(cmd, function (response) {})
  }
  sendCmd()
}

//编辑密码后更新本地数据
const editItem = async (value) => {
  value = JSON.parse(value)
  const localState = await localforage
    .getItem('userInfo')
    .then(function (value) {
      // 当离线仓库中的值被载入时，此处代码运行
      return value
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    })
  localState.push(value)
  localforage
    .setItem('userInfo', localState)
    .then(function (value) {
      data = value
    })
    .catch(function (err) {
      // 当出错时，此处代码运行
    })
}

//把密码发送个密码页
const sendDataToPopup = (data) => {
  const cmd = {
    type: 'popupGetData',
    data,
  }
  chrome.runtime.sendMessage(cmd, function (response) {})
}

//新增item到skipList
const addNewSkipList = async (value) => {
  let data = JSON.parse(value)
  const getLocalData = async () => {
    const res = localforage
      .getItem('skipList')
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
        return value
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })
    return res
  }
  let userInfo = await getLocalData()
  userInfo.push(data)
  localforage
    .setItem('skipList', userInfo)
    .then(function (value) {})
    .catch(function (err) {
      // 当出错时，此处代码运行
    })
}

//插件运行在所有url
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
    ])
  })
})

// bg监听由content.js或者popup发来的信息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  let { type } = message.mes
  let { requestType } = message.mes
  const autoFill = handleLocalStorage('get', 'autoFill') //设置是否自动填充
  const autoStore = handleLocalStorage('get', 'autoStore') //设置是否自动保存密码
  // let BASE = "http://106.53.103.199:8088/";
  let BASE = 'https://devfunlipextapi.xmwefun.com/'
  if (type === 'autofill') {
    if (autoFill == 1 && isAutofill) {
      const getAllDatas = async () => {
        const data = await getAllData()
        let userInfoData = { data }
        userInfoData.test = 'autofill'
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs[0]) {
              chrome.tabs.sendMessage(
                tabs[0].id,
                userInfoData,
                function (response) {}
              )
            }
          }
        )
      }
      getAllDatas()
    }
  } else if (type === 'setLoginTime') {
    if (!currentLoginTime) {
      currentLoginTime = message.mes.currentTime
    }

    sendResponse(currentLoginTime)
  } else if (type === 'cancelLoginTime') {
    currentLoginTime = undefined
  } else if (type === 'stopAutofill') {
    isAutofill = false
    if (!isAutofill) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'stopCount', function (response) {
          if (response == 'closeCount') {
            isAutofill = true
          }
        })
      })
    }
  } else if (type === 'mesToBackground') {
    passwordItem = message.mes
    passwordItem.test = 'mesToBackground'

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, passwordItem, function (response) {})
    })
  } else if (type === 'getUserList') {
    const getData = async () => {
      function deepCopy(o) {
        if (o instanceof Array) {
          var n = []
          for (var i = 0; i < o.length; ++i) {
            n[i] = deepCopy(o[i])
          }
          return n
        } else if (o instanceof Object) {
          var n = {}
          for (var i in o) {
            n[i] = deepCopy(o[i])
          }
          return n
        } else {
          return o
        }
      }

      const data = await getAllData()
      const newData = deepCopy(data)

      let arrSortMinToMax = (a, b) => {
        let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/
        if (!cReg.test(a.title) || !cReg.test(b.title)) {
          return a.title.localeCompare(b.title)
        } else {
          return a.title.localeCompare(b.title, 'zh')
        }
      }

      let sortArr = newData.sort(arrSortMinToMax)

      if (sortArr) {
        sendDataToPopup(sortArr)
      } else {
        sendDataToPopup(data)
      }
    }
    getData()
  } else if (type === 'showSave') {
    //判断当前是否应该打开自动保存页面

    let getDomain = false
    const configUrl = (url) => {
      var domain = url.split('/') //以“/”进行分割
      if (domain[2]) {
        domain = domain[2]
      } else {
        return url
      }

      let newDomain = domain.split('.')

      for (let i = 0; i < newDomain.length; i++) {
        if (newDomain[i] == 'com') {
          newDomain = newDomain[i - 1] + '.' + newDomain[i]
          getDomain = true
          return newDomain
        }
      }
      if (!getDomain) {
        return domain
      }
    }
    chrome.tabs.getSelected(null, function (tab) {
      // 先获取当前页面的tabID
      isRealShow = true

      if (autoStore == 1) {
        url = configUrl(tab.url)
      }
    })

    // if (url != message.mes.url) {
    //   password = "";
    //   userName = "";
    // }
  } else if (type === 'isShowSave') {
    //判断当前是否应该打开自动保存页面

    chrome.tabs.getSelected(null, function (tab) {
      // 先获取当前页面的tabID
      isRealShow = true

      if (autoStore == 1) {
        if (!currentTabId) {
          currentTabId = tab.id
        } else if (currentTabId != tab.id) {
          currentTabId = tab.id
          password = ''
          userName = ''
        }
      }
    })
    const setSHow = async () => {
      const getLocalData = async () => {
        const res = localforage
          .getItem('skipList')
          .then(function (value) {
            // 当离线仓库中的值被载入时，此处代码运行
            return value
          })
          .catch(function (err) {
            // 当出错时，此处代码运行
          })
        return res
      }

      //设置标志值realSend，为false代表用户列表有改密码或者skipList有该url
      let realSend = true
      let userInfo = await getLocalData()
      //skipList有该url
      if (userInfo && userInfo.length > 0) {
        for (let i = 0; i < userInfo.length; i++) {
          if (userInfo[i].website.indexOf(url) != -1) {
            realSend = false
          }
        }
      }

      //用户密码项有该账号
      const getLocalUData = async () => {
        const res = localforage
          .getItem('userInfo')
          .then(function (value) {
            // 当离线仓库中的值被载入时，此处代码运行
            return value
          })
          .catch(function (err) {
            // 当出错时，此处代码运行
          })
        return res
      }

      let usersInfo = await getLocalUData()

      if (usersInfo && usersInfo.length > 0) {
        for (let i = 0; i < usersInfo.length; i++) {
          if (usersInfo[i].website && usersInfo[i].website.length > 0) {
            // if (usersInfo[i].website.indexOf(url) != -1) {
            //   if (usersInfo[i].account == userName) {
            //
            //
            //     realSend = false;
            //   }
            // }
            if (url.indexOf(usersInfo[i].website) != -1) {
              if (usersInfo[i].account == userName) {
                realSend = false
              }
            }
          }
        }
      }

      let sendUrl = {
        showUrl: url,
        password: password,
        userName: userName,
      }

      // isRealShow 只在最顶层的window显示 不让接下来的iframe显示（修复样式bug）
      // realSend 判断是否需要显示

      if (
        autoStore == 1 &&
        isRealShow &&
        realSend &&
        password.length > 0 &&
        userName.length > 0
      ) {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, sendUrl, function (response) {})
          }
        )
      } else {
        //如果不显示 把url清空
        // url = "";
      }
    }
    setSHow()
  } else if (type === 'cancelSave') {
    userName = ''
    password = ''
    url = ''
    // isRealShow = false;
  } else if (type === 'savePsUs') {
    userName = message.mes.userName
    password = message.mes.password
  } else if (type === 'cancelCP') {
    userName = ''
    password = ''
  } else if (type === 'goUrl') {
    const { url } = message.mes
    const gonewURL = {
      toNewUrl: url,
      type: 'goNewUrl',
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, gonewURL, function (response) {})
    })
  } else if (type === 'showImage3') {
    let cmd = 'showImage3'
    chrome.runtime.sendMessage(cmd, function (response) {})
  } else if (type === 'showImage2') {
    let cmd = 'showImage2'
    chrome.runtime.sendMessage(cmd, function (response) {})
  } else if (type === 'showImage4') {
    let cmd = 'showImage4'
    chrome.runtime.sendMessage(cmd, function (response) {})
  } else if (type === 'noShow') {
    // isRealShow = false;
    userName = ''
    password = ''
    url = ''
  } else if (type === 'deleteOutLogin') {
    localforage
      .setItem('userInfo', [])
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })
    localforage
      .setItem('folderList', [])
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })
    localforage
      .setItem('skipList', [])
      .then(function (value) {
        // 当离线仓库中的值被载入时，此处代码运行
      })
      .catch(function (err) {
        // 当出错时，此处代码运行
      })
  } else if (type === 'stopAutofill') {
  } else if (requestType === 'getNumbers') {
    let { areaCode, phone, type } = message.mes
    const { NumberType } = message.mes
    if (NumberType) {
      type = 'FORGOT_PASSWORD'
    }
    fetch(`${BASE}plugin/api/v1/captcha/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
      },
      body: JSON.stringify({
        areaCode,
        phone,
        type,
      }),
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'checkNumber') {
    const {
      captcha,

      device_name,
      phone,
      phone_area_code,
    } = message.mes
    let userInfo = {
      phone,
      captcha,

      phone_area_code,
      device_name,
    }
    userInfo = qs.stringify(userInfo)
    fetch(`${BASE}app/api/login/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ClientType: 'plugin',
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'saveNewPsw') {
    const pluginId = handleLocalStorage('get', 'pluginID')
    const token = handleLocalStorage('get', 'token')
    const { title, pwd, note, website, account, isFolderAdd } = message.mes
    let userInfo = {
      title,
      pwd,
      note,
      website,
      account,
      pluginId,
    }
    userInfo = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/password/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => {
        const setLocalData = async () => {
          await addItem(text, isFolderAdd)
          sendResponse(text)
        }
        setLocalData()
      })
      // .then((text) => addItem(text))
      .catch((error) => {})
    // self.props.history.push("/home/psd");
    return true
  } else if (requestType === 'deleteItem') {
    const token = handleLocalStorage('get', 'token')

    const { pluginId, passwordIds, editConfig, targetObj } = message.mes

    let userInfo = {
      pluginId,
      passwordIds,
    }
    userInfo = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/password/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => {
        deletePsdItem(text, editConfig, targetObj)
        sendResponse(text)
      })
      .catch((error) => {})
    // self.props.history.push("/home/psd");
    return true
  } else if (requestType === 'editNewPsw') {
    const token = handleLocalStorage('get', 'token')
    const { title, pwd, note, website, account, pluginId } = message.mes
    let userInfo = {
      title,
      pwd,
      note,
      website,
      account,
      pluginId,
    }

    const finished = 'finished'
    userInfo = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/password/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: userInfo,
    })
      .then((response) => response.text())
      .then((text) => {
        const getSet = async () => {
          await editItem(text)
          sendResponse(text)
        }
        getSet()
      })

      .catch((error) => {})
    // self.props.history.push("/home/psd");
    return true
  } else if (requestType === 'outLogin') {
    const token = handleLocalStorage('get', 'token')
    fetch(`${BASE}app/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: '',
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'saveMainPassword') {
    const token = handleLocalStorage('get', 'token')
    const { password } = message.mes
    let mainPass = JSON.stringify(password)
    fetch(`${BASE}plugin/api/v1/mainpass/set`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: mainPass,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .then(() => {
        data = ''
      })
      .catch((error) => {})
    return true
  } else if (requestType === 'searchPsw') {
    const token = handleLocalStorage('get', 'token')

    const { searchInfo } = message.mes

    let reqData = JSON.stringify(searchInfo)

    fetch(`${BASE}plugin/api/v1/password/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: reqData,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'setAutoFill') {
    const token = handleLocalStorage('get', 'token')
    const pluginId = handleLocalStorage('get', 'pluginID')
    let { config } = message.mes

    if (config == 'open') {
      config = 'OPEN_AUTO_FILL'
    } else {
      config = 'CLOSE_AUTO_FILL'
    }
    let userInfo = {
      pluginId,
      setting: config,
    }

    let data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/setting/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'setAutoStore') {
    const token = handleLocalStorage('get', 'token')
    const pluginId = handleLocalStorage('get', 'pluginID')
    let { config } = message.mes
    if (config == 'open') {
      config = 'OPEN_AUTO_STORE'
    } else {
      config = 'CLOSE_AUTO_STORE'
    }
    let userInfo = {
      pluginId,
      setting: config,
    }
    let data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/setting/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'verifyPassword') {
    const token = handleLocalStorage('get', 'token')
    const { mainPass } = message.mes
    let userInfo = {
      mainPass,
    }
    let data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/mainpass/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'resetMainPsw') {
    const token = handleLocalStorage('get', 'token')
    const { userInfo } = message.mes

    let data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/mainpass/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'addNewFolder') {
    let { pluginId, name } = message.mes
    const token = handleLocalStorage('get', 'token')
    let userInfo = {
      pluginId,
      name,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/folder/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'getFolderList') {
    let { pluginId } = message.mes
    const token = handleLocalStorage('get', 'token')
    const pluginID = handleLocalStorage('get', 'pluginID')
    if (!pluginId) {
      pluginId = pluginID
    }
    let userInfo = {
      pluginId,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/folder/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'addPswToFolder') {
    const token = handleLocalStorage('get', 'token')
    let { folderId, passwordIds } = message.mes

    let userInfo = {
      folderId,
      passwordIds,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/password/move/to`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'deleteFolder') {
    const token = handleLocalStorage('get', 'token')
    let { folderId, pluginId } = message.mes
    let userInfo = {
      folderId,
      pluginId,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/folder/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'renameFolder') {
    const token = handleLocalStorage('get', 'token')
    let { folderId, name } = message.mes
    let userInfo = {
      folderId,
      name,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/folder/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'outFolder') {
    const token = handleLocalStorage('get', 'token')
    let { folderId, passwordIds } = message.mes
    let userInfo = {
      folderId,
      passwordIds,
    }

    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/password/move/out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'setLockDelay') {
    const token = handleLocalStorage('get', 'token')
    let { pluginId, lockedDelay } = message.mes
    let userInfo = {
      lockedDelay,
      pluginId,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/setting/update/locked`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'getCodeUrl') {
    let { expired, key } = message.mes
    let userInfo = {
      expired,
      key,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/login/scancode/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'checkNumberTime') {
    let { authToken, key } = message.mes
    let userInfo = {
      authToken,
      key,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/login/scancode/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'forgotPsw') {
    const token = handleLocalStorage('get', 'token')
    let { newMainPass, phone, verificationCode } = message.mes
    let userInfo = {
      newMainPass,
      phone,
      verificationCode,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/mainpass/modify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'getSkipList') {
    const token = handleLocalStorage('get', 'token')
    let { pluginId } = message.mes
    let userInfo = {
      pluginId,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/setting/skipping/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => sendResponse(text))
      .catch((error) => {})
    return true
  } else if (requestType === 'addNewSkip') {
    const token = handleLocalStorage('get', 'token')
    const pluginId = handleLocalStorage('get', 'pluginID')
    let { url } = message.mes
    let userInfo = {
      pluginId,
      website: url,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/setting/skipping/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => {
        addNewSkipList(text)
      })
      .catch((error) => {})
    return true
  } else if (requestType === 'removeWebsiteIem') {
    const token = handleLocalStorage('get', 'token')
    // const pluginId = handleLocalStorage("get", "pluginID");
    let { idList } = message.mes
    let userInfo = {
      // pluginId,
      idList,
    }
    data = JSON.stringify(userInfo)
    fetch(`${BASE}plugin/api/v1/setting/skipping/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ClientType: 'plugin',
        Authorization: token,
      },
      body: data,
    })
      .then((response) => response.text())
      .then((text) => {
        sendResponse(text)
      })
      .catch((error) => {})
    return true
  }
  return true
})

//监听用户关闭Popup页面 然后根据用户设置的数据进行锁定
chrome.runtime.onConnect.addListener(function (externalPort) {
  timeFlag = false
  externalPort.onDisconnect.addListener(function () {
    const token = handleLocalStorage('get', 'token')
    if (token) {
      timeFlag = true
      count = 0
      firstInterval = null
      const clickTime = () => {
        const autoLock = handleLocalStorage('get', 'autoLock')
        if (autoLock) {
          return
        } else {
          let targetTime = handleLocalStorage('get', 'lockedDelay')

          if (targetTime == 4) {
            targetTime = targetTime * 60 * 60
          } else if (targetTime == -1) {
            return
          } else {
            targetTime = targetTime * 60
          }
          if (targetTime == 0) {
            handleLocalStorage('set', 'autoLock', true)
          } else {
            let mid = setInterval(() => {
              if (!timeFlag) {
                clearInterval(mid)
                return
              }
              setIntervalFlag = false
              let targetTime = handleLocalStorage('get', 'lockedDelay')
              if (targetTime == 4) {
                targetTime = targetTime * 60 * 60
              } else {
                targetTime = targetTime * 60
              }
              if (!firstInterval) {
                firstInterval = targetTime
              }

              if (firstInterval != targetTime) {
                firstInterval = targetTime
                count = 0
                clearInterval(mid)
                clickTime()
                return
              }

              count++
              if (count == targetTime) {
                handleLocalStorage('set', 'autoLock', true)
                clearInterval(mid)
                setIntervalFlag = true
              }
            }, 1000)
          }
        }
      }
      clickTime()
    }
  })
})
