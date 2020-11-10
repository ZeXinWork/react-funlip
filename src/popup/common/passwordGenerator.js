import React, { Component } from "react";
import "./passwordGenerator.css";
import close from "./close.png";
import radom from "./icon_generate_password.png";
import Arrow from "./icon_arrowright_black@2x.png";
import copyIcon from "./icon_edit_visible.png";
import { Slider, Checkbox } from "antd";
export default class PasswordGenerator extends Component {
  state = {
    password: "",
    check: true,
    value: 10,
  };
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
    let res = this.createPassword(this.state.value);
    this.setState(() => ({
      password: res,
    }));
  }
  render() {
    const CloseModals = (data) => {
      this.props.show(data);
    };

    const closeModal = () => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      Modal.style.display = "none";
    };
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

    const closeSetModal = (data) => {
      let Modal = document.getElementsByClassName("password-modal")[0];
      let input = document.getElementById("password-input");
      const password = this.state.password;

      this.props.show(data, password);
    };
    return (
      <div className="password-modal">
        <div className="password-title-icon">
          <img
            src={close}
            onClick={() => {
              // CloseModals("none");
            }}
          />
        </div>
        <div className="password-title">
          <span className="password-title-info">密码生成器</span>
        </div>
        <div className="password-body">
          <div className="password-body-num">{this.state.password}</div>
          <div className="password-slider-wrapper">
            <span>0</span>
            <Slider
              max={40}
              min={0}
              className="password-slider"
              defaultValue={10}
              onChange={(ToolTip) => {
                setValue(ToolTip);
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
              <div
                className="btn-1 "
                onClick={() => {
                  CloseModals("none");
                }}
              >
                <span className="password-text" onClick={closeModal}>
                  取消
                </span>
              </div>
            </div>
            <div
              className="btn-layout mr-20 set-bg "
              onClick={() => {
                closeSetModal("none");
              }}
            >
              <span className="password-text">确认</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
