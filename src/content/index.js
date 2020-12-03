/*global chrome*/

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import showPsw from "./images/icon_edit_visible@2x.png";
import "antd/es/button/style/index.css";
import logo from "./images/icon_WePass_logo备份@2x.png";
import FunlipUrlLogo from "./images/img_me_photo备份.png";
import edit from "./images/icon_edit@2x.png";
import close from "./images/close.png";
import "./antd-diy.css";
import "./savePsw.css";

//布局 将savePSW插入到页面当中
function Content() {
  //自动保存密码
  let [show, setShow] = useState("none");
  let [psw, setPsw] = useState("url");
  let [userName, setUserName] = useState("url");
  let [url, setUrl] = useState("");
  let [detail, setDetail] = useState(false);
  let [title, setTitle] = useState("");
  let [note, setNote] = useState("");
  let [showUrl, setShowUrl] = useState(`${window.location.href}/favicon.ico`);
  let [titleExplain, setTitleExplain] = useState("hidden");
  let [passwordExplain, setPasswordExplain] = useState("hidden");
  let [accountExplain, setAccountExplain] = useState("hidden");
  let [titleInfo, setTitleInfo] = useState("标题不能为空");
  let [passwordInfo, setPasswordInfo] = useState("密码不能为空");
  let [accountInfo, setAAccountInfo] = useState("账号不能为空");

  // 获取当前主域名;
  const configUrl = (url) => {
    let getDomain = false;
    var domain = url.split("/"); //以“/”进行分割
    if (domain[2]) {
      domain = domain[2];
    } else {
      return url;
    }

    let newDomain = domain.split(".");

    for (let i = 0; i < newDomain.length; i++) {
      if (newDomain[i] == "com") {
        newDomain = newDomain[i - 1] + "." + newDomain[i];
        getDomain = true;
        return newDomain;
      }
    }
    if (!getDomain) {
      return domain;
    }
  };

  const sendMessageToBackgroundScript02 = (mes) => {
    mes.type = "showSave";
    mes.url = configUrl(window.location.href);

    chrome.runtime.sendMessage({ mes });
  };

  const sendMessageToBackgroundScript3 = (mes) => {
    mes.type = "isShowSave";
    mes.url = window.location.href;
    chrome.runtime.sendMessage({ mes });
  };

  const sendMessageToBackgroundScript4 = (mes) => {
    mes.type = "cancelSave";
    chrome.runtime.sendMessage({ mes });
  };

  const sendMessageToBackgroundScript5 = (mes) => {
    mes.type = "savePsUs";
    chrome.runtime.sendMessage({ mes });
  };

  const showPassword = () => {
    let input = document.getElementsByClassName("newPsw-card-input")[2];

    input.type == "password"
      ? (input.type = "text")
      : (input.type = "password");
  };

  const saveNewPwd = (options) => {
    const { isFirstPage } = options;
    let inputLogin = document.getElementById("Funlip-edit-input-info-text");
    let loginValue;
    let passwordValue;
    let titleValue;
    if (inputLogin) {
      loginValue = inputLogin.value;
    }
    let inputPassword = document.getElementById(
      "Funlip-edit-input-PswInfo-text"
    );
    if (inputPassword) {
      passwordValue = inputPassword.value;
    }
    let inputTitle = document.getElementById("Funlip-title-input");
    if (inputTitle) {
      titleValue = inputTitle.value;
    }
    let mes;
    if (isFirstPage) {
      mes = {
        requestType: "saveNewPsw",
        pwd: psw,
        website: url,
        account: userName,
        title: url,
        note,
      };
      chrome.runtime.sendMessage({ mes });
      setShow("none");
      setDetail(false);
      sendMessageToBackgroundScript4({});
    } else if (loginValue && passwordValue && titleValue) {
      mes = {
        requestType: "saveNewPsw",
        pwd: passwordValue,
        website: url,
        account: loginValue,
        title: titleValue,
        note,
      };
      chrome.runtime.sendMessage({ mes });
      setShow("none");
      setDetail(false);
      sendMessageToBackgroundScript4({});
    }
    if (!titleValue) {
      setTitleInfo("标题不能为空！");
      setTitleExplain("visible");
    }
    if (!loginValue) {
      setAAccountInfo("账号不能为空！");
      setAccountExplain("visible");
    }
    if (!passwordValue) {
      setPasswordInfo("密码不能为空！");
      setPasswordExplain("visible");
    }
  };

  const sendMessageToBackgroundScript06 = (mes) => {
    mes.type = "noShow";
    chrome.runtime.sendMessage({ mes });
  };
  sendMessageToBackgroundScript3({});
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    const newUrl = configUrl(window.location.href);
    if (request.password.length > 0) {
      setPsw(request.password);
    }
    if (request.userName.length > 0) {
      setUserName(request.userName);
    }

    let domain = window.location.href;
    domain = domain.split("/");
    if (domain[2]) {
      domain = domain[2];
    }
    setUrl(domain);

    // if (request.showUrl.indexOf(newUrl) != -1) {
    //   setShow("block");
    // }
    if (
      window.self === window.top &&
      request.showUrl &&
      request.showUrl.indexOf(newUrl) != -1
    ) {
      setShow("block");

      sendMessageToBackgroundScript06();
    }
  });

  return (
    <div
      className="XMFunlip-autoStorage-CRX-content CRX-antd-diy"
      style={{ display: show }}
    >
      <div className="save-psw-wrapper">
        <div className="save-ps-header">
          <div className="save-header-left">
            <img src={logo} alt="logo" className="XMFunlip-autoStorage-logo" />
            <span className="header-text">Funlip</span>
          </div>
          <div>
            <img
              src={close}
              alt="close"
              className="logo-right"
              onClick={() => {
                setShow("none");
                setDetail(false);
                sendMessageToBackgroundScript4({});
              }}
            />
          </div>
        </div>
        {detail ? (
          <React.Fragment>
            <div className="password-detail-wrapper">
              <img
                src={showPsw}
                className="showPasswordIcon"
                onClick={showPassword}
              />
              <div className="password-detail-header">
                <img
                  src={showUrl}
                  style={{ maxWidth: 32 }}
                  onError={() => {
                    setShowUrl(FunlipUrlLogo);
                  }}
                />
                <div className="password-detail-header-url">{url}</div>
              </div>
              <div className="password-detail-form-wrapper">
                <div className="password-form-inputnewPswText">标题</div>
                <input
                  className="newPsw-card-input"
                  id="Funlip-title-input"
                  bordered={false}
                  defaultValue={url}
                  maxLength={24}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 0) {
                      setTitleExplain("hidden");
                    }
                    if (value.length == 24) {
                      setTitleExplain("visible");
                      setTitleInfo("标题不能超过24位！");
                    }
                  }}
                />
                <div
                  style={{ visibility: titleExplain }}
                  className="funlip-explain-info"
                >
                  {titleInfo}
                </div>
                <div className="password-form-inputnewPswText">账号</div>
                <input
                  className="newPsw-card-input"
                  defaultValue={userName}
                  id="Funlip-edit-input-info-text"
                  maxLength={64}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 0) {
                      setAccountExplain("hidden");
                    }
                    if (value.length == 64) {
                      setAccountExplain("visible");
                      setAAccountInfo("账号不能超过64位！");
                    }
                  }}
                />

                <div
                  style={{ visibility: accountExplain }}
                  className="funlip-explain-info"
                >
                  {accountInfo}
                </div>

                <div className="password-form-inputnewPswText">密码</div>

                <input
                  className="newPsw-card-input "
                  id="password-input"
                  type="password"
                  defaultValue={psw}
                  id="Funlip-edit-input-PswInfo-text"
                  maxLength={24}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length > 0) {
                      setPasswordExplain("hidden");
                    }
                    if (value.length == 24) {
                      setPasswordExplain("visible");
                      setPasswordInfo("密码不能超过24位！");
                    }
                  }}
                />

                <div
                  style={{ visibility: passwordExplain }}
                  className="funlip-explain-info"
                >
                  {passwordInfo}
                </div>

                <div className="password-form-inputnewPswText">备注</div>

                <textarea
                  className="content-textarea-setINfo"
                  onChange={(e) => {
                    const value = e.target.value;
                    setNote(value);
                  }}
                />

                <div className="autoMids">
                  <div
                    className="button-layouts"
                    onClick={() => {
                      setShow("none");
                      setDetail(false);
                      sendMessageToBackgroundScript4({});
                    }}
                  >
                    <div className="mains ">
                      <div className="btn-1s ">
                        <span className="password-form-cancel">取消</span>
                      </div>
                    </div>
                  </div>
                  <button className="save-wrappers" onClick={saveNewPwd}>
                    保存
                  </button>
                </div>
              </div>
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div className="body-text">
              密码库中没有此网站的记录，是否需要创建一条？
            </div>
            <div className="save-psw-body">
              <div className="body-password">
                <div className="body-password-left">
                  <div className="body-password-img">
                    {/* 获取页面山的图标 */}
                    <img
                      src={showUrl}
                      onError={() => {
                        setShowUrl(FunlipUrlLogo);
                      }}
                    />
                  </div>
                  <div className="body-left-text">
                    <div className="body-left-text-url">{url}</div>
                    {/**想获取密码，还得通信，如何通信？
                     * 必须考虑的问题：1、发通信的请求在哪个时机？ 只要弹出，content就发消息给popup，并把页面的密码传过来
                     *                2、密码如何渲染到组件？ 监听content 提前设一个state放密码 只要content传信息过来 更新state就会更新页面
                     */}
                    <div>{userName}</div>
                  </div>
                </div>
                <div className="body-right-icon">
                  <img
                    src={edit}
                    className="edit-icon"
                    onClick={() => {
                      setDetail(true);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="autoMid">
              <button className="newpassword-text">
                <span
                  onClick={() => {
                    function sendMessageToBackgroundScript2(mes) {
                      mes.requestType = "addNewSkip";
                      mes.url = url;
                      chrome.runtime.sendMessage({ mes });
                    }
                    sendMessageToBackgroundScript2({});
                    sendMessageToBackgroundScript4({});
                    setShow("none");
                  }}
                >
                  跳过此网站
                </span>
              </button>

              <div
                className="btn-layout mr-20 set-bg"
                onClick={() => {
                  saveNewPwd({
                    isFirstPage: true,
                  });
                }}
              >
                <span className="save-text">保存</span>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

const app = document.createElement("div");
app.id = "CRX-container";
document.body.appendChild(app);
ReactDOM.render(<Content />, app);

try {
  let insertScript = document.createElement("script");
  insertScript.setAttribute("type", "text/javascript");
  insertScript.src = window.chrome.extension.getURL("insert.js");
  document.body.appendChild(insertScript);
  insertScript.id = "Funlip-extension-insertScript-xxxxx";
} catch (err) {}

let url = window.location.href;
let flag = true;
let data;
let setInterFlag = 0;
let setAutoStore = 0;
if (url.indexOf("chrome-extension:") != -1) {
  flag = false;
}

// 自动填充，每次打开页面之后都要发送信息给background，这样才能自动填充（因为要在bg里获取用户data）
function sendMessageToBackgroundScript2(mes) {
  mes.type = "autofill";
  mes.currentAutofillUrl = window.location.href;
  chrome.runtime.sendMessage({ mes });
}
if (flag) {
  let mid = setInterval(() => {
    setInterFlag++;
    sendMessageToBackgroundScript2({});
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request == "stopCount") {
        clearInterval(mid);
        setInterFlag = 0;
      }
      sendResponse("closeCount");
    });
    if (setInterFlag == 60) {
      clearInterval(mid);
    }
  }, 1000);
}

if (flag) {
  //1、获取页面表单和input
  //针对页面表单事件
  const configUrl = (url) => {
    var domain = url.split("/"); //以“/”进行分割
    if (domain[2]) {
      domain = domain[2];
    } else {
      return url;
    }

    let newDomain = domain.split(".");
    for (let i = 0; i < newDomain.length; i++) {
      if (newDomain[i] == "com") {
        newDomain = newDomain[i - 1] + "." + newDomain[i];
        return newDomain;
      } else {
        return document.domain;
      }
    }
  };
  let mid = setInterval(() => {
    setAutoStore++;
    const sendMessageToBackgroundScript5 = (mes) => {
      mes.type = "savePsUs";
      chrome.runtime.sendMessage({ mes });
    };
    const sendMessageToBackgroundScript02 = (mes) => {
      mes.type = "showSave";
      mes.url = configUrl(window.location.href);
      chrome.runtime.sendMessage({ mes });
    };
    const sendMessageToBackgroundScript3 = (mes) => {
      mes.type = "isShowSave";
      mes.url = window.location.href;
      chrome.runtime.sendMessage({ mes });
      clearInterval(mid);
    };

    // if (window.top === window.self) {
    //   sendMessageToBackgroundScript02({});
    // }
    document.onsubmit = function () {
      let loginWordText;
      let passWordText;
      let inputGroup = document.getElementsByTagName("input");
      let inputArray = [];
      if (inputGroup.length) {
        for (let i = 0; i < inputGroup.length; i++) {
          if (inputGroup[i].parentNode.style.display !== "none") {
            if (inputGroup[i].type === "password") {
              if (inputGroup[i].style.display == "none") {
                if (i === 1) {
                  inputArray.push(inputGroup[i - 1]);
                } else {
                  for (let j = i - 1; j > 0; j--) {
                    if (
                      inputGroup[j].style.display != "none" &&
                      inputGroup[j].type != "hidden"
                    ) {
                      inputArray.push(inputGroup[j]);
                      break;
                    }
                  }
                }
              }
              if (inputGroup[i].style.display != "none") {
                if (inputArray.length == 0) {
                  if (i === 1) {
                    inputArray.push(inputGroup[i - 1]);
                  } else {
                    for (let x = i - 1; x > 0; x--) {
                      if (
                        inputGroup[x].style.display != "none" &&
                        inputGroup[x].parentNode.style.display != "none" &&
                        inputGroup[x].type != "hidden"
                      ) {
                        inputArray.push(inputGroup[x]);
                        break;
                      }
                    }
                  }
                }
                inputArray.push(inputGroup[i]);
              }
            }
          }
        }
        if (inputArray.length) {
          loginWordText = inputArray[0];
          passWordText = inputArray[1];
          let value = {
            userName: loginWordText.value,
            password: passWordText.value,
          };

          sendMessageToBackgroundScript5(value);
        }
      }
      if (inputArray.length > 0) {
        sendMessageToBackgroundScript02({});
        sendMessageToBackgroundScript3({});
      }
    };

    const setOnclick = () => {
      let inputGroup = document.getElementsByTagName("input");
      let inputArray = [];
      let loginWordText;
      let passWordText;
      if (inputGroup.length) {
        for (let i = 0; i < inputGroup.length; i++) {
          if (inputGroup[i].parentNode.style.display !== "none") {
            if (inputGroup[i].type === "password") {
              if (inputGroup[i].style.display == "none") {
                if (i === 1) {
                  inputArray.push(inputGroup[i - 1]);
                } else {
                  for (let j = i - 1; j > 0; j--) {
                    if (
                      inputGroup[j].style.display != "none" &&
                      inputGroup[j].type != "hidden"
                    ) {
                      inputArray.push(inputGroup[j]);
                      break;
                    }
                  }
                }
              }
              if (inputGroup[i].style.display != "none") {
                if (inputArray.length == 0) {
                  if (i === 1) {
                    inputArray.push(inputGroup[i - 1]);
                  } else {
                    for (let x = i - 1; x > 0; x--) {
                      if (
                        inputGroup[x].style.display != "none" &&
                        inputGroup[x].parentNode.style.display != "none" &&
                        inputGroup[x].type != "hidden"
                      ) {
                        inputArray.push(inputGroup[x]);
                        break;
                      }
                    }
                  }
                }
                inputArray.push(inputGroup[i]);
              }
            }
          }
        }
        if (inputArray.length) {
          loginWordText = inputArray[0];
          passWordText = inputArray[1];
          let value = {
            userName: loginWordText.value,
            password: passWordText.value,
          };

          sendMessageToBackgroundScript5(value);
        }
      }

      if (
        inputArray.length > 0 &&
        loginWordText.value.length > 0 &&
        passWordText.value.length > 0
      ) {
        // setShow("block");
        sendMessageToBackgroundScript02({});
        sendMessageToBackgroundScript3({});
        clearInterval(mid);
      }
    };

    function loadTree(parent, callback) {
      for (var i = 0; i < parent.children.length; i++) {
        // 遍历第一级子元素
        var child = parent.children[i];

        if (child.className) {
          if (child.className.indexOf("login") != -1) {
            let text = child.innerText;
            text = child.innerText.replace(/\s*/g, "");
            if (
              text.indexOf("登录") != -1 ||
              text.indexOf("Login") != -1 ||
              text.indexOf("login") != -1
            ) {
              child.addEventListener("click", setOnclick, false);
            }
          }
        } else if (child.id) {
          if (child.id.indexOf("login") != -1) {
            let text = child.innerText;
            text = child.innerText.replace(/\s*/g, "");
            if (
              text.indexOf("登录") != -1 ||
              text.indexOf("Login") != -1 ||
              text.indexOf("login") != -1
            ) {
              child.addEventListener("click", setOnclick, false);
            }
          }
        }
        if (child.value) {
          if (
            child.value.indexOf("登录") != -1 ||
            child.value.indexOf("Login") != -1 ||
            child.value.indexOf("login") != -1
          ) {
            child.addEventListener("click", setOnclick, false);
          }
        }
        if (callback) {
          // 处理找到的子元素
          callback(child);
        }
        // 递归调用
        loadTree(child);
      }
    }

    let forms = document.getElementsByTagName("FORM");
    for (let i = 0; i < forms.length; i++) {
      loadTree(forms[i], function (element) {
        element.onclick = function () {};
      });
    }

    let aCollection = document.getElementsByTagName("a");
    let aLoginGroup = [];

    //对页面a标签处理
    for (let i = 0; i < aCollection.length; i++) {
      if (aCollection[i].id) {
        if (
          aCollection[i].id.indexOf("login") != -1 &&
          aCollection[i].childElementCount == 0
        ) {
          aLoginGroup.push(aCollection[i]);
        }
      } else if (aCollection[i].className) {
        if (
          aCollection[i].className.indexOf("login") != -1 &&
          aCollection[i].childElementCount == 0
        ) {
          aLoginGroup.push(aCollection[i]);
        }
      }
    }
    if (aLoginGroup.length > 0) {
      let targetA = aLoginGroup[0];
      targetA.addEventListener("click", setOnclick, false);
    }

    //对页面button标签进行处理
    let buttonCollection = document.getElementsByTagName("button");
    let BtnGroup = [];
    for (let i = 0; i < buttonCollection.length; i++) {
      if (buttonCollection[i].id) {
        if (
          buttonCollection[i].id.indexOf("login") != -1 &&
          buttonCollection[i].childElementCount == 0 &&
          buttonCollection[i].type === "submit"
        ) {
          BtnGroup.push(aCollection[i]);
        }
      } else if (buttonCollection[i].className) {
        if (
          buttonCollection[i].className.indexOf("login") != -1 &&
          buttonCollection[i].childElementCount == 0 &&
          buttonCollection[i].type === "submit"
        ) {
          BtnGroup.push(aCollection[i]);
        }
      }
    }

    if (BtnGroup.length > 0) {
      let targetA = BtnGroup[0];
      targetA.addEventListener("click", setOnclick, false);
    }

    //对页面input框进行处理
    let inputCollection = document.getElementsByTagName("input");
    let inputGroup = [];

    for (let i = 0; i < inputCollection.length; i++) {
      if (inputCollection[i].id) {
        if (
          inputCollection[i].id.indexOf("login") != -1 ||
          inputCollection[i].type === "button"
        ) {
          inputGroup.push(inputCollection[i]);
        }
      } else if (inputCollection[i].className) {
        if (
          inputCollection[i].className.indexOf("login") != -1 ||
          inputCollection[i].type === "button"
        ) {
          inputGroup.push(inputCollection[i]);
        }
      }
    }

    if (inputGroup.length > 0) {
      let targetA = inputGroup[0];
      targetA.addEventListener("click", setOnclick, false);
    }
    if (setAutoStore == 60) {
      clearInterval(mid);
    }
  }, 1000);
}

//跳转新的url
const goUrl = (url) => {
  if (window.self === window.top) {
    if (url.indexOf("https://") != -1) {
      window.open(url, "_blank");
    } else if (url.indexOf("httP://") != -1) {
      window.open(url, "_blank");
    } else {
      window.open(`https://${url}`, "_blank");
    }
  }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // 自动填充
  function autofill() {
    if (request.test == "autofill") {
      const configUrl = (url) => {
        var domain = url.split("/"); //以“/”进行分割
        if (domain[2]) {
          domain = domain[2];
        } else {
          return url; //如果url不正确就取空
        }
        let newDomain = domain.split(".");
        if (newDomain[2]) {
          newDomain = newDomain[1] + "." + newDomain[2];
          return newDomain;
        } else {
          return domain;
        }
      };

      data = request.data;

      for (let key in data) {
        const targetUrl = configUrl(data[key].website);
        let newTargetUrl = targetUrl.split(".");
        if (newTargetUrl.length == 3) {
          newTargetUrl = newTargetUrl[1] + "." + newTargetUrl[2];
        } else {
          newTargetUrl = targetUrl;
        }
        if (newTargetUrl) {
          if (window.location.href.indexOf(newTargetUrl) != -1) {
            function test(name, pass) {
              let inputGroup = document.getElementsByTagName("input");
              let inputArray = [];
              if (inputGroup.length) {
                for (let i = 0; i < inputGroup.length; i++) {
                  if (inputGroup[i].parentNode.style.display !== "none") {
                    if (inputGroup[i].type === "password") {
                      if (inputGroup[i].style.display == "none") {
                        if (i === 1) {
                          inputArray.push(inputGroup[i - 1]);
                        } else {
                          for (let j = i - 1; j > 0; j--) {
                            if (
                              inputGroup[j].parentNode.style.display !== "none"
                            ) {
                              if (
                                inputGroup[j].style.display != "none" &&
                                inputGroup[j].type != "hidden"
                              ) {
                                inputArray.push(inputGroup[j]);
                                break;
                              }
                            }
                          }
                        }
                      }
                      if (inputGroup[i].style.display != "none") {
                        if (inputArray.length == 0) {
                          if (i === 1) {
                            inputArray.push(inputGroup[i - 1]);
                          } else {
                            for (let x = i - 1; x > 0; x--) {
                              if (
                                inputGroup[x].parentNode.style.display !==
                                "none"
                              ) {
                              }
                              if (
                                inputGroup[x].style.display != "none" &&
                                inputGroup[x].parentNode.style.display !=
                                  "none" &&
                                inputGroup[x].type != "hidden"
                              ) {
                                inputArray.push(inputGroup[x]);
                                break;
                              }
                            }
                          }
                        }
                        inputArray.push(inputGroup[i]);
                      }
                    }
                  }
                }
                if (inputArray.length == 2) {
                  let loginWordText = inputArray[0];
                  let passWordText = inputArray[1];
                  var nativeInputValueSetterPsw = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    "value"
                  ).set;

                  var nativeInputValueSetterUserName = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    "value"
                  ).set;
                  //设置监听用户名input框的修改

                  nativeInputValueSetterUserName.call(loginWordText, name);
                  var ev2 = new Event("input", { bubbles: true });
                  loginWordText.dispatchEvent(ev2);

                  //设置监听密码input框的修改
                  nativeInputValueSetterPsw.call(passWordText, pass);
                  var ev2 = new Event("input", { bubbles: true });
                  passWordText.dispatchEvent(ev2);
                  if (
                    (loginWordText && loginWordText.value.length > 0) ||
                    (passWordText && passWordText.value.length > 0)
                  ) {
                    function sendMessageToBackgroundScript2(mes) {
                      mes.type = "stopAutofill";
                      mes.currentAutofillUrl = window.location.href;
                      chrome.runtime.sendMessage({ mes });
                    }
                    sendMessageToBackgroundScript2({});
                    //
                    // setInterFlag = false;
                  }
                }
              }
            }
            test(data[key].account, data[key].pwd);
          }
        }
      }
    }
  }
  autofill();
  let autoFillConfig = true;
  //手动填充密码
  function test() {
    if (request.test == "mesToBackground") {
      const configUrl = (url) => {
        var domain = url.split("/"); //以“/”进行分割
        if (domain[2]) {
          domain = domain[2];
        } else {
          return url; //如果url不正确就取空
        }
        let newDomain = domain.split(".");
        if (newDomain[2]) {
          newDomain = newDomain[1] + "." + newDomain[2];
          return newDomain;
        } else {
          return domain;
        }
      };

      const targetUrl = configUrl(request.website);

      let newTargetUrl = targetUrl.split(".");
      if (newTargetUrl.length == 3) {
        newTargetUrl = newTargetUrl[1] + "." + newTargetUrl[2];
      } else {
        newTargetUrl = targetUrl;
      }

      if (newTargetUrl) {
        if (window.location.href.indexOf(newTargetUrl) != -1) {
          //   alert("data在循环");

          function test(name, pass) {
            let inputGroup = document.getElementsByTagName("input");
            let inputArray = [];
            if (inputGroup.length) {
              for (let i = 0; i < inputGroup.length; i++) {
                if (inputGroup[i].parentNode.style.display !== "none") {
                  if (inputGroup[i].type === "password") {
                    if (inputGroup[i].style.display == "none") {
                      if (i === 1) {
                        inputArray.push(inputGroup[i - 1]);
                      } else {
                        for (let j = i - 1; j > 0; j--) {
                          if (
                            inputGroup[j].style.display != "none" &&
                            inputGroup[j].type != "hidden"
                          ) {
                            inputArray.push(inputGroup[j]);
                            break;
                          }
                        }
                      }
                    }
                    if (inputGroup[i].style.display != "none") {
                      if (inputArray.length == 0) {
                        if (i === 1) {
                          inputArray.push(inputGroup[i - 1]);
                        } else {
                          for (let x = i - 1; x > 0; x--) {
                            if (
                              inputGroup[x].style.display != "none" &&
                              inputGroup[x].parentNode.style.display !=
                                "none" &&
                              inputGroup[x].type != "hidden"
                            ) {
                              //
                              inputArray.push(inputGroup[x]);
                              break;
                            }
                          }
                        }
                      }
                      inputArray.push(inputGroup[i]);
                    }
                  }
                }
              }
              if (inputArray.length) {
                let loginWordText = inputArray[0];
                let passWordText = inputArray[1];

                var nativeInputValueSetterPsw = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  "value"
                ).set;

                var nativeInputValueSetterUserName = Object.getOwnPropertyDescriptor(
                  window.HTMLInputElement.prototype,
                  "value"
                ).set;
                //设置监听用户名input框的修改

                nativeInputValueSetterUserName.call(loginWordText, name);
                var ev2 = new Event("input", { bubbles: true });
                loginWordText.dispatchEvent(ev2);

                //设置监听密码input框的修改
                nativeInputValueSetterPsw.call(passWordText, pass);
                var ev2 = new Event("input", { bubbles: true });
                passWordText.dispatchEvent(ev2);
                if (
                  (loginWordText && loginWordText.value.length > 0) ||
                  (passWordText && passWordText.value.length > 0)
                ) {
                  function sendMessageToBackgroundScript2(mes) {
                    mes.type = "stopAutofill";
                    mes.currentAutofillUrl = window.location.href;
                    chrome.runtime.sendMessage({ mes });
                  }
                  sendMessageToBackgroundScript2({});
                  //
                  // setInterFlag = false;
                }
              }
            }
          }
          test(request.account, request.pwd);
        }
      }
    }
  }
  test();

  //跳转到新页面
  if (request.type === "goNewUrl") {
    goUrl(request.toNewUrl);
  }
});
