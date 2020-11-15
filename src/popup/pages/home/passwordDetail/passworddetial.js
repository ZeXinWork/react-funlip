/* global chrome */
import React, { Component } from "react";
import { Button, Card, Form, Input, Slider, Checkbox } from "antd";
import localforage from "localforage";

import Arrow from "./icon_arrowright_black@2x.png";
import copyIcon from "./icon_edit_visible.png";
import { handleLocalStorage } from "../../../../api";
import radom from "./icon_generate_password.png";
import close from "./close.png";
import Delete from "./delete.png";
import Lock from "./Lock.png";
import "./passwordDetail.css";

class PasswordDetail extends Component {
  state = {
    password: "",
    check: true,
    value: 10,
    account: "",
    note: "",
    title: "",
    website: "",
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
    // 密码选择器一开始就初始化密码
    let res = this.createPassword(this.state.value);
    this.setState(() => ({
      password: res,
    }));

    //获取用户密码详细信息并保存再state中
    let {
      account,
      note,
      pwd,
      title,
      website,
    } = this.props.location.state.itemDetail;
    this.setState({
      account,
      note,
      pwd,
      title,
      website,
    });
  }

  render() {
    const pluginID = handleLocalStorage("get", "pluginID");
    const token = handleLocalStorage("get", "token");
    let { id } = this.props.location.state.itemDetail;
    let { isDeleteFolder } = this.props.location.state;

    const _this = this;
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
      this.props.history.push("/home/psd");
    };

    //显示\关闭用户设置的密码
    const showPassword = () => {
      let input = document.getElementById("password-input");
      input.type == "password"
        ? (input.type = "text")
        : (input.type = "password");
    };

    //关闭密码生成器
    const closeModal = () => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      Modal.style.display = "none";
    };

    //打开密码生成器
    const showModal = () => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      Modal.style.display = "block";
    };

    //把随机生成的密码传递给密码Input框 并关闭页面
    const closeSetModal = () => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      let input = document.getElementById("password-input");
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
    // 发请求删除用户密码信息
    const deleteItem = async (config, targetObj) => {
      const pluginID = handleLocalStorage("get", "pluginID");
      const value = {
        pluginId: pluginID / 1,
        passwordIds: [id],
      };

      const sendMessageToContentBackgroundScript = (mes) => {
        if (config == "editConfig") {
          mes.editConfig = "editConfig";
          mes.targetObj = targetObj;
        }
        mes.requestType = "deleteItem";
        chrome.runtime.sendMessage({ mes }, function (response) {});
      };
      sendMessageToContentBackgroundScript(value);

      chrome.extension.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        if (request == "deleteSuccess") {
          if (isDeleteFolder) {
            _this.props.history.push({
              pathname: "/folderDetail",
              state: { afterDelete: true },
            });
          } else {
            _this.props.history.push("/home/psd");
          }
        }
      });
    };

    //关闭删除页
    const closeModal2 = () => {
      let Modal = document.getElementsByClassName("password-modal2")[0];
      if (Modal) {
        Modal.style.display = "none";
      }
    };

    //打开删除页
    const showModal2 = () => {
      let Modal = document.getElementsByClassName("password-modal2")[0];
      Modal.style.display = "block";
    };

    //发请修改在密码详情页中修改的数据(流程： 发编辑请求 ->返回新的数据-->并删除原始数据-->把新数据数据传给bg->bg修改本地数据->传给密码库页面更新数据)
    const editInfo = async () => {
      const { title, pwd, note, website, account } = this.state;

      let passwordItem = {
        title: title,
        pwd: pwd,
        note: note,
        website: website,
        account: account,
        pluginId: pluginID,
      };
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "editNewPsw";
        chrome.runtime.sendMessage({ mes }, (res) => {
          let response = JSON.parse(res);
          let config = "editConfig";
          deleteItem(config, response);
        });
      };
      sendMessageToContentBackgroundScript(passwordItem);
    };

    return (
      <div className="newPsw-wrapper">
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
            <img
              src={Delete}
              className="password-delete-icon"
              onClick={showModal2}
            />
          </div>
          <div className="newPsw-card-content">
            <span className="newPsw-card-inputnewPswText">标题</span>
            <input
              className="newPsw-card-input"
              bordered={false}
              value={this.state.title}
              onChange={(e) => {
                const value = e.target.value;
                this.setState({
                  title: value,
                });
              }}
            />
            <span className="newPsw-card-inputnewPswText">账号</span>
            <input
              className="newPsw-card-input"
              style={{ marginBottom: 20 }}
              bordered={false}
              value={this.state.account}
              onChange={(e) => {
                const value = e.target.value;
                this.setState({
                  account: value,
                });
              }}
            />
            <span className="newPsw-card-inputnewPswText">密码</span>
            <input
              className="newPsw-card-input "
              id="password-input"
              style={{ marginBottom: 20 }}
              type="password"
              value={this.state.pwd}
              onChange={(e) => {
                const value = e.target.value;
                this.setState({
                  pwd: value,
                });
              }}
            />
            <span className="newPsw-card-inputnewPswText">网址</span>
            <input
              className="newPsw-card-input"
              style={{ marginBottom: 20 }}
              bordered={false}
              value={this.state.website}
              onChange={(e) => {
                const value = e.target.value;
                this.setState({
                  website: value,
                });
              }}
            />
            <span className="newPsw-card-inputnewPswText">备注</span>
            <textarea
              className="newPsw-card-inputTextArea"
              value={this.state.note}
              onChange={(e) => {
                const value = e.target.value;
                this.setState({
                  note: value,
                });
              }}
            />
            <Button
              htmlType="submit"
              className="newPsw-form-btn "
              onClick={editInfo}
              shape="round"
            >
              保存
            </Button>
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
              <p className="password-body-num-text">{this.state.password}</p>
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
        <div className="password-modal2">
          <div className="password-title-icon">
            <img src={Lock} className="lock-icon" />
          </div>
          <div className="password-title">
            <span className="password-title-info">是否删除此密码?</span>
          </div>
          <div className="password-body">
            <div className="password-btn-group">
              <div className="main ml-20">
                <div className="btn-1 " onClick={closeModal2}>
                  <span className="password-text">取消</span>
                </div>
              </div>
              <div className="btn-layout mr-20 set-bg " onClick={deleteItem}>
                <span className="password-text">确认</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default PasswordDetail;
