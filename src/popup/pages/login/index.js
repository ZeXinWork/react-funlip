/* global chrome */

import React, { Component } from "react";
import { Button, Form, Select } from "antd";
import iconFall from "./icon_fail@2x.png";
import bg from "./bgg.png";

import localIp from "fez-local-ip";
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
  };
  componentDidMount() {
    const token = handleLocalStorage("get", "token");
    const isSetMainPsw = handleLocalStorage("get", "isSetMainPsw");
    const resetMainPsw = handleLocalStorage("get", "resetMainPsw");
    const autoLock = handleLocalStorage("get", "autoLock");
    const res = localIp.getLocalIP4();
    console.log(res);
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
    }
  }
  render() {
    const { Option } = Select;
    const lock = handleLocalStorage("get", "autolock");
    if (lock) {
      this.props.history.push("/autoLock");
    }
    const goCheck = () => {
      handleLocalStorage("set", "userName", "Tom");
      this.props.history.push({
        pathname: "/setMP",
        state: { id: "set" },
      });
    };

    const goForgot = () => {
      this.props.history.push("/forgot");
    };

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
            <div
              className="erCode-wrapper"
              onClick={() => {
                this.setState({
                  showPhone: false,
                });
              }}
            >
              <img src={erCode} className="erCode-icon" />
              <span className="erCoder-text">扫码登录</span>
            </div>
            <div className="login-notice">
              若您没有Funlip账号，第一次登录后将自动完成注册
            </div>
          </div>
        ) : (
          <div className="login-code-wrapper">
            <div className="mask-wrapper">
              <img src={refurbish} className="mask-wrapper-icon" />
            </div>
            <p className="code-title-wrapper">快速安全登录</p>
            <p className="code-explain-wrapper">
              请使用Funlip移动端扫描二维码登录
            </p>
            <div className="code-download"> {`前往官网下载 >`}</div>
            <div className="code-area">
              <QRCode
                id="qrCode"
                value="https://www.jianshu.com/u/992656e8a8a6"
                size={128} // 二维码的大小
                fgColor="#4E5278" // 二维码的颜色
                style={{ margin: "auto" }}
              />
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
