/* global chrome */
import React, { Component } from "react";
import { handleLocalStorage, getCaptcha } from "../../../api";
import { Form, Input, Button } from "antd";
import "./resetPassword.css";
import arrowLeft from "./icon_arrowright_black@2x.png";
import btn from "./btn_bg@2x.png";
export default class MyAbout extends Component {
  render() {
    const goBack = () => {
      this.props.history.goBack();
    };
    const onFinish = (values) => {
      const { phoneNumber } = values;
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
    };
    return (
      <div className="home-reset-wrapper">
        <div className="home-reset-title">
          <img
            src={arrowLeft}
            onClick={goBack}
            className="home-reset-title-icon"
          />
        </div>
        <div className="home-reset-title-text">重置密码</div>
        <div className="home-reset-old">请输入手机号:</div>
        <Form onFinish={onFinish}>
          <Form.Item name="phoneNumber">
            <Input bordered={false} className="form-input" />
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
