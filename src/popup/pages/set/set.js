/*global chrome*/

import React, { Component } from "react";
import "./set.css";
import { handleLocalStorage } from "../../../api/index";

import * as actionCreator from "../../store/actionCreator";
import { connect } from "react-redux";
import { Switch } from "antd";
import arrowLeft from "./icon_arrowright_black@2x.png";
import arrowRight from "./icon_arrowright(1).png";
class MySet extends Component {
  state = {
    option1: true,
    option2: true,
    option3: true,
    option4: true,
    option5: true,
    option6: true,
    autofill: true,
    autostore: true,
  };
  componentDidMount() {
    const autoFill = handleLocalStorage("get", "autoFill");
    const autoStore = handleLocalStorage("get", "autoStore");
    // alert(autofill);
    if (autoFill == 1) {
      this.setState({
        autofill: true,
      });
    } else {
      this.setState({
        autofill: false,
      });
    }
    if (autoStore == 1) {
      this.setState({
        autostore: true,
      });
    } else {
      this.setState({
        autostore: false,
      });
    }
  }
  render() {
    const { time, show } = this.props;
    const onChange = (config) => {
      let { autofill, autostore } = this.state;
      const sendMessageToContentBackgroundScript = (mes) => {
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          if (res.code == 200) {
            const autoFill = handleLocalStorage("get", "autoFill");
            autoFill == 1
              ? handleLocalStorage("set", "autoFill", 0)
              : handleLocalStorage("set", "autoFill", 1);
          } else {
            alert(response.msg);
          }
        });
      };
      const sendMessageToContentBackgroundScript2 = (mes) => {
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);
          if (res.code == 200) {
            const autoStore = handleLocalStorage("get", "autoStore");
            autoStore == 1
              ? handleLocalStorage("set", "autoStore", 0)
              : handleLocalStorage("set", "autoStore", 1);
          } else {
            alert(response.msg);
          }
        });
      };

      //设置是否自动填充
      if (config == "autofill") {
        autofill
          ? this.setState({ autofill: false }, () => {
              const configAutofill = {
                requestType: "setAutoFill",
                config: "close",
              };
              sendMessageToContentBackgroundScript(configAutofill);
            })
          : this.setState({ autofill: true }, () => {
              const configAutofill = {
                requestType: "setAutoFill",
                config: "open",
              };
              sendMessageToContentBackgroundScript(configAutofill);
            });
      }

      //设置是否自动保存密码
      else if (config == "autostore") {
        autostore
          ? this.setState({ autostore: false }, () => {
              const configAutofill = {
                requestType: "setAutoStore",
                config: "close",
              };
              sendMessageToContentBackgroundScript2(configAutofill);
            })
          : this.setState({ autostore: true }, () => {
              const configAutofill = {
                requestType: "setAutoStore",
                config: "open",
              };
              sendMessageToContentBackgroundScript2(configAutofill);
            });
      }
    }; //开关转换的回调
    const reset = () => {
      this.props.history.push("/reset");
    };
    const goBack = () => {
      this.props.history.push("./home/account");
    };
    const { setLockTime, setShow } = this.props;
    const setTime = (options) => {
      const { time, num } = options;
      setLockTime(time);
      setShow();
      setColor(num);
      this.props.history.push("/Myset");
    };

    //设置选中之后的颜色值
    const setColor = (num) => {
      console.log(num);

      if (num === 0) {
        this.setState(
          {
            option1: !this.state.option1,
            option2: true,
            option3: true,
            option4: true,
            option5: true,
            option6: true,
          },
          () => {
            if (
              this.state.option1 &&
              this.state.option2 &&
              this.state.option3 &&
              this.state.option4 &&
              this.state.option5 &&
              this.state.option6
            ) {
              this.setState({
                option1: false,
              });
            }
          }
        );
      }
      if (num === 1) {
        this.setState(
          {
            option2: !this.state.option2,
            option1: true,
            option3: true,
            option4: true,
            option5: true,
            option6: true,
          },
          () => {
            if (
              this.state.option1 &&
              this.state.option2 &&
              this.state.option3 &&
              this.state.option4 &&
              this.state.option5 &&
              this.state.option6
            ) {
              this.setState({
                option2: false,
              });
            }
          }
        );
      }
      if (num === 2) {
        this.setState(
          {
            option3: !this.state.option3,
            option1: true,
            option2: true,
            option4: true,
            option5: true,
            option6: true,
          },
          () => {
            if (
              this.state.option1 &&
              this.state.option2 &&
              this.state.option3 &&
              this.state.option4 &&
              this.state.option5 &&
              this.state.option6
            ) {
              this.setState({
                option3: false,
              });
            }
          }
        );
      }
      if (num === 3) {
        this.setState(
          {
            option4: !this.state.option4,
            option1: true,
            option3: true,
            option2: true,
            option5: true,
            option6: true,
          },
          () => {
            if (
              this.state.option1 &&
              this.state.option2 &&
              this.state.option3 &&
              this.state.option4 &&
              this.state.option5 &&
              this.state.option6
            ) {
              this.setState({
                option4: false,
              });
            }
          }
        );
      }
      if (num === 4) {
        this.setState(
          {
            option5: !this.state.option5,
            option1: true,
            option3: true,
            option4: true,
            option2: true,
            option6: true,
          },
          () => {
            if (
              this.state.option1 &&
              this.state.option2 &&
              this.state.option3 &&
              this.state.option4 &&
              this.state.option5 &&
              this.state.option6
            ) {
              this.setState({
                option5: false,
              });
            }
          }
        );
      }
      if (num === 5) {
        this.setState(
          {
            option6: !this.state.option6,
            option1: true,
            option3: true,
            option4: true,
            option5: true,
            option2: true,
          },
          () => {
            if (
              this.state.option1 &&
              this.state.option2 &&
              this.state.option3 &&
              this.state.option4 &&
              this.state.option5 &&
              this.state.option6
            ) {
              this.setState({
                option6: false,
              });
            }
          }
        );
      }
    };

    return (
      <div className="myset-wrapper">
        <img src={arrowLeft} className="mySet-form-title" onClick={goBack} />
        <div>
          <div className="myset-body-wrapper">
            <div className="auto-complete autofloat mr-6">
              <span className="auto-text ">自动填充密码</span>
              <span>
                <Switch
                  checked={this.state.autofill}
                  onChange={() => onChange("autofill")}
                  className="mr-16"
                />
              </span>
            </div>
            <div className="auto-save autofloat mr-6">
              <span className="auto-text ">自动保存密码</span>
              <span>
                <Switch
                  checked={this.state.autostore}
                  onChange={() => {
                    onChange("autostore");
                  }}
                  className="mr-16"
                />
              </span>
            </div>
            <div className="auto-login autofloat mr-6">
              <span className="auto-text ">自动登录</span>
              <span>
                <Switch defaultChecked onChange={onChange} className="mr-16" />
              </span>
            </div>
            <div className="auto-lock drop-float mr-6">
              <span
                className="auto-text "
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShow();
                }}
              >
                自动锁定
              </span>
              <div
                onClick={() => {
                  setShow();
                }}
              >
                <img
                  src={arrowRight}
                  className="ant-dropdown-link"
                  onClick={(e) => e.preventDefault()}
                />
              </div>
            </div>
            <div className="reset-password autofloat mr-6">
              <span className="reset-text auto-text" onClick={reset}>
                重置主密码
              </span>
              <span>
                <img src={arrowRight} className="reset-icon" onClick={reset} />
              </span>
            </div>
            <div className="skip-management autofloat mr-6">
              <span className="skip-text auto-text">跳过保存网站管理</span>
              <span>
                <img
                  src={arrowRight}
                  className="reset-icon"
                  onClick={(e) => e.preventDefault()}
                />
              </span>
            </div>
          </div>
        </div>
        {show ? (
          <div className="auto-lock-wrappers">
            <div className="auto-lock-container">
              <div
                className="mb-24 mt-5 "
                onClick={() => {
                  setTime({
                    time: "立即锁定",
                    num: 0,
                  });
                }}
              >
                <span
                  className={
                    this.state.option1
                      ? "auto-lock-text"
                      : "auto-lock-text-bold"
                  }
                >
                  立即锁定
                </span>
              </div>
              <div className="mb-24 ">
                <span
                  className={
                    this.state.option2
                      ? "auto-lock-text"
                      : "auto-lock-text-bold"
                  }
                  onClick={() => {
                    setTime({
                      time: "1分钟",
                      num: 1,
                    });
                  }}
                >
                  1分钟
                </span>
              </div>
              <div className="mb-24 ">
                <span
                  className={
                    this.state.option3
                      ? "auto-lock-text"
                      : "auto-lock-text-bold"
                  }
                  onClick={() => {
                    setTime({
                      time: "10分钟",
                      num: 2,
                    });
                  }}
                >
                  10分钟
                </span>
              </div>
              <div className="mb-24 ">
                <span
                  className={
                    this.state.option4
                      ? "auto-lock-text"
                      : "auto-lock-text-bold"
                  }
                  onClick={() => {
                    setTime({
                      time: "30分钟",
                      num: 3,
                    });
                  }}
                >
                  {" "}
                  30分钟
                </span>
              </div>
              <div className="mb-24 ">
                <span
                  className={
                    this.state.option5
                      ? "auto-lock-text"
                      : "auto-lock-text-bold"
                  }
                  onClick={() => {
                    setTime({
                      time: "4小时",
                      num: 4,
                    });
                  }}
                >
                  4小时
                </span>
              </div>
              <div className="mb-24 " style={{ width: 100 }}>
                <span
                  className={
                    this.state.option6
                      ? "auto-lock-text"
                      : "auto-lock-text-bold"
                  }
                  onClick={() => {
                    setTime({
                      time: "从不锁定",
                      num: 5,
                    });
                  }}
                >
                  {" "}
                  从不锁定
                </span>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    time: state.time,
    show: state.show,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    setLockTime(time) {
      const action = actionCreator.setLockTimes(time);
      dispatch(action);
    },
    setShow() {
      const action = actionCreator.setShow();
      dispatch(action);
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(MySet);
