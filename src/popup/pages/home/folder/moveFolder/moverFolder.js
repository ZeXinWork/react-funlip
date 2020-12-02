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
    let arrSortMinToMax = (a, b) => {
      let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;
      if (!cReg.test(a.title) || !cReg.test(b.title)) {
        return a.title.localeCompare(b.title);
      } else {
        return a.title.localeCompare(b.title, "zh");
      }
    };
    const getData = async () => {
      let oldList;
      if (this.props.location.state) {
        oldList = this.props.location.state.list;
      }
      const getLocalData = async () => {
        const res = localforage
          .getItem("userInfo")
          .then(function (value) {
            // 当离线仓库中的值被载入时，此处代码运行
            return value;
          })
          .catch(function (err) {
            // 当出错时，此处代码运行
          });
        return res;
      };
      let userInfo = await getLocalData();
      const setList = (data) => {
        let value = data;
        if (oldList && oldList.length > 0) {
          for (let i = 0; i < value.length; i++) {
            for (let j = 0; j < oldList.length; j++) {
              if (oldList[j].id == value[i].id) {
                value.splice(i, 1);
              }
            }
          }
        }
        let sortArr = value.sort(arrSortMinToMax);

        this.setState(
          {
            list: sortArr,
          },
          () => {
            let loading = document.getElementById("funlip-loading");
            loading.style.display = "none";
          }
        );
      };
      setList(userInfo);
    };
    getData();
  }
  arrSortMinToMax = (a, b) => {
    let cReg = /^[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/;
    if (!cReg.test(a.title) || !cReg.test(b.title)) {
      return a.title.localeCompare(b.title);
    } else {
      return a.title.localeCompare(b.title, "zh");
    }
  };
  render() {
    //跳转至密码详情页，并传参
    let isFolderDetail;
    let folderName;
    let oldList;
    if (this.props.location.state) {
      isFolderDetail = this.props.location.state.isFolderDetail;
      folderName = this.props.location.state.folderName;
      oldList = this.props.location.state.list;
    }
    const _this = this;

    const pluginID = handleLocalStorage("get", "pluginID");

    const toDetail = (itemDetail) => {
      this.props.history.push({
        pathname: "/PswDetail",
        state: { itemDetail },
      });
    };

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
          let sortArr = res.sort(_this.arrSortMinToMax);

          if (sortArr != []) {
            for (let i = 0; i < sortArr.length; i++) {
              for (let j = 0; j < oldList.length; j++) {
                if (oldList[j].id == sortArr[i].id) {
                  sortArr.splice(i, 1);
                }
              }
            }

            _this.setState({
              list: [...sortArr],
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
                  state: { oldList: oldList },
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
                  let MyCheckBox = document.getElementsByClassName(
                    "folderCheckbox"
                  )[index];
                  if (MyCheckBox.checked) {
                    MyCheckBox.checked = false;
                  } else {
                    MyCheckBox.checked = true;
                  }
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
                  <div className="psw-user-info-account">{item.account}</div>
                </div>
                <div className="psw-icon">
                  <input
                    type="checkbox"
                    className="folderCheckbox"
                    onClick={(e) => {
                      if (e && e.stopPropagation) {
                        e.stopPropagation();
                      } else {
                        window.event.cancelBubble = true;
                      }
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
