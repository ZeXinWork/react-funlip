/* global chrome */
import React, { Component } from "react";
import localforage from "localforage";
import { Input, Checkbox, Button } from "antd";
import { handleLocalStorage } from "../../../../../api";
import Search from "./Search.png";
import Lock from "../Lock.png";
import Folder from "../Folder.png";
import Up from "../Up.png";
import Key from "../Key.png";
import Success from "./icon_success@2x.png";
import arrowLeft from "./icon_arrowright_black@2x.png";

import "./moverFolder.css";
class PsdLibrary extends Component {
  //设置密码列表
  state = {
    list: [],
    show: "",
    folderIds: [],
  };
  componentDidMount() {
    const setList = (data) => {
      this.setState({
        list: data,
      });
    };

    const sendMessageToContentBackgroundScript = (mes) => {
      mes.type = "getUserList";
      let loading = document.getElementById("funlip-loading");
      loading.style.display = "block";

      chrome.runtime.sendMessage({ mes }, function (response) {});
    };
    sendMessageToContentBackgroundScript({});
  }

  render() {
    //跳转至密码详情页，并传参

    let isFolderDetail;
    let folderName;
    if (this.props.location.state) {
      isFolderDetail = this.props.location.state.isFolderDetail;
      folderName = this.props.location.state.folderName;
    }

    const _this = this;
    const setList = (data) => {
      //流程，根据首字母比较，然后排序 再把数组中的数据加载一个新数组里面 然后更新用户接口面
      //
      // let newArray = [];
      // data.map((item, index) => {
      //   const first = item.title.charAt(0);
      //   let key = {
      //     first,
      //     index,
      //     item,
      //   };
      //   newArray.push(key);
      // });
      //
      this.setState(
        {
          list: data,
        },
        () => {
          let loading = document.getElementById("funlip-loading");
          loading.style.display = "none";
        }
      );
    };
    const pluginID = handleLocalStorage("get", "pluginID");
    const toDetail = (itemDetail) => {
      this.props.history.push({
        pathname: "/PswDetail",
        state: { itemDetail },
      });
    };

    chrome.extension.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request == "addSuccess") {
        _this.props.history.push("/home/psd");
      }
      if (request.type == "popupGetData") {
        const { data } = request;

        setList(data);
      }
    });

    //发送消息给background,手动填充
    function sendMessageToContentScript(mes) {
      mes.type = "mesToBackground";
      chrome.runtime.sendMessage({ mes }, function (response) {});
    }

    //打开新的url
    function sendMessageToContentScript2(url) {
      let mes = {
        url: url,
        type: "goUrl",
      };
      chrome.runtime.sendMessage({ mes }, function (response) {});
    }

    //显示hover效果
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

    //复制用户密码
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

    //搜索用户密码库密码
    const searChPsd = async (e) => {
      const value = e.target.value;

      const searchInfo = {
        keyword: value,
        pluginId: pluginID,
      };
      //发请求搜索用户密码
      // const res = await searchPassword(searchInfo);
      const _this = this;
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = "searchPsw";
        mes.searchInfo = searchInfo;
        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response);

          if (res != []) {
            _this.setState({
              list: [...res],
            });
          }
        });
      };
      sendMessageToContentBackgroundScript({});
    };

    //添加密码到文件夹下
    const addPswToFolder = () => {
      let myChecked = [];
      let targetArray = [];
      let targetIdArray = [];
      let MyCheckBox = document.getElementsByClassName("folderCheckbox");
      for (let i = 0; i < MyCheckBox.length; i++) {
        if (MyCheckBox[i].checked) {
          myChecked.push(i);
        }
      }
      let list = this.state.list;
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < myChecked.length; j++) {
          if (i == myChecked[j]) {
            targetArray.push(list[i]);
          }
        }
      }
      for (let i = 0; i < targetArray.length; i++) {
        targetIdArray.push(targetArray[i].id);
      }

      let folderId = handleLocalStorage("get", "folderId");

      let userInfo = {
        passwordIds: targetIdArray,
        folderId,
      };
      const sendMessageToContentBackgroundScript2 = (mes) => {
        mes.requestType = "addPswToFolder";
        const _this = this;

        chrome.runtime.sendMessage({ mes }, function (res) {
          let responses = JSON.parse(res);
          if (responses.code == 200) {
            mes.requestType = "getFolderList";
            chrome.runtime.sendMessage({ mes }, function (response) {
              let res = JSON.parse(response);

              let sendList;
              //成功获取
              if (res.length >= 0) {
                localforage
                  .setItem("folderList", res)
                  .then(function (value) {
                    for (let i = 0; i < value.length; i++) {
                      if (folderId == value[i].id) {
                        sendList = value[i].passwords;
                        _this.props.history.push({
                          pathname: "/folderDetail",
                          state: { passwordList: sendList },
                        });
                      }
                    }
                  })
                  .catch(function (err) {});
              } else {
                alert("获取文件夹失败");
              }
            });
          }
        });
      };
      sendMessageToContentBackgroundScript2(userInfo);
    };

    return (
      <div className="psw-wrapper">
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
        {folderName ? (
          <div className="folderName-wrapper">
            <img
              src={arrowLeft}
              className="folderName-icon"
              onClick={() => {
                this.props.history.push({
                  pathname: "/folderDetail",
                });
              }}
            />

            <div className="psw-wrapper-folderName">
              <p className="psw-wrapper-folderName-info">{`文件夹 > ${folderName} >添加密码`}</p>
            </div>
          </div>
        ) : (
          ""
        )}

        <div className="home-search">
          <Input
            prefix={<img src={Search} className="icon-search" />}
            className="home-search-input"
            placeholder="   搜索密码"
            onChange={(e) => {
              searChPsd(e);
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
                  <Checkbox
                    className="folderCheckbox"
                    onClick={(e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      } else {
                        window.event.cancelBubble = true;
                      }
                    }}
                    onChange={() => {
                      let MyCheckBox = document.getElementsByClassName(
                        "folderCheckbox"
                      )[index];
                      MyCheckBox.checked
                        ? (MyCheckBox.checked = false)
                        : (MyCheckBox.checked = true);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="btn-group">
          <Button className="folder-btn" shape="round" onClick={addPswToFolder}>
            确定
          </Button>
        </div>
      </div>
    );
  }
}

export default PsdLibrary;
