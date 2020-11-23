/* global chrome */

import React, { Component } from "react";
import { Button, Form, Select } from "antd";
import iconFall from "./icon_fail@2x.png";
import bg from "./bgg.png";
import axios from "axios";

import Phone from "./phone@2x.png";
import { handleLocalStorage } from "../../../api";
import QRCode from "qrcode.react";
import erCode from "./ercode.png";
import refurbish from "./refurbish.png";
import "./login.css";

export default class componentName extends Component {
  state = {
    FormatShow: "none",
    already: "none",
    showPhone: false,
    maskShow: "none",
    authToken: "",
    showCode: true,
    clickTime: true,
  };
  codeLogin = () => {
    if (!this.state.showPhone) {
      function randomString(len) {
        len = len || 32;
        var $chars =
          "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = "";
        for (let i = 0; i < len; i++) {
          pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
      }
      const myString = randomString(10);
      this.setState(
        {
          key: myString,
        },
        () => {
          let userInfo = {
            expired: 300,
            key: myString,
          };

          const sendMessageToContentBackgroundScript = (mes) => {
            const _this = this;
            mes.requestType = "getCodeUrl";
            chrome.runtime.sendMessage({ mes }, function (res) {
              let response = JSON.parse(res);
              const { authToken } = response;
              console.log(authToken);
              _this.setState(
                {
                  authToken,
                },
                () => {
                  if (_this.state.clickTime) {
                    _this.setState(
                      {
                        clickTime: false,
                      },
                      () => {
                        let mid = setInterval(() => {
                          let PhoneBtn = document.getElementsByClassName(
                            "phone-text"
                          )[0];
                          PhoneBtn.addEventListener("click", () => {
                            _this.setState(
                              {
                                clickTime: true,
                              },
                              () => {
                                clearInterval(mid);
                              }
                            );
                          });
                          let userInfo = {
                            authToken: _this.state.authToken,
                            key: _this.state.key,
                          };
                          const sendMessageToContentBackgroundScript = (
                            mes
                          ) => {
                            mes.requestType = "checkNumberTime";
                            chrome.runtime.sendMessage({ mes }, function (res) {
                              let response = JSON.parse(res);
                              console.log(response);
                              let { loginStatus } = response;
                              if (loginStatus == "LOGIN_KEY_EXPIRED") {
                                _this.setState(
                                  {
                                    maskShow: true,
                                    clickTime: true,
                                  },
                                  () => {
                                    clearInterval(mid);
                                  }
                                );
                              }

                              //取消登录
                              else if (loginStatus == "CANCEL_LOGIN") {
                                console.log("取消登录");
                                _this.setState(
                                  {
                                    clickTime: true,
                                  },
                                  () => {
                                    clearInterval(mid);
                                    this.codeLogin();
                                  }
                                );
                              }
                              //登陆成功
                              else if (loginStatus == "LOGGED_IN") {
                                console.log("成功登录");
                                _this.setState({
                                  clickTime: true,
                                });
                                const { loginToken, token } = response;
                                const { plugin, user } = loginToken;
                                const {
                                  autoFill,
                                  autoLogin,
                                  autoStore,
                                  lockedDelay,
                                  id,
                                  userId,
                                  createdAt,
                                  updatedAt,
                                } = plugin;
                                let { firstTimeLogin, nickname } = user;
                                handleLocalStorage("set", "pluginID", id);
                                handleLocalStorage("set", "token", token);
                                handleLocalStorage("set", "userName", nickname);
                                handleLocalStorage("set", "autoFill", autoFill);
                                handleLocalStorage(
                                  "set",
                                  "autoLogin",
                                  autoLogin
                                );
                                handleLocalStorage(
                                  "set",
                                  "autoStore",
                                  autoStore
                                );
                                handleLocalStorage(
                                  "set",
                                  "lockedDelay",
                                  lockedDelay
                                );
                                if (firstTimeLogin) {
                                  handleLocalStorage(
                                    "set",
                                    "isSetMainPsw",
                                    true
                                  );
                                  _this.props.history.push({
                                    pathname: "/setMP",
                                    state: { id: "set" },
                                  });
                                } else {
                                  _this.props.history.push({
                                    pathname: "/home/psd",
                                  });
                                }
                                clearInterval(mid);
                              }
                            });
                          };
                          sendMessageToContentBackgroundScript(userInfo);
                        }, 1000);
                      }
                    );
                  }
                }
              );
            });
          };
          sendMessageToContentBackgroundScript(userInfo);
        }
      );
    }
  };
  componentDidMount() {
    const token = handleLocalStorage("get", "token");
    const isSetMainPsw = handleLocalStorage("get", "isSetMainPsw");
    const resetMainPsw = handleLocalStorage("get", "resetMainPsw");
    const autoLock = handleLocalStorage("get", "autoLock");

    if (isSetMainPsw) {
      this.props.history.push({
        pathname: "/setMP",
        state: { id: "set" },
      });
    } else if (resetMainPsw) {
      this.props.history.push({
        pathname: "/setMP",
        state: { id: "reset" },
      });
    } else if (autoLock) {
      this.props.history.push("/autoLock");
    } else if (token) {
      this.props.history.push("/home");
    } else {
      this.codeLogin();
    }
  }

  render() {
    const { Option } = Select;
    const lock = handleLocalStorage("get", "autolock");
    if (lock) {
      this.props.history.push("/autoLock");
    }

    //表单通过后的回调
    const onFinish = async (values) => {
      const { tele } = values; //获取用户输入的手机号
      ////发请求先获取验证码
      const userInfo = {
        areaCode: "+86",
        phone: tele,
        type: "PLUGIN_LOGIN",
      };

      const sendMessageToContentBackgroundScript = (mes) => {
        const _this = this;
        mes.requestType = "getNumbers";

        chrome.runtime.sendMessage({ mes }, function (res) {
          res = JSON.parse(res);

          if (res.code === 200) {
            const { verificationCode } = res.data;
            _this.props.history.push({
              pathname: "/pswNum",
              state: { tele: tele, number: verificationCode },
            });
          } else if (res.code === 714) {
            _this.setState(
              {
                already: "block",
              },
              () => {
                setTimeout(() => {
                  _this.setState({
                    already: "none",
                  });
                }, 2000);
              }
            );
          }
        });
      };
      sendMessageToContentBackgroundScript(userInfo);
    };
    //表单失败的回调
    const onFinishFailed = (errorInfo) => {
      setShow();
    };
    const setShow = () => {
      this.setState(
        {
          FormatShow: "block",
        },
        () => {
          let mid = setTimeout(() => {
            this.setState(
              {
                FormatShow: "none",
              },
              () => {
                clearTimeout(mid);
              }
            );
          }, 2000);
        }
      );
    };
    return (
      <div className="login-form-wrapper">
        <div className="login-form-image-wrapper">
          <img src={bg} alt="logo" className="login-form-logo" />
        </div>
        {this.state.showPhone ? (
          <div>
            <div
              className="error-message"
              style={{ display: this.state.FormatShow }}
            >
              <img src={iconFall} className="icon-fail" />
              <div className="error-text">手机号格式错误</div>
            </div>
            <div
              className="error-message"
              style={{ display: this.state.already }}
            >
              <img src={iconFall} className="icon-fail" />
              <div className="error-text">验证码已发送</div>
            </div>
            <Form
              name="login-from"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <div className="login-form-input-wrapper">
                <Select
                  defaultValue="+86"
                  bordered={false}
                  className="form-select"
                >
                  <Option value="china">+86</Option>
                </Select>
                <Form.Item
                  label=""
                  name="tele"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        const myReg = /^1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[235-8]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|66\d{2})\d{6}$/;
                        if (!myReg.test(value)) {
                          return Promise.reject("");
                        } else {
                          return Promise.resolve();
                        }
                      },
                    }),
                  ]}
                >
                  <input
                    placeholder="请输入手机号"
                    className="login-form-input-number"
                  />
                </Form.Item>
              </div>
              <Form.Item>
                <div className="login-form-buttonGroup">
                  <Button
                    shape="round"
                    htmlType="submit"
                    className="login-form-submit"
                  >
                    获取验证码
                  </Button>
                </div>
              </Form.Item>
            </Form>
            <div className="erCode-wrapper">
              <img src={erCode} className="erCode-icon" />
              <span
                className="erCoder-text"
                onClick={() => {
                  this.setState(
                    {
                      showPhone: false,
                    },
                    () => {
                      this.codeLogin();
                    }
                  );
                }}
              >
                扫码登录
              </span>
            </div>
            <div className="login-notice">
              若您没有Funlip账号，第一次登录后将自动完成注册
            </div>
          </div>
        ) : (
          <div className="login-code-wrapper">
            <div
              className="mask-wrapper"
              style={{ display: this.state.maskShow }}
            >
              <img
                src={refurbish}
                className="mask-wrapper-icon"
                onClick={() => {
                  this.setState(
                    {
                      maskShow: "none",
                    },
                    () => {
                      handleLocalStorage("remove", "loginToken");
                      this.codeLogin();
                    }
                  );
                }}
              />
            </div>
            <p className="code-title-wrapper">快速安全登录</p>
            <p className="code-explain-wrapper">
              请使用Funlip移动端扫描二维码登录
            </p>
            <div
              className="code-download"
              onClick={() => {
                function sendMessageToContentScript2() {
                  let mes = {
                    url: "https://funlip.xmwefun.com/",
                    type: "goUrl",
                  };
                  chrome.runtime.sendMessage({ mes }, function (response) {});
                }
                sendMessageToContentScript2();
              }}
            >
              {`前往官网下载 >`}
            </div>
            <div className="code-area">
              {this.state.showCode ? (
                <QRCode
                  id="qrCode"
                  value={`https://funlip.xmwefun.com?scanningLoginKey=${this.state.key}`}
                  size={128} // 二维码的大小
                  fgColor="#4E5278" // 二维码的颜色
                  style={{ margin: "auto" }}
                />
              ) : (
                ""
              )}
            </div>
            <div className="switch-phone-login">
              <img src={Phone} className="phone-logo"></img>
              <span
                className="phone-text"
                onClick={() => {
                  this.setState({
                    showPhone: true,
                  });
                }}
              >
                手机号登录
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
