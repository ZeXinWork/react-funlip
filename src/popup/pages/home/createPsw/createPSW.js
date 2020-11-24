import React, { Component } from "react";
import { Button, Slider, Switch } from "antd";
import "./createPSW.css";
export default class createPSW extends Component {
  state = {
    password: "",
    check: true,
    value: 10,
    hasLower: true,
    hasUpper: true,
    hasNumber: true,
    hasSymbol: true,
    ToolTip: 10,
    mustShowLow: true,
  };
  //创建密码
  createPassword = (value) => {
    // 生成随机小写
    function getRandomLower() {
      return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }

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
      lower: getRandomLower,
      upper: getRandomUpper,
      number: getRandomNumber,
      symbol: getRandomSymbol,
    };
    //获取对应节点
    const uppercaseEl = document.getElementById("uppercase");
    const lowercaseEl = document.getElementById("lowercase");
    const numbersEl = document.getElementById("numbers");
    const symbolsEl = document.getElementById("symbols");
    //设置对应配置信息
    const length = value;
    let { hasLower, hasUpper, hasNumber, hasSymbol } = this.state;

    let res = generatePassword(
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

  //在初始时就赋值
  componentDidMount() {
    let res = this.createPassword(this.state.value);
    this.setState(() => ({
      password: res,
    }));
  }
  render() {
    //设置密码位数
    const setValue = (option) => {
      //value即为当前slider的值,setState是异步的，不这样获取不到最新值
      const { value, options } = option;

      if (options === "uppercase") {
        this.setState(
          {
            hasUpper: !this.state.hasUpper,
          },
          () => {
            if (
              !this.state.hasUpper &&
              !this.state.hasSymbol &&
              !this.state.hasNumber &&
              !this.state.hasLower
            ) {
              this.setState(
                {
                  hasLower: true,
                  mustShowLow: true,
                },
                () => {
                  let res = this.createPassword(this.state.value);
                  this.setState(() => ({
                    password: res,
                  }));
                }
              );
            }
          }
        );
      } else if (options === "symbols") {
        this.setState(
          {
            hasSymbol: !this.state.hasSymbol,
          },
          () => {
            if (
              !this.state.hasUpper &&
              !this.state.hasSymbol &&
              !this.state.hasNumber &&
              !this.state.hasLower
            ) {
              this.setState(
                {
                  hasLower: true,
                  mustShowLow: true,
                },
                () => {
                  let res = this.createPassword(this.state.value);
                  this.setState(() => ({
                    password: res,
                  }));
                }
              );
            }
          }
        );
      } else if (options === "numbers") {
        this.setState(
          {
            hasNumber: !this.state.hasNumber,
          },
          () => {
            if (
              !this.state.hasUpper &&
              !this.state.hasSymbol &&
              !this.state.hasNumber &&
              !this.state.hasLower
            ) {
              this.setState(
                {
                  hasLower: true,
                  mustShowLow: true,
                },
                () => {
                  let res = this.createPassword(this.state.value);
                  this.setState(() => ({
                    password: res,
                  }));
                }
              );
            }
          }
        );
      } else if (options === "lowercase") {
        this.setState(
          {
            hasLower: !this.state.hasLower,
          },
          () => {
            if (
              !this.state.hasUpper &&
              !this.state.hasSymbol &&
              !this.state.hasNumber &&
              !this.state.hasLower
            ) {
              this.setState(
                {
                  hasLower: true,
                  mustShowLow: true,
                },
                () => {
                  let res = this.createPassword(this.state.value);
                  this.setState(() => ({
                    password: res,
                  }));
                }
              );
            }
          }
        );
      }

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

    //重置密码
    const reset = () => {
      let res = this.createPassword(this.state.value);
      this.setState(() => ({
        password: res,
      }));
    };

    //将密码复制到粘贴板
    const Copy = () => {
      const textarea = document.createElement("textarea");
      const password = this.state.password;
      if (!password) {
        return;
      }
      textarea.style.display = "hidden";
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();

      alert("密码已复制到剪切板");
    };
    return (
      <div className="createPSW-wrapper">
        <div className="createPSW-header">
          <p className="createPSW-header-text">{this.state.password}</p>
        </div>
        <div className="createPSW-body">
          <div className="createPSW-slider-wrapper">
            <span>{this.state.ToolTip}</span>
            <Slider
              max={40}
              min={0}
              className="createPSW-slider"
              defaultValue={10}
              onChange={(ToolTip) => {
                this.setState(
                  {
                    ToolTip: ToolTip,
                  },
                  () => {
                    setValue({ value: ToolTip });
                  }
                );
              }}
            />
            <span>40</span>
          </div>
          <div className="autoMid">
            <div className="auto-Space">
              <span className="ml-32">大写字母</span>
              <Switch
                defaultChecked={this.state.check}
                id="uppercase"
                onChange={() => {
                  setValue({
                    value: this.state.value,
                    options: "uppercase",
                  });
                }}
                className="mr-32"
              />
            </div>
            <div className="auto-Space">
              <span className="ml-32">小写字母</span>
              <Switch
                defaultChecked={this.state.check}
                id="lowercase"
                checked={this.state.mustShowLow}
                onChange={() => {
                  if (this.state.mustShowLow) {
                    this.setState({
                      mustShowLow: false,
                    });
                  } else {
                    this.setState({
                      mustShowLow: true,
                    });
                  }
                  setValue({
                    value: this.state.value,
                    options: "lowercase",
                  });
                }}
                className="mr-32"
              />
            </div>
            <div className="auto-Space">
              <span className="ml-32">符号</span>
              <Switch
                defaultChecked={this.state.check}
                id="symbols"
                onChange={() => {
                  setValue({
                    value: this.state.value,
                    options: "symbols",
                  });
                }}
                className="mr-32"
              />
            </div>
            <div className="auto-Space">
              <span className="ml-32">数字</span>
              <Switch
                defaultChecked={this.state.check}
                id="numbers"
                onChange={() => {
                  setValue({
                    value: this.state.value,
                    options: "numbers",
                  });
                }}
                className="mr-32"
              />
            </div>
          </div>
          <div className="autoMid">
            <div className="button-layout">
              <div className="main ml-20">
                <div className="btn-1 " onClick={reset}>
                  <span className=" reset-psw">重置密码</span>
                </div>
              </div>
              <div className="btn-layout mr-20 set-bg  copy-psw" onClick={Copy}>
                <span className="copy-text-info">复制密码</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
