/* global chrome */

import React, { Component } from "react";
import { Button, Input, Form, Select } from "antd";
import iconFall from "./icon_fail@2x.png";
import bg from "./bgg.png";

import { handleLocalStorage, getCaptcha } from "../../../api";
import "./login.css";
import axios from "axios";

export default class componentName extends Component {
  state = {
    FormatShow: "none",
    already: "none",
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

      // let value = JSON.stringify(userInfo);

      // axios
      //   .post("/plugin/api/v1/captcha/send", userInfo, {
      //     headers: { ClientType: "plugin" },
      //   })
      //   .then((res) => {
      //
      //     if (res.data.code === 200) {
      //       const { verificationCode } = res.data.data;
      //       this.props.history.push({
      //         pathname: "/pswNum",
      //         state: { tele: tele, number: verificationCode },
      //       });
      //     }
      //   });
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
        <div
          className="error-message"
          style={{ display: this.state.FormatShow }}
        >
          <img src={iconFall} className="icon-fail" />
          <div className="error-text">手机号格式错误</div>
        </div>
        <div className="error-message" style={{ display: this.state.already }}>
          <img src={iconFall} className="icon-fail" />
          <div className="error-text">验证码已发送</div>
        </div>
        <Form
          name="login-from"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <div className="login-form-input-wrapper">
            <Select defaultValue="+86" bordered={false} className="form-select">
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
        <div className="login-notice">
          若您没有Funlip账号，第一次登录后将自动完成注册
        </div>
      </div>
    );
  }
}
