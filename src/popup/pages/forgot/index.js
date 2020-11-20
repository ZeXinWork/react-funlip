/* global chrome */

import React, { Component } from "react";
import arrowLeft from "./icon_arrowright_black@2x.png";
import { Button, Card, Form, Input } from "antd";
import iconFall from "./icon_fail@2x.png";
import iconArrow from "./icon_arrowright_black@3x.png";
import successSet from "./icon_smile.png";
import iconWarning from "./icon_warning.png";
import "./forgot.css";
import { handleLocalStorage } from "../../../api";
export default class Forgot extends Component {
  state = {
    FormatShow: "none",
    already: "none",
    warnIng: "none",
    sixLength: "none",
    mainPswErr: "none",
  };
  render() {
    let id;
    let phone;
    let forgotNumber;
    if (this.props.location.state) {
      id = this.props.location.state.id;
      phone = this.props.location.state.phone;
      forgotNumber = this.props.location.state.forgotNumber;
    }

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
              state: {
                tele: tele,
                number: verificationCode,
                isForgotPsw: true,
                forgotNumber: verificationCode,
              },
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

    const setMainPsw = () => {
      const _this = this;
      let newPsw = document.getElementById("newPassword").value;
      let conFirmPsw = document.getElementById("conFirmPsw").value;
      if (newPsw.length != 6) {
        this.setState(
          {
            sixLength: "block",
          },
          () => {
            setTimeout(() => {
              _this.setState({
                sixLength: "none",
              });
            }, 1000);
          }
        );
      } else if (conFirmPsw != newPsw) {
        this.setState(
          {
            warnIng: "block",
          },
          () => {
            setTimeout(() => {
              _this.setState({
                warnIng: "none",
              });
            }, 1000);
          }
        );
      } else {
        function sendMessageToContentScript2(mes) {
          const verificationCode = handleLocalStorage(
            "get",
            "verificationCode"
          );

          mes = {
            requestType: "forgotPsw",
            newMainPass: newPsw,
            phone: phone,
            verificationCode: forgotNumber,
          };
          chrome.runtime.sendMessage({ mes }, function (response) {
            let res = JSON.parse(response);
            if (res.code == 200) {
              _this.setState(
                {
                  FormatShow: "block",
                },
                () => {
                  setTimeout(() => {
                    _this.setState(
                      {
                        FormatShow: "none",
                      },
                      () => {
                        _this.props.history.push("/autoLock");
                      }
                    );
                  }, 500);
                }
              );
            } else {
              alert(res.msg);
            }
          });
        }
        sendMessageToContentScript2({});
      }
    };
    return (
      <div>
        {id ? (
          <div className="reset-wrapper">
            <div
              className="smile-message"
              style={{ display: this.state.FormatShow }}
            >
              <img src={successSet} className="icon-fail" />
              <div className="smile-text">重置主密码成功</div>
            </div>
            <div
              className="smile-message"
              style={{ display: this.state.warnIng }}
            >
              <img src={iconWarning} className="icon-fail" />
              <div className="smile-text">两次设置的密码不一致！</div>
            </div>
            <div
              className="smile-message"
              style={{ display: this.state.sixLength }}
            >
              <img src={iconWarning} className="icon-fail" />
              <div className="smile-text">主密码长度必须为6位！</div>
            </div>
            <div
              className="smile-message"
              style={{ display: this.state.mainPswErr }}
            >
              <img src={iconWarning} className="icon-fail" />
              <div className="smile-text">原主密码错误！</div>
            </div>
            <img
              src={iconArrow}
              alt="iconArrow"
              className="resetMain-icon"
              // onClick={goLogin}
            />
            <div className="set-header">重置密码</div>{" "}
            <Form layout="vertical" className="from">
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
        ) : (
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
        )}
      </div>
    );
  }
}
