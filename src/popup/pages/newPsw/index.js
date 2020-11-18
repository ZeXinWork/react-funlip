/* global chrome */
import React, { Component } from "react";
import { Button, Card, Form, Input, Slider, Checkbox } from "antd";
import Arrow from "./icon_arrowright_black@2x.png";
import copyIcon from "./icon_edit_visible.png";
import { handleLocalStorage, addNewInfo } from "../../../api/index";
import radom from "./icon_generate_password.png";

import close from "./close.png";
import * as actionCreator from "../../store/actionCreator";
import { connect } from "react-redux";
import "./newPsw.css";
class createNewPsw extends Component {
  state = {
    password: "",
    check: true,
    value: 10,
    ToolTip: 10,
  };

  //生成随机密码
  createPassword = (value) => {
    // 生成随机大写
    function getRandomUpper() {
      return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
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
    };
    //获取对应节点
    const uppercaseEl = document.getElementById("uppercase");
    const numbersEl = document.getElementById("numbers");
    const symbolsEl = document.getElementById("symbols");
    //设置对应配置信息
    const length = value;
    // const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;
    const res = generatePassword(
      // hasLower,
      hasUpper,
      hasNumber,
      hasSymbol,
      length
    );
    //获取密码
    function generatePassword(upper, number, symbol, length) {
      // 1.初始化密码
      let generatedPassword = "";
      // 2.过滤出没有选中的密码类型
      const typesCount = upper + number + symbol;
      const typeArr = [{ upper }, { number }, { symbol }].filter(
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
      this.props.history.goBack();
    };

    //Form布局
    const layout = {
      labelCol: { span: 24 },
      wrapperCol: { span: 16 },
    };

    //表单验证通过后的回调
    const onFinish = async (values) => {
      let { title, password, tip, url, username } = values;
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
              _this.props.history.push({
                pathname: "/home/psd",
              });
            }
          });
        };
        sendMessageToContentBackgroundScript(passwordItem);
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
                <input className="newPsw-card-inputs" bordered={false} />
              </Form.Item>

              <span className="newPsw-card-inputnewPswText">账号</span>
              <Form.Item
                label=""
                name="username"
                rules={[
                  {
                    required: true,
                    message: "请输入登陆账号！",
                  },
                ]}
              >
                <input className="newPsw-card-inputs" bordered={false} />
              </Form.Item>
              <span className="newPsw-card-inputnewPswText">密码</span>
              <Form.Item
                label=""
                name="password"
                rules={[
                  {
                    required: true,
                    message: "请输入密码",
                  },
                ]}
              >
                <input
                  className="newPsw-card-inputs "
                  id="password-input"
                  type="password"
                />
              </Form.Item>
              <span className="newPsw-card-inputnewPswText">网址</span>
              <Form.Item
                label=""
                name="url"
                rules={[
                  {
                    required: true,
                    message: "请输入网址",
                  },
                ]}
              >
                <input className="newPsw-card-inputs" bordered={false} />
              </Form.Item>
              <span className="newPsw-card-inputnewPswText">备注</span>
              <Form.Item label="" name="tip">
                <textarea className="newPsw-card-inputTextAreas" />
              </Form.Item>
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
                max={40}
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
              <span>40</span>
            </div>
            <div className="password-body-select">
              <div>
                <span className="password-select-info">大写</span>
                <Checkbox
                  className="c-ml set-b"
                  id="uppercase"
                  defaultChecked={this.state.check}
                  onChange={() => {
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
              <div className="main ml-20">
                <div className="btn-1 ">
                  <span className="password-text" onClick={closeModal}>
                    取消
                  </span>
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
const mapStateToProps = (state) => {
  return {
    passwordLibrary: state.passwordLibrary,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addPasswordItem(passwordItem) {
      const action = actionCreator.addPasswordItem(passwordItem);
      dispatch(action);
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(createNewPsw);
