import React, { Component } from "react";
import { DribbbleOutlined, DingtalkOutlined } from "@ant-design/icons";
import lock from "./lock.png";

import "./indexBottom.css";
export default class componentName extends Component {
  render() {
    const toAccount = () => {
      this.props.history.push("/home/account");
    };
    const toSet = () => {
      this.props.history.push("/home/set");
    };
    const pwsLibrary = () => {
      this.props.history.push("/home/psd");
    };
    const folder = () => {
      this.props.history.push("/home/folder");
    };
    return (
      <div className="home-classification">
        <div className="lock-wrapper">
          <img src={lock} className="lock-item"></img>
        </div>
        <div className="fly-item">
          <DribbbleOutlined
            className="fly-ball"
            onClick={() => {
              this.props.history.push("/newPsw");
            }}
          />
        </div>
        <div className="item-classification">
          <div className="item-password-Library" onClick={pwsLibrary}>
            <DingtalkOutlined className="mb-6" />
            <span>密码库</span>
          </div>
          <div className="item-folder" onClick={folder}>
            <DingtalkOutlined className="mb-6" />
            <span>文件夹</span>
          </div>
          <div className="item-set" onClick={toSet}>
            <DingtalkOutlined className="mb-6" />
            <span>生成器</span>
          </div>
          <div className="item-account " onClick={toAccount}>
            <DingtalkOutlined className="mb-6" />
            <span>账号</span>
          </div>
        </div>
      </div>
    );
  }
}
