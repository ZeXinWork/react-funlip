import React, { Component } from "react";
import { Input, Button } from "antd";
import "./checkNumber.css";
export default class componentName extends Component {
  render() {
    const goHome = () => {
      this.props.history.push("/home");
    };
    return (
      <div className="check-wrapper">
        <div className="check-header">
          <h1>验证码</h1>
        </div>
        <div className="check-body">
          <Input placeholder="输入验证码" className="check-body-input" />
          <Button onClick={goHome}>重新获取</Button>
        </div>
      </div>
    );
  }
}
