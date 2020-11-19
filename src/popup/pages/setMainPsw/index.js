/* global chrome */

import React, { Component } from "react";
import { Input, Button, Form } from "antd";
import { handleLocalStorage } from "../../../api/index";
import iconArrow from "./icon_arrowright_black@3x.png";
import successSet from "./icon_smile.png";
import iconWarning from "./icon_warning.png";
import "./setMainPsw.css";
export default class setMP extends Component {
  state = {
    FormatShow: "none",
    warnIng: "none",
    sixLength: "none",
    mainPswErr: "none",
  };
  render() {
    const goLogin = () => {
      this.props.history.goBack();
    };
    const { id, verificationMainCode, tele } = this.props.location.state;

    //表单验证通过后的回调
    const onFinish = (values) => {
      const _this = this;
      console.log(values);
      const { setPassword, ConfirmPsw } = values;
      if (setPassword.length != 6) {
        alert("主密码长度必须为6位");
      } else if (setPassword != ConfirmPsw) {
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
        const _this = this;
        let password = { mainPass: setPassword };
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
      }
    };
    //重置主密码的验证接口
    const setMainPsw = () => {
      const _this = this;
      let oldPsw = document.getElementById("oldPsw").value;
      let newPsw = document.getElementById("newPassword").value;
      let conFirmPsw = document.getElementById("conFirmPsw").value;
      if (oldPsw.length != 6) {
        this.setState(
          {
            mainPswErr: "block",
          },
          () => {
            setTimeout(() => {
              _this.setState({
                mainPswErr: "none",
              });
            }, 1000);
          }
        );
      } else if (newPsw.length != 6) {
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
        const sendMessageToContentBackgroundScript = (mes) => {
          mes.requestType = "verifyPassword";
          mes.mainPass = oldPsw;
          chrome.runtime.sendMessage({ mes }, function (response) {
            let res = JSON.parse(response);
            if (res.code === 200) {
              //修改 扫码登录就没有本地手机号了
              const phone = tele;
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
                              _this.props.history.push("/mySet");
                            }
                          );
                        }, 500);
                      }
                    );
                  }
                });
              };
              sendMessageToContentBackgroundScript2({});
            } else if (res.code === 707) {
              _this.setState(
                {
                  mainPswErr: "block",
                },
                () => {
                  setTimeout(() => {
                    _this.setState({
                      mainPswErr: "none",
                    });
                  }, 1000);
                }
              );
            } else {
              alert(res.msg);
            }
          });
        };
        sendMessageToContentBackgroundScript({});
      }
    };
    return id === "set" ? (
      <div className="set-wrapper">
        <div className="smile-message" style={{ display: this.state.warnIng }}>
          <img src={iconWarning} className="icon-fail" />
          <div className="smile-text">两次设置的密码不一致！</div>
        </div>
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
            name="setPassword"
            rules={[{ required: true, message: "请输入你的主密码！" }]}
          >
            <input className="set-body-input" />
          </Form.Item>
          <div className="form-text">请再次输入主密码</div>

          <Form.Item name="ConfirmPsw">
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
        <div
          className="smile-message"
          style={{ display: this.state.FormatShow }}
        >
          <img src={successSet} className="icon-fail" />
          <div className="smile-text">重置主密码成功</div>
        </div>
        <div className="smile-message" style={{ display: this.state.warnIng }}>
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
