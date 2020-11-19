/* global chrome */
import React, { Component } from "react";
import { handleLocalStorage, getCaptcha } from "../../../api";
import { Form, Input, Button } from "antd";
import "./resetPassword.css";
import arrowLeft from "./icon_arrowright_black@2x.png";
import iconFall from "./icon_fail@2x.png";
export default class MyAbout extends Component {
  state = {
    FormatShow: "none",
  };
  render() {
    const goBack = () => {
      this.props.history.goBack();
    };
    const onFinish = (values) => {
      const { phoneNumber } = values;
      const myReg = /^1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[235-8]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|66\d{2})\d{6}$/;
      if (!myReg.test(phoneNumber)) {
        setShow();
      } else {
        const userInfo = {
          areaCode: "+86",
          phone: phoneNumber,
          type: "LOGIN",
        };
        const sendMessageToContentBackgroundScript = (mes) => {
          const _this = this;
          mes.requestType = "getNumbers";
          mes.NumberType = "FORGOT_PASSWORD";
          chrome.runtime.sendMessage({ mes }, function (res) {
            res = JSON.parse(res);
            if (res.code === 200) {
              const { verificationCode } = res.data;
              _this.props.history.push({
                pathname: "/pswNum",
                state: {
                  tele: phoneNumber,
                  number: verificationCode,
                  resetMainPsw: true,
                },
              });
            } else {
              alert(res.msg);
            }
          });
        };
        sendMessageToContentBackgroundScript(userInfo);
      }
    };
    const onFinishFailed = (error) => {
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
      <div className="home-reset-wrapper">
        <div
          className="error-message"
          style={{ display: this.state.FormatShow }}
        >
          <img src={iconFall} className="icon-fail" />
          <div className="error-text">手机号格式错误</div>
        </div>
        <div className="home-reset-title">
          <img
            src={arrowLeft}
            onClick={goBack}
            className="home-reset-title-icon"
          />
        </div>
        <div className="home-reset-title-text">重置密码</div>
        <div className="home-reset-old">请输入手机号:</div>
        <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
          <Form.Item label="" name="phoneNumber">
            <input className="form-input" />
          </Form.Item>
          <Form.Item>
            <button className="form-save-wrappers" shape="round" type="submit">
              获取验证码
            </button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
