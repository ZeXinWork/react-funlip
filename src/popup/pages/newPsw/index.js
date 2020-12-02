/* global chrome */
import React, { Component } from "react";
import { Button, Card, Form, Input, Slider, Checkbox } from "antd";
import Arrow from "./icon_arrowright_black@2x.png";
import copyIcon from "./icon_edit_visible.png";
import { handleLocalStorage, addNewInfo } from "../../../api/index";
import radom from "./icon_generate_password.png";

import close from "./close.png";

import "./newPsw.css";
class createNewPsw extends Component {
  state = {
    password: "",
    check: true,
    value: 10,
    ToolTip: 10,
    mustShowUp: true,
    passwordExplain: "hidden",
    titleExplain: "hidden",
    accountExplain: "hidden",
    tipExplain: "hidden",
    websiteExplain: "hidden",
    accountExplainText: "请输入账号！",
    passwordExplainText: "请输入密码！",
    titleExplainText: "请输入标题！",
    onlyOne: true,
  };

  //生成随机密码
  createPassword = (value) => {
    // 生成随机大写
    function getRandomUpper() {
      return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    }

    //生成随机小写
    function getRandomLower() {
      return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }

    // 生成随机数字
    function getRandomNumber() {
      return +String.fromCharCode(Math.floor(Math.random() * 10) + 48);
    }

    // 生成随机符号
    function getRandomSymbol() {
      const symbols = "!@#$%^&*(){}[]=<>/,.";
      return symbols[Math.floor(Math.random() * symbols.length)];
    }
    //创建随机函数对象
    const randomFunc = {
      upper: getRandomUpper,
      number: getRandomNumber,
      symbol: getRandomSymbol,
      lower: getRandomLower,
    };
    //获取对应节点
    const uppercaseEl = document.getElementById("uppercase");
    const numbersEl = document.getElementById("numbers");
    const symbolsEl = document.getElementById("symbols");
    //设置对应配置信息
    const length = value;
    // const hasLower = lowercaseEl.checked;
    let hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;
    let hasLower = true;

    const res = generatePassword(
      hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      length
    );
    //获取密码
    function generatePassword(lower, upper, number, symbol, length) {
      // 1.初始化密码
      let generatedPassword = "";
      // 2.过滤出没有选中的密码类型
      const typesCount = lower + upper + number + symbol;
      const typeArr = [{ lower }, { upper }, { number }, { symbol }].filter(
        (item) => Object.values(item)[0]
      );
      //
      if (typesCount === 0) {
        return "";
      }
      // 3.通过循环获得每个密码并返回给存储密码的变量
      for (let i = 0; i < length; i += typesCount) {
        typeArr.forEach((type) => {
          const funcName = Object.keys(type)[0];
          generatedPassword += randomFunc[funcName]();
        });
      }
      //
      // 4.将处理后的随机密码结果进行保存再返回这个值
      const finalPassword = generatedPassword.slice(0, length);

      return finalPassword;
    }
    return res;
  };

  componentDidMount() {
    //一开始打开就赋值
    let res = this.createPassword(this.state.value);
    this.setState(() => ({
      password: res,
    }));
  }

  render() {
    const pluginID = handleLocalStorage("get", "pluginID");

    //设置密码
    const setValue = (value) => {
      //value即为当前slider的值,setState是异步的，不这样获取不到最新值
      this.setState(
        {
          value,
        },
        () => {
          let res = this.createPassword(this.state.value);
          this.setState(() => ({
            password: res,
          }));
        }
      );
    };

    //返回上一级子页面
    const goBack = () => {
      let isFolderDetail;
      let preList;
      if (this.props.location.state) {
        isFolderDetail = this.props.location.state.isFolderDetail;
        preList = this.props.location.state.preList;
      }
      if (isFolderDetail) {
        if (preList && preList.length > 0) {
          this.props.history.push({
            pathname: "/folderDetail",
            state: { preList: preList },
          });
        } else {
          this.props.history.push({
            pathname: "/folderDetail",
          });
        }
      } else {
        this.props.history.goBack();
      }
    };

    //Form布局
    const layout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 16 },
    };

    //表单验证通过后的回调
    const onFinish = async (values) => {
      if (this.state.onlyOne) {
        this.setState({
          onlyOne: false,
        });
        let { title, password, tip, url, username } = values;

        if (!title) {
          this.setState({
            titleExplain: "visible",
            onlyOne: true,
          });
        }

        if (!password) {
          this.setState({
            passwordExplain: "visible",
            onlyOne: true,
          });
        }
        if (!username) {
          this.setState({
            accountExplain: "visible",
            onlyOne: true,
          });
        }
        if (title) {
          this.setState({
            titleExplain: "hidden",
            onlyOne: true,
          });
        }
        if (password && password.length < 24) {
          this.setState({
            passwordExplain: "hidden",
            onlyOne: true,
          });
        }
        if (username) {
          this.setState({
            accountExplain: "hidden",
            onlyOne: true,
          });
        }
        if (!url) {
          url = "";
        }

        if (
          title &&
          title.length > 0 &&
          password &&
          password.length > 0 &&
          username &&
          username.length > 0
        ) {
          let isFolderDetail;
          let folderId;
          if (this.props.location.state) {
            isFolderDetail = this.props.location.state.isFolderDetail;
            folderId = this.props.location.state.folderId;
          }

          if (isFolderDetail) {
            let passwordItem = {
              title: title,
              pwd: password,
              note: tip,
              website: url,
              account: username,
              pluginId: pluginID,
            };

            const sendMessageToContentBackgroundScript = (mes) => {
              const _this = this;
              mes.requestType = "saveNewPsw";
              mes.isFolderAdd = true;
              chrome.runtime.sendMessage({ mes }, function (res) {
                let response = JSON.parse(res);
                if (response.id) {
                  if (!folderId) {
                    folderId = handleLocalStorage("get", "folderId");
                  }
                  let userInfo = {
                    passwordIds: [response.id],
                    folderId,
                  };
                  const sendMessageToContentBackgroundScript2 = (mes) => {
                    mes.requestType = "addPswToFolder";
                    chrome.runtime.sendMessage({ mes }, function (res) {
                      let responses = JSON.parse(res);
                      if (responses.code == 200) {
                        _this.setState({
                          onlyOne: true,
                        });
                        _this.props.history.push({
                          pathname: "/folderDetail",
                          state: { dataList: response },
                        });
                      }
                    });
                  };
                  sendMessageToContentBackgroundScript2(userInfo);
                }
              });
            };
            sendMessageToContentBackgroundScript(passwordItem);
          } else {
            let passwordItem = {
              title: title,
              pwd: password,
              note: tip,
              website: url,
              account: username,
              pluginId: pluginID,
            };
            const sendMessageToContentBackgroundScript = (mes) => {
              const _this = this;
              mes.requestType = "saveNewPsw";
              chrome.runtime.sendMessage({ mes }, function (res) {
                let response = JSON.parse(res);
                if (response.id) {
                  _this.setState({
                    onlyOne: true,
                  });
                  _this.props.history.push({
                    pathname: "/home/psd",
                  });
                }
              });
            };
            sendMessageToContentBackgroundScript(passwordItem);
          }
        }
      }
    };

    //表单验证失败后的回调
    const onFinishFailed = (errorInfo) => {};

    //显示\隐藏用户设置的密码
    const showPassword = () => {
      let input = document.getElementById("password-input");
      input.type == "password"
        ? (input.type = "text")
        : (input.type = "password");
    };

    //关闭面膜选择器modal
    const closeModal = () => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      Modal.style.display = "none";
    };

    //打开密码选择器modal
    const showModal = () => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      Modal.style.display = "block";
    };

    //设置并关闭密码选择器modal
    const closeSetModal = () => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      let input = document.getElementById("password-input");
      //触发react的event listener 否则无法填充

      var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      ).set;

      nativeInputValueSetter.call(input, this.state.password);

      var ev2 = new Event("input", { bubbles: true });
      input.dispatchEvent(ev2);
      // input.value = this.state.password;
      Modal.style.display = "none";
    };

    return (
      <div className="newPsw-wrappers">
        <Card className="newPsw-card-wrapper" bordered={false}>
          <div>
            <img src={Arrow} className="newPsw-form-title" onClick={goBack} />
            <img
              src={copyIcon}
              className="position-to-input-left cursor"
              onClick={showPassword}
            />
            <img
              src={radom}
              className="position-to-input-right cursor"
              onClick={showModal}
            />
          </div>
          <div className="newPsw-card-content">
            <Form
              {...layout}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              name="createPsw"
            >
              <span className="newPsw-card-inputnewPswText">标题</span>
              <Form.Item label="" name="title">
                <input
                  className="newPsw-card-inputs"
                  bordered={false}
                  maxlength={24}
                  onChange={(e) => {
                    if (e.target.value.length === 24) {
                      alert("进来");
                      let passwordExplain = document.getElementsByClassName(
                        "title-explain"
                      )[0];
                      passwordExplain.className = "title-explain-long";
                      this.setState({
                        titleExplain: "visible",
                        titleExplainText: "标题长度不能大于24位",
                      });
                    } else if (e.target.value.length > 0) {
                      this.setState({
                        titleExplain: "hidden",
                        titleExplainText: "请输入标题！",
                      });
                    } else {
                      let passwordExplain = document.getElementsByClassName(
                        "title-explain-long"
                      )[0];
                      passwordExplain.className = "title-explain";
                      this.setState({
                        titleExplain: "hidden",
                        titleExplainText: "请输入标题！",
                      });
                    }
                  }}
                />
              </Form.Item>
              <div
                className="title-explain"
                style={{ visibility: this.state.titleExplain }}
              >
                {this.state.titleExplainText}
              </div>
              <span className="newPsw-card-inputnewPswText">账号</span>

              <Form.Item label="" name="username">
                <input
                  className="newPsw-card-inputs"
                  bordered={false}
                  maxlength={64}
                  onChange={(e) => {
                    if (e.target.value.length === 64) {
                      let passwordExplain = document.getElementsByClassName(
                        "account-explain"
                      )[0];
                      passwordExplain.className = "account-explain-long";
                      this.setState({
                        accountExplain: "visible",
                        accountExplainText: "账号长度不能大于64位",
                      });
                    } else if (e.target.value.length > 0) {
                      this.setState({
                        accountExplain: "hidden",
                        accountExplainText: "请输入账号！",
                      });
                    } else {
                      let passwordExplain = document.getElementsByClassName(
                        "account-explain-long"
                      )[0];
                      passwordExplain.className = "account-explain";
                      this.setState({
                        accountExplain: "hidden",
                        accountExplainText: "请输入账号！",
                      });
                    }
                  }}
                />
              </Form.Item>
              <div
                className="account-explain"
                style={{ visibility: this.state.accountExplain }}
              >
                {this.state.accountExplainText}
              </div>
              <span className="newPsw-card-inputnewPswText">密码</span>
              <Form.Item label="" name="password">
                <input
                  className="newPsw-card-inputs "
                  id="password-input"
                  maxlength={24}
                  type="password"
                  onChange={(e) => {
                    if (e.target.value.length === 24) {
                      let passwordExplain = document.getElementsByClassName(
                        "password-explain"
                      )[0];
                      passwordExplain.className = "password-explain-long";
                      this.setState({
                        passwordExplain: "visible",
                        passwordExplainText: "密码长度不能大于24位",
                      });
                    } else if (e.target.value.length > 0) {
                      this.setState({
                        passwordExplain: "hidden",
                        passwordExplainText: "请输入密码！",
                      });
                    } else {
                      let passwordExplain = document.getElementsByClassName(
                        "password-explain-long"
                      )[0];
                      passwordExplain.className = "password-explain";
                      this.setState({
                        passwordExplain: "hidden",
                        passwordExplainText: "请输入密码！",
                      });
                    }
                  }}
                />
              </Form.Item>
              <div
                className="password-explain"
                style={{ visibility: this.state.passwordExplain }}
              >
                {this.state.passwordExplainText}
              </div>
              <span className="newPsw-card-inputnewPswText">网址</span>
              <Form.Item label="" name="url">
                <input
                  className="newPsw-card-inputs"
                  bordered={false}
                  maxlength={255}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length == 255) {
                      this.setState({
                        websiteExplain: "visible",
                      });
                    } else {
                      this.setState({
                        websiteExplain: "hidden",
                      });
                    }
                  }}
                />
              </Form.Item>
              <div
                className="password-explains"
                style={{ visibility: this.state.websiteExplain }}
              >
                网址不能超过255位
              </div>
              <span className="newPsw-card-inputnewPswText">备注</span>
              <Form.Item label="" name="tip">
                <textarea
                  maxlength={100}
                  className="newPsw-card-inputTextAreas"
                  onChange={(e) => {
                    if (e.target.value.length === 100) {
                      this.setState({
                        tipExplain: "visible",
                      });
                    } else {
                      this.setState({
                        tipExplain: "hidden",
                      });
                    }
                  }}
                />
              </Form.Item>
              <div
                className="tip-explain"
                style={{ visibility: this.state.tipExplain }}
              >
                备注的文字长度不能超过100位！
              </div>
              <Form.Item>
                <Button
                  htmlType="submit"
                  className="newPsw-form-btns "
                  shape="round"
                >
                  保存
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>
        <div className="password-modal">
          <div className="password-title-icon">
            <img src={close} onClick={closeModal} />
          </div>
          <div className="password-title">
            <span className="password-title-info">密码生成器</span>
          </div>
          <div className="password-body">
            <div className="password-body-num">
              <p className="password-body-num-text"> {this.state.password}</p>
            </div>
            <div className="password-slider-wrapper">
              <span>{this.state.ToolTip}</span>
              <Slider
                max={24}
                min={0}
                className="password-slider"
                defaultValue={10}
                onChange={(ToolTip) => {
                  this.setState(
                    {
                      ToolTip,
                    },
                    () => {
                      setValue(ToolTip);
                    }
                  );
                }}
              />
              <span>24</span>
            </div>
            <div className="password-body-select">
              <div>
                <span className="password-select-info">大写</span>
                <Checkbox
                  className="c-ml set-b"
                  id="uppercase"
                  checked={this.state.mustShowUp}
                  defaultChecked={this.state.check}
                  onChange={() => {
                    if (this.state.mustShowUp) {
                      this.setState({
                        mustShowUp: false,
                      });
                    } else {
                      this.setState({
                        mustShowUp: true,
                      });
                    }
                    setValue(this.state.value);
                  }}
                />
              </div>
              <div>
                <span className="password-select-info ml">数字</span>
                <Checkbox
                  className="mr c-ml set-b"
                  defaultChecked={this.state.check}
                  id="numbers"
                  onChange={() => {
                    setValue(this.state.value);
                  }}
                />
              </div>
              <div>
                <span className="password-select-info">符号</span>
                <Checkbox
                  className="c-ml set-b"
                  id="symbols"
                  defaultChecked={this.state.check}
                  onChange={() => {
                    setValue(this.state.value);
                  }}
                />
              </div>
            </div>
            <div className="password-btn-group">
              <div className="main ml-20" onClick={closeModal}>
                <div className="btn-1 ">
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div className="btn-layout mr-20 set-bg " onClick={closeSetModal}>
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default createNewPsw;
