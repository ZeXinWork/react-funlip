/* global chrome */

import React, { Component } from "react";
import arrowLeft from "./icon_arrowright_black@2x.png";
import { Button, Card, Form, Input } from "antd";
import iconFall from "./icon_fail@2x.png";
import "./forgot.css";
export default class Forgot extends Component {
  state = {
    FormatShow: "none",
    already: "none",
  };
  render() {
    const goBack = () => {
      this.props.history.push("./login");
    };
    const layout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 16 },
    };
    const onFinishFailed = () => {
      setShow();
    };
    const onFinish = (value) => {
      const { tele } = value;
      const userInfo = {
        areaCode: "+86",
        phone: tele,
        type: "FORGOT_PASSWORD",
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
      sendMessageToContentBackgroundScript({});
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
      <div>
        <div
          className="error-message"
          style={{ display: this.state.FormatShow }}
        >
          <img src={iconFall} className="icon-fail" />
          <div className="error-text">手机号格式错误</div>
        </div>
        <Card className="forgot-card-wrapper" bordered={false}>
          <div>
            <img
              className="forgot-form-title"
              onClick={goBack}
              src={arrowLeft}
            />
          </div>
          <div className="forgot-card-content">
            <div className="forgot-card-forgotText">忘记密码</div>
            <div className="forgot-card-inputForgotText">请输入手机号</div>
            <Form
              {...layout}
              onFinishFailed={onFinishFailed}
              onFinish={onFinish}
            >
              <div className="login-form-input-wrapper">
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
                  <input className="forgot-card-input" />
                </Form.Item>
              </div>
              <Form.Item label="">
                <Button
                  htmlType="submit"
                  className="forgot-form-btn"
                  shape="round"
                  // onClick={() => {
                  //   this.props.history.push({
                  //     pathname: "/setMP",
                  //     state: { id: "reset" },
                  //   });
                  // }}
                >
                  获取验证码
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
      </div>
    );
  }
}
