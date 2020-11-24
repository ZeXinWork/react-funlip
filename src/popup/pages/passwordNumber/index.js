/* global chrome */

import React, { Component } from "react";
import { Input, message } from "antd";
import { handleLocalStorage, reqLogin } from "../../../api/index";
import axios from "axios";

import "./passwordNumber.css";
import arrowLeft from "./icon_arrowright_black@2x.png";
import iconFail from "./icon_fail@2x.png";
export default class MyAbout extends Component {
  state = {
    input1: "",
    input2: "",
    input3: "",
    input4: "",
    input5: "",
    input6: "",
    input7: "",
    count: 60,
    show: "none",
  };
  componentDidMount() {
    //当输入一个值后跳转到下一个Input框
    const { tele, number, resetMainPsw } = this.props.location.state;
    function goNextInput() {
      var inputGroup = document.getElementsByClassName("set-input");
      for (var i = 0; i < inputGroup.length; i++) {
        var t = inputGroup[i];
        t.index = i;
        t.setAttribute("readonly", true);
        t.onkeyup = function () {
          const myValue = this.value;
          var next = this.index + 1;
          if (myValue && inputGroup[next]) {
            inputGroup[next].focus();
          }
          let k = window.event.keyCode;
          if (k == 8 || k == 46) {
            let pre = this.index - 1;
            if (pre < 0) {
              return;
            }
            inputGroup[pre].focus();
          }
        };
      }
      inputGroup[0].removeAttribute("readonly");
      inputGroup[1].removeAttribute("readonly");
      inputGroup[2].removeAttribute("readonly");
      inputGroup[3].removeAttribute("readonly");
      inputGroup[4].removeAttribute("readonly");
      inputGroup[5].removeAttribute("readonly");
      inputGroup[0].focus();
    }
    goNextInput();

    const setCount2 = () => {
      let space = document.getElementsByClassName("number-count-long")[0];
      space.className = "number-count";
      let retry = document.getElementsByClassName("re-get-click")[0];
      retry.className = "re-get";
      const userInfo = {
        areaCode: "+86",
        phone: tele,
        type: "PLUGIN_LOGIN",
      };
      const _this = this;
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "getNumbers";
        chrome.runtime.sendMessage({ mes }, function (res) {
          res = JSON.parse(res);
          if (res.code === 200) {
            const { verificationCode } = res.data;
            if (verificationCode) {
              handleLocalStorage("set", "verificationCode", verificationCode);
            }
          }
        });
      };
      sendMessageToContentBackgroundScript(userInfo);
      retry.onclick = function () {};
      this.setState({
        count: 60,
      });
      let mid = setInterval(() => {
        this.setState(
          {
            count: this.state.count - 1,
          },
          () => {
            if (this.state.count == 0) {
              let space = document.getElementsByClassName("number-count")[0];
              space.className = "number-count-long";
              this.setState({
                count: "请重新获取验证码",
              });
              clearInterval(mid);
              let retry = document.getElementsByClassName("re-get")[0];
              retry.className = "re-get-click";
              retry.onclick = setCount3;
            }
          }
        );
      }, 1000);
    };

    const setCount3 = () => {
      let space = document.getElementsByClassName("number-count-long")[0];
      space.className = "number-count";
      let retry = document.getElementsByClassName("re-get-click")[0];
      retry.className = "re-get";
      const userInfo = {
        areaCode: "+86",
        phone: tele,
        type: "PLUGIN_LOGIN",
      };
      const _this = this;
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "getNumbers";
        chrome.runtime.sendMessage({ mes }, function (res) {
          res = JSON.parse(res);
          if (res.code === 200) {
            const { verificationCode } = res.data;
            if (verificationCode) {
              handleLocalStorage("set", "verificationCode", verificationCode);
            }
          }
        });
      };
      sendMessageToContentBackgroundScript(userInfo);
      retry.onclick = function () {};
      if (this.state.count == "请重新获取验证码") {
        this.setState(
          {
            count: 60,
          },
          () => {
            let mid = setInterval(() => {
              this.setState(
                {
                  count: this.state.count - 1,
                },
                () => {
                  if (this.state.count == 0) {
                    clearInterval(mid);
                    let space = document.getElementsByClassName(
                      "number-count"
                    )[0];
                    space.className = "number-count-long";
                    this.setState({
                      count: "请重新获取验证码",
                    });
                    let retry = document.getElementsByClassName("re-get")[0];
                    retry.className = "re-get-click";
                    retry.onclick = setCount2;
                  }
                }
              );
            }, 1000);
          }
        );
      }
    };

    const setCount = () => {
      let mid = setInterval(() => {
        this.setState(
          {
            count: this.state.count - 1,
          },
          () => {
            if (this.state.count == 0) {
              let space = document.getElementsByClassName("number-count")[0];
              space.className = "number-count-long";
              clearInterval(mid);
              let retry = document.getElementsByClassName("re-get")[0];
              retry.className = "re-get-click";
              this.setState({
                count: "请重新获取验证码",
              });
              retry.onclick = setCount2;
            }
          }
        );
      }, 1000);
    };

    setCount();
  }

  render() {
    const goBack = () => {
      this.props.history.goBack();
    };
    //获取用户手机号 验证码
    let {
      tele,
      number,
      resetMainPsw,
      isForgotPsw,
      forgotNumber,
    } = this.props.location.state;
    const verificationCode = handleLocalStorage("get", "verificationCode");
    if (verificationCode) {
      number = verificationCode;
    }
    const reqUserLogin = async () => {
      const value = {
        phone: tele,
        captcha: number,
        phone_area_code: "+86",
        device_name: "Chrome-插件端",
      };

      if (resetMainPsw) {
        this.props.history.push({
          pathname: "/setMP",
          state: { id: "reset", verificationMainCode: number, tele },
        });
      } else if (isForgotPsw) {
        this.props.history.push({
          pathname: "/forgot",
          state: { id: "forgot", phone: tele, forgotNumber },
        });
      } else {
        const _this = this;
        const sendMessageToContentBackgroundScript = (mes) => {
          mes.requestType = "checkNumber";
          chrome.runtime.sendMessage({ mes }, function (res) {
            res = JSON.parse(res);
            if (res.code === 200) {
              const { plugin, token, user } = res.data;
              const {
                autoFill,
                autoLogin,
                autoStore,
                lockedDelay,
                id,
              } = plugin;
              let { firstTimeLogin, nickName } = user;
              handleLocalStorage("set", "pluginID", id);
              handleLocalStorage("set", "token", token);
              handleLocalStorage("set", "userName", nickName);
              handleLocalStorage("set", "autoFill", autoFill);
              handleLocalStorage("set", "autoLogin", autoLogin);
              handleLocalStorage("set", "autoStore", autoStore);
              handleLocalStorage("set", "lockedDelay", lockedDelay);
              handleLocalStorage("remove", "verificationMainCode");
              if (firstTimeLogin) {
                handleLocalStorage("set", "isSetMainPsw", true);
                _this.props.history.push({
                  pathname: "/setMP",
                  state: { id: "set" },
                });
              } else {
                _this.props.history.push({
                  pathname: "/home/psd",
                });
              }
            } else {
              alert(res.msg);
            }
          });
        };
        sendMessageToContentBackgroundScript(value);
      }
    };
    //获取用户输入的验证码信息并验证
    const getInputValue = (num, e) => {
      if (num == 1) {
        const value = e.target.value;
        this.setState(
          {
            input1: value,
          },
          () => {
            const {
              input1,
              input2,
              input3,
              input4,
              input5,
              input6,
            } = this.state;
            const value =
              input1 + input2 + input3 + input4 + input5 + input6 + "";
            if (input1 && input2 && input3 && input4 && input5 && input6)
              if (value == number) {
                // handleLocalStorage("set", "userName", "Tom");
                reqUserLogin();
              } else {
                this.setState(
                  {
                    show: "block",
                  },
                  () => {
                    let mid = setTimeout(() => {
                      this.setState(
                        {
                          show: "none",
                        },
                        () => {
                          clearTimeout(mid);
                        }
                      );
                    }, 2000);
                  }
                );
              }
          }
        );
      } else if (num == 2) {
        const value = e.target.value;

        this.setState(
          {
            input2: value,
          },
          () => {
            const {
              input1,
              input2,
              input3,
              input4,
              input5,
              input6,
            } = this.state;
            const value =
              input1 + input2 + input3 + input4 + input5 + input6 + "";
            if (input1 && input2 && input3 && input4 && input5 && input6)
              if (value == number) {
                // handleLocalStorage("set", "userName", "Tom");
                reqUserLogin();
              } else {
                this.setState(
                  {
                    show: "block",
                  },
                  () => {
                    let mid = setTimeout(() => {
                      this.setState(
                        {
                          show: "none",
                        },
                        () => {
                          clearTimeout(mid);
                        }
                      );
                    }, 2000);
                  }
                );
              }
          }
        );
      } else if (num == 3) {
        const value = e.target.value;
        this.setState(
          {
            input3: value,
          },
          () => {
            const {
              input1,
              input2,
              input3,
              input4,
              input5,
              input6,
            } = this.state;
            const value =
              input1 + input2 + input3 + input4 + input5 + input6 + "";
            if (input1 && input2 && input3 && input4 && input5 && input6)
              if (value == number) {
                // handleLocalStorage("set", "userName", "Tom");
                reqUserLogin();
              } else {
                this.setState(
                  {
                    show: "block",
                  },
                  () => {
                    let mid = setTimeout(() => {
                      this.setState(
                        {
                          show: "none",
                        },
                        () => {
                          clearTimeout(mid);
                        }
                      );
                    }, 2000);
                  }
                );
              }
          }
        );
      } else if (num == 4) {
        const value = e.target.value;
        this.setState(
          {
            input4: value,
          },
          () => {
            const {
              input1,
              input2,
              input3,
              input4,
              input5,
              input6,
            } = this.state;
            const value =
              input1 + input2 + input3 + input4 + input5 + input6 + "";
            if (input1 && input2 && input3 && input4 && input5 && input6)
              if (value == number) {
                // handleLocalStorage("set", "userName", "Tom");
                reqUserLogin();
              } else {
                this.setState(
                  {
                    show: "block",
                  },
                  () => {
                    let mid = setTimeout(() => {
                      this.setState(
                        {
                          show: "none",
                        },
                        () => {
                          clearTimeout(mid);
                        }
                      );
                    }, 2000);
                  }
                );
              }
          }
        );
      } else if (num == 5) {
        const value = e.target.value;
        this.setState(
          {
            input5: value,
          },
          () => {
            const {
              input1,
              input2,
              input3,
              input4,
              input5,
              input6,
            } = this.state;
            const value =
              input1 + input2 + input3 + input4 + input5 + input6 + "";
            if (input1 && input2 && input3 && input4 && input5 && input6)
              if (value == number) {
                // handleLocalStorage("set", "userName", "Tom");
                reqUserLogin();
              } else {
                this.setState(
                  {
                    show: "block",
                  },
                  () => {
                    let mid = setTimeout(() => {
                      this.setState(
                        {
                          show: "none",
                        },
                        () => {
                          clearTimeout(mid);
                        }
                      );
                    }, 2000);
                  }
                );
              }
          }
        );
      } else if (num == 6) {
        const value = e.target.value;
        this.setState(
          {
            input6: value,
          },
          () => {
            const {
              input1,
              input2,
              input3,
              input4,
              input5,
              input6,
            } = this.state;
            const value =
              input1 + input2 + input3 + input4 + input5 + input6 + "";
            if (input1 && input2 && input3 && input4 && input5 && input6)
              if (value == number) {
                // handleLocalStorage("set", "userName", "Tom");
                reqUserLogin();
              } else {
                this.setState(
                  {
                    show: "block",
                  },
                  () => {
                    let mid = setTimeout(() => {
                      this.setState(
                        {
                          show: "none",
                        },
                        () => {
                          clearTimeout(mid);
                        }
                      );
                    }, 2000);
                  }
                );
              }
          }
        );
      }
    };

    return (
      <div className="home-reset-wrapper">
        <div className="error-message" style={{ display: this.state.show }}>
          <img src={iconFail} className="icon-fail" />
          <div className="error-text">验证码错误</div>
        </div>
        <div className="home-reset-title">
          <img
            src={arrowLeft}
            onClick={goBack}
            className="home-reset-title-icon"
          />
        </div>
        <div className="home-reset-title-texts">验证码</div>
        <div className="number-notice">{`验证码已发送至 +86 ${tele}`}</div>

        <div className="auto-lock-body-input">
          <div className="number-count">{`${this.state.count}s`}</div>
          <div>
            <Input
              maxlength="1"
              className="set-input"
              onChange={(e) => {
                getInputValue(1, e);
              }}
            ></Input>
            <Input
              maxlength="1"
              className="set-input"
              onChange={(e) => {
                getInputValue(2, e);
              }}
            ></Input>
            <Input
              maxlength="1"
              className="set-input"
              onChange={(e) => {
                getInputValue(3, e);
              }}
            ></Input>
            <Input
              maxlength="1"
              className="set-input"
              onChange={(e) => {
                getInputValue(4, e);
              }}
            ></Input>
            <Input
              maxlength="1"
              className="set-input"
              onChange={(e) => {
                getInputValue(5, e);
              }}
            ></Input>
            <Input
              maxlength="1"
              className="set-input"
              onChange={(e) => {
                getInputValue(6, e);
              }}
            ></Input>
          </div>
        </div>
        <div className="re-get">重新获取</div>
      </div>
    );
  }
}
