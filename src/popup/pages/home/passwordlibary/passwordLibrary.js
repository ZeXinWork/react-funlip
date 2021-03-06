/* global chrome */
import React, { Component } from "react";
import localforage from "localforage";
import { Input, Checkbox } from "antd";
import { handleLocalStorage, searchPassword } from "../../../../api";
import Search from "./Search.png";
import Lock from "./Lock.png";
import Folder from "./Folder.png";
import Up from "./Up.png";
import Key from "./Key.png";
import Success from "./icon_success@2x.png";
import arrowLeft from "./icon_arrowright_black@2x.png";
import robot from "./robot.png";
import add from "./icon_btn_add@2x.png";
import copy from "copy-to-clipboard";

import "./passwordLibrary.css";
class PsdLibrary extends Component {
  //设置密码列表
  state = {
    list: [],
    show: "",
    showRobot: false,
    inputValue: "",
  };

  componentWillMount() {
    let searchInputValue;
    if (this.props.location.state) {
      searchInputValue = this.props.location.state.searchInputValue;
    }
    const sendMessageToContentBackgroundScript = (mes) => {
      mes.type = "getUserList";
      let loading = document.getElementById("funlip-loading");
      this.setState({
        showRobot: false,
      });
      if (!searchInputValue) {
        loading.style.display = "block";
      }

      chrome.runtime.sendMessage({ mes }, function (response) {});
    };
    sendMessageToContentBackgroundScript({});
  }

  render() {
    //跳转至密码详情页，并传参

    let isFolderDetail;
    let folderName;
    let searchInputValue;
    let oldSearchList;
    if (this.props.location.state) {
      searchInputValue = this.props.location.state.searchInputValue;
      oldSearchList = this.props.location.state.oldSearchList;
    }

    if (this.props.location.state) {
      isFolderDetail = this.props.location.state.isFolderDetail;
      folderName = this.props.location.state.folderName;
    }

    const _this = this;
    const setList = (data) => {
      if (data.length == 0) {
        this.setState(
          {
            showRobot: true,
          },
          () => {
            let loading = document.getElementById("funlip-loading");
            loading.style.display = "none";
          }
        );
      } else if (searchInputValue) {
        if (searchInputValue) {
          this.setState({
            inputValue: searchInputValue,
            list: oldSearchList,
          });
        }
      } else {
        this.setState(
          {
            list: data,
          },
          () => {
            let loading = document.getElementById("funlip-loading");
            loading.style.display = "none";
          }
        );
      }
    };
    const pluginID = handleLocalStorage("get", "pluginID");
    const toDetail = (itemDetail, searchInputValue, oldSearchList) => {
      this.props.history.push({
        pathname: "/PswDetail",
        state: { itemDetail, searchInputValue, oldSearchList },
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
      let modal = document.getElementsByClassName(
        "psw-success-info-wrapper"
      )[0];
      copy(psw);
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

      // if (res != []) {
      //   this.setState({
      //     list: [...res],
      //   });
      // }
      // axios
      //   .post("/plugin/api/v1/password/search", searchInfo, {
      //     headers: { ClientType: "plugin", Authorization: token },
      //   })
      //   .then((res) => {
      //     if (res.data != []) {
      //       this.setState({
      //         list: [...res.data],
      //       });
      //     }
      //   });
    };
    // && this.state.showRobot == true
    return (
      <div>
        {!this.state.showRobot ? (
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
                <img src={arrowLeft} className="folderName-icon" />

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
                value={this.state.inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  searchInputValue = false;
                  this.setState({
                    inputValue: value,
                  });
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
                      let searchInput = document.getElementsByClassName(
                        "ant-input"
                      )[0];
                      let searchInputValue;
                      if (searchInput) {
                        searchInputValue = searchInput.value;
                      }

                      if (searchInputValue) {
                        toDetail(item, searchInputValue, this.state.list);
                      } else {
                        toDetail(item);
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
                      <div className="psw-user-info-account">
                        {item.account}
                      </div>
                    </div>
                    {folderName ? (
                      <div className="psw-icon">
                        <Checkbox
                          onClick={(e) => {
                            if (e && e.stopPropagation) {
                              e.stopPropagation();
                            } else {
                              window.event.cancelBubble = true;
                            }
                          }}
                        />
                      </div>
                    ) : (
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
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="psw-wrapper">
            {folderName ? (
              <div className="folderName-wrapper">
                <img src={arrowLeft} className="folderName-icon" />
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
              <img src={robot} className="robot-icon" />
              <p className="robot-text">还没有密码记录哦</p>
              <div
                className="robot-add-wrapper"
                onClick={() => {
                  this.props.history.push("/newPsw");
                }}
              >
                <img src={add} className="robot-add-icon" />
                <span className="robot-add-text">现在创建</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default PsdLibrary;
