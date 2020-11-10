/* global chrome */

import React, { Component } from "react";
import { Input, Button, Form } from "antd";
import { handleLocalStorage } from "../../../api/index";
import iconArrow from "./icon_arrowright_black@3x.png";
import axios from "axios";

import "./setMainPsw.css";
export default class setMP extends Component {
  render() {
    const goLogin = () => {
      this.props.history.goBack();
    };
    const { id, verificationMainCode } = this.props.location.state;

    //表单验证通过后的回调
    const onFinish = (values) => {
      const _this = this;
      let password = { mainPass: values.password };
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "saveMainPassword";
        mes.password = password;
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          if (res.code === 200) {
            handleLocalStorage("remove", "isSetMainPsw");
            _this.props.history.push("/home/psd");
          } else {
            alert(res.msg);
          }
        });
      };
      sendMessageToContentBackgroundScript({});
    };
    //重置主密码的验证接口
    const setMainPsw = () => {
      const _this = this;
      let oldPsw = document.getElementById("oldPsw").value;
      let newPsw = document.getElementById("newPassword").value;
      let conFirmPsw = document.getElementById("conFirmPsw").value;
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "verifyPassword";
        mes.mainPass = oldPsw;
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          if (res.code === 200) {
            const phone = handleLocalStorage("get", "phone");
            let oldMainPass = oldPsw;
            let newMainPass = newPsw;
            let userInfo = {
              verificationCode: verificationMainCode,
              phone,
              oldMainPass,
              newMainPass,
            };
            const sendMessageToContentBackgroundScript2 = (mes) => {
              mes.requestType = "resetMainPsw";
              mes.userInfo = userInfo;
              chrome.runtime.sendMessage({ mes }, function (response) {
                let res = JSON.parse(response);
                if (res.code === 200) {
                  alert("重置主密码成功");
                  _this.props.history.push("/home/psd");
                } else {
                  alert(res.msg);
                }
              });
            };
            sendMessageToContentBackgroundScript2({});
          } else if (res.code === 707) {
            alert(res.msg);
          } else {
            alert(res.msg);
          }
        });
      };
      sendMessageToContentBackgroundScript({});
    };
    return id === "set" ? (
      <div className="set-wrapper">
        <img
          src={iconArrow}
          alt="iconArrow"
          className="setMain-icon"
          onClick={goLogin}
        />
        <div className="set-header">设置主密码</div>
        <Form name="setMainPassword" onFinish={onFinish} className="from">
          <div className="form-text">请输入主密码</div>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入你的主密码！" }]}
          >
            <input className="set-body-input" />
          </Form.Item>
          <div className="form-text">请再次输入主密码</div>
          <Form.Item
            name="ConfirmPsw"
            rules={[
              {
                required: true,
                message: "请再次确认你的密码!",
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("两次输入的密码不一致!");
                },
              }),
            ]}
          >
            <input className="set-body-input" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="from-btn">
              下一步
            </Button>
          </Form.Item>
        </Form>
      </div>
    ) : (
      <div className="reset-wrapper">
        <img
          src={iconArrow}
          alt="iconArrow"
          className="resetMain-icon"
          onClick={goLogin}
        />
        <div className="set-header">重置密码</div>{" "}
        <Form layout="vertical" className="from">
          <Form.Item
            name="oldPsw"
            label="原主密码"
            style={{ marginLeft: "30px" }}
          >
            <Input
              className="set-body-input"
              id="oldPsw"
              bordered={false}
              style={{ caretColor: "#5272eb", marginRight: "10px" }}
            />
          </Form.Item>
          <Form.Item
            label="新主密码"
            name="newPassword"
            style={{ marginLeft: "30px" }}
          >
            <Input
              className="set-body-input"
              id="newPassword"
              bordered={false}
              style={{ caretColor: "#5272eb", marginRight: "10px" }}
            />
          </Form.Item>

          <Form.Item
            name="conFirmPsw"
            label="确认新主密码"
            style={{ marginLeft: "30px" }}
          >
            <Input
              className="set-body-input"
              bordered={false}
              id="conFirmPsw"
              style={{ caretColor: "#5272eb", marginRight: "10px" }}
            />
          </Form.Item>
          <Form.Item>
            <Button className="from-btn" shape="round" onClick={setMainPsw}>
              确定
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
