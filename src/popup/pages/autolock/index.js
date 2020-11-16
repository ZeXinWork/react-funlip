/*global chrome*/
import React, { Component } from "react";
import { Button, Input } from "antd";
import { handleLocalStorage } from "../../../api";
import background from "./background.png";
import logo from "./logo.png";
import "./autolock.css";
import iconFail from "./icon_fail@2x.png";
export default class AutoLock extends Component {
  state = {
    input1: "",
    input2: "",
    input3: "",
    input4: "",
    input5: "",
    input6: "",
    input7: "",
    show: "none",
  };
  componentDidMount() {
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
          if (k == 8) {
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
  }
  render() {
    const _this = this;
    const goForgot = () => {
      this.props.history.push({
        pathname: "/setMP",
        state: { id: "reset" },
      });
    };
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
            if (input1 && input2 && input3 && input4 && input5 && input6) {
              function sendMessageToContentScript(mes) {
                mes.requestType = "verifyPassword";
                mes.mainPass = value;
                chrome.runtime.sendMessage({ mes }, function (response) {
                  let res = JSON.parse(response);
                  console.log(res);
                  if (res.code == 200) {
                    _this.props.history.push("/home/psd");
                    handleLocalStorage("remove", "autoLock");
                  } else {
                    _this.setState(
                      {
                        show: "block",
                      },
                      () => {
                        let mid = setTimeout(() => {
                          _this.setState(
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
                });
              }
              sendMessageToContentScript({});
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
            if (input1 && input2 && input3 && input4 && input5 && input6) {
              function sendMessageToContentScript(mes) {
                mes.requestType = "verifyPassword";
                mes.mainPass = value;
                chrome.runtime.sendMessage({ mes }, function (response) {
                  let res = JSON.parse(response);
                  console.log(res);
                  if (res.code == 200) {
                    _this.props.history.push("/home/psd");
                    handleLocalStorage("remove", "autoLock");
                  } else {
                    _this.setState(
                      {
                        show: "block",
                      },
                      () => {
                        let mid = setTimeout(() => {
                          _this.setState(
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
                });
              }
              sendMessageToContentScript({});
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
            if (input1 && input2 && input3 && input4 && input5 && input6) {
              function sendMessageToContentScript(mes) {
                mes.requestType = "verifyPassword";
                mes.mainPass = value;
                chrome.runtime.sendMessage({ mes }, function (response) {
                  let res = JSON.parse(response);
                  console.log(res);
                  if (res.code == 200) {
                    _this.props.history.push("/home/psd");
                    handleLocalStorage("remove", "autoLock");
                  } else {
                    _this.setState(
                      {
                        show: "block",
                      },
                      () => {
                        let mid = setTimeout(() => {
                          _this.setState(
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
                });
              }
              sendMessageToContentScript({});
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
            if (input1 && input2 && input3 && input4 && input5 && input6) {
              function sendMessageToContentScript(mes) {
                mes.requestType = "verifyPassword";
                mes.mainPass = value;
                chrome.runtime.sendMessage({ mes }, function (response) {
                  let res = JSON.parse(response);
                  console.log(res);
                  if (res.code == 200) {
                    _this.props.history.push("/home/psd");
                    handleLocalStorage("remove", "autoLock");
                  } else {
                    _this.setState(
                      {
                        show: "block",
                      },
                      () => {
                        let mid = setTimeout(() => {
                          _this.setState(
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
                });
              }
              sendMessageToContentScript({});
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
            if (input1 && input2 && input3 && input4 && input5 && input6) {
              function sendMessageToContentScript(mes) {
                mes.requestType = "verifyPassword";
                mes.mainPass = value;
                chrome.runtime.sendMessage({ mes }, function (response) {
                  let res = JSON.parse(response);
                  console.log(res);
                  if (res.code == 200) {
                    _this.props.history.push("/home/psd");
                    handleLocalStorage("remove", "autoLock");
                  } else {
                    _this.setState(
                      {
                        show: "block",
                      },
                      () => {
                        let mid = setTimeout(() => {
                          _this.setState(
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
                });
              }
              sendMessageToContentScript({});
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
            if (input1 && input2 && input3 && input4 && input5 && input6) {
              function sendMessageToContentScript(mes) {
                mes.requestType = "verifyPassword";
                mes.mainPass = value;
                chrome.runtime.sendMessage({ mes }, function (response) {
                  let res = JSON.parse(response);
                  console.log(res);
                  if (res.code == 200) {
                    _this.props.history.push("/home/psd");
                    handleLocalStorage("remove", "autoLock");
                  } else {
                    _this.setState(
                      {
                        show: "block",
                      },
                      () => {
                        let mid = setTimeout(() => {
                          _this.setState(
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
                });
              }
              sendMessageToContentScript({});
            }
          }
        );
      }
    };
    return (
      <div className="auto-lock-wrapper">
        <div className="error-message" style={{ display: this.state.show }}>
          <img src={iconFail} className="icon-fail" />
          <div className="error-text">主密码错误</div>
        </div>
        <div className="auto-lock-logo-wrapper">
          <img
            src={background}
            alt="logo-background"
            className="auto-lock-background"
          />
          <img src={logo} alt="logo" className="auto-lock-logo" />
        </div>
        <div className="auto-lock-body-wrapper">
          <span className="auto-lock-body-text">请输入主密码</span>
          <div className="auto-lock-body-input">
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
        <div className="auto-lock-btn-wrapper">
          <Button className="auto-lock-btn" onClick={goForgot}>
            忘记密码？
          </Button>
        </div>
      </div>
    );
  }
}
