/*global chrome*/

import React, { Component } from "react";
import Success from "./icon_success@2x.png";
import { handleLocalStorage } from "../../../../../api";
import Lock from "./Lock.png";
import Folder from "./Folder.png";
import Up from "./Up.png";
import Key from "./Key.png";
import arrowLeft from "./icon_arrowright_black@2x.png";
import Edit from "./icon_edit@2x.png";
import "./folderDail.css";
export default class componentName extends Component {
  state = {
    list: [],
    show: "",
    editShow: "none",
  };
  componentDidMount() {
    let { passwordList, dataList } = this.props.location.state;
    let newArray = [dataList];
    if (passwordList) {
      handleLocalStorage("set", "passwordList", passwordList);
    }

    if (dataList) {
      const dataList = handleLocalStorage("get", "passwordList");
      this.setState({
        list: [...dataList, ...newArray],
      });
    } else {
      this.setState({
        list: passwordList,
      });
    }
  }
  render() {
    let { folderId } = this.props.location.state;
    const toDetail = (itemDetail) => {
      this.props.history.push({
        pathname: "/PswDetail",
        state: { itemDetail },
      });
    };

    const showHover = (index) => {
      this.setState({
        show: index,
      });
    };

    //将hover效果移出
    const cancelHover = () => {
      this.setState({
        show: "",
      });
    };

    function sendMessageToContentScript(mes) {
      mes.type = "mesToBackground";
      chrome.runtime.sendMessage({ mes }, function (response) {});
    }

    function sendMessageToContentScript2(url) {
      let mes = {
        url: url,
        type: "goUrl",
      };
      chrome.runtime.sendMessage({ mes }, function (response) {});
    }

    const Copy = (psw) => {
      const input = document.createElement("input");

      let modal = document.getElementsByClassName(
        "psw-success-info-wrapper"
      )[0];

      const password = psw;
      if (!password) {
        return;
      }
      input.value = password;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      modal.style.display = "block";
      setTimeout(() => {
        modal.style.display = "none";
      }, 2000);
    };

    const showEditHover = () => {
      this.setState({
        editShow: "block",
      });
    };

    const cancelEditHover = () => {
      this.setState({
        editShow: "none",
      });
    };
    return (
      <div className="psw-wrappers">
        <div className="psw-success-info-wrapper">
          <div className="psw-success-info">
            <img
              src={Success}
              className="success-icon"
              alt="psw-success-info"
            />
            <div className="psw-success-text">密码已复制</div>
          </div>
        </div>
        <div className="editDetail" style={{ display: this.state.editShow }}>
          <div className="edit-text-wrapper">
            <div className="managePsw text-wrapper top-text">管理密码</div>
            <div className="deletePsw text-wrapper">删除</div>
            <div className="reName text-wrapper">重命名</div>
          </div>
        </div>
        <div className="folder-icon-header">
          <img
            src={arrowLeft}
            className="arrowLeft"
            onClick={() => {
              this.props.history.goBack();
            }}
          />
          <img
            src={Edit}
            className="edit"
            onMouseOver={() => {
              showEditHover();
            }}
            onMouseLeave={() => {
              cancelEditHover();
            }}
          />
        </div>
        <div className="home-body">
          {this.state.list.map((item, index) => {
            return (
              <div
                className="psw-info"
                key={item.title}
                onClick={() => {
                  toDetail(item);
                }}
                onMouseOver={() => {
                  showHover(index);
                }}
                onMouseLeave={() => {
                  cancelHover(index);
                }}
                key={index}
              >
                <div className="psw-user-info">
                  <div>{item.title}</div>
                  <div>{item.account}</div>
                </div>
                <div className="psw-icon">
                  {this.state.show === index ? (
                    <div>
                      <img
                        src={Key}
                        className="lock-icon"
                        onClick={(e) => {
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          } else {
                            window.event.cancelBubble = true;
                          }
                          sendMessageToContentScript(item);
                        }}
                      />
                      <img
                        src={Up}
                        className="lock-icon"
                        onClick={(e) => {
                          const url = item.website;
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          } else {
                            window.event.cancelBubble = true;
                          }
                          sendMessageToContentScript2(url);
                        }}
                      />
                      <img
                        src={Folder}
                        className="lock-icon"
                        onClick={(e) => {
                          const password = item.pwd;
                          if (e && e.stopPropagation) {
                            e.stopPropagation();
                          } else {
                            window.event.cancelBubble = true;
                          }
                          Copy(password);
                        }}
                      />
                    </div>
                  ) : (
                    <img src={Lock} className="lock-icon" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="autoMid">
          <div className="button-layout">
            <div
              className="main ml-20"
              onClick={() => {
                this.props.history.push({
                  pathname: "/newPsw",
                  state: { isFolderDetail: true, folderId },
                });
              }}
            >
              <div className="btn-1 ">
                <span className=" reset-psw">新建密码</span>
              </div>
            </div>
            <div className="btn-layout mr-20 set-bg  copy-psw">
              <span className="copy-text-info">添加密码</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
