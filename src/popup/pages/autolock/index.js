/*global chrome*/
import React, { Component } from "react";
import { Button, Input } from "antd";
import { handleLocalStorage } from "../../../api";
import background from "./background.png";
import logo from "./logo.png";
import "./autolock.css";
export default class AutoLock extends Component {
  render() {
    const goForgot = () => {
      this.props.history.push({
        pathname: "/setMP",
        state: { id: "reset" },
      });
    };

    function sendMessageToContentScript(mes) {
      mes.type = "autolock";
      chrome.runtime.sendMessage({ mes }, function (response) {});
    }

    const goHome = () => {
      handleLocalStorage("remove", "autolock");
      sendMessageToContentScript({ autolock: "auctock" });
      this.props.history.push("/home");
    };
    return (
      <div className="auto-lock-wrapper">
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
            <Input style={{ caretColor: "#5770ec" }} maxlength="1"></Input>
            <Input style={{ caretColor: "#5770ec" }} maxlength="1"></Input>
            <Input style={{ caretColor: "#5770ec" }} maxlength="1"></Input>
            <Input style={{ caretColor: "#5770ec" }} maxlength="1"></Input>
            <Input style={{ caretColor: "#5770ec" }} maxlength="1"></Input>
            <Input style={{ caretColor: "#5770ec" }} maxlength="1"></Input>
          </div>
        </div>
        <div className="auto-lock-btn-wrapper">
          <Button onClick={goHome}>解锁</Button>
          <Button className="auto-lock-btn" onClick={goForgot}>
            忘记密码？
          </Button>
        </div>
      </div>
    );
  }
}
