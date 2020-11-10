/* global chrome */
import React, { Component } from "react";
import axios from "axios";
import { Input } from "antd";
import { handleLocalStorage, searchPassword } from "../../../../api";
import Search from "./Search.png";
import Lock from "./Lock.png";
import Folder from "./Folder.png";
import Up from "./Up.png";
import Key from "./Key.png";
import Success from "./icon_success@2x.png";
import { connect } from "react-redux";

import "./passwordLibrary.css";
class PsdLibrary extends Component {
  //设置密码列表
  state = {
    list: [],
    show: "",
  };
  componentDidMount() {
    // const { passwordItem } = this.props.location.state;
    // axios.get("/api/passwordList.json").then((item) => {
    //   item.data.push(this.props.location.state.passwordItem);
    //   this.setState(
    //     {
    //       list: [...this.state.list, ...item.data],
    //     },
    //     () => {
    //
    //     }
    //   );
    // });
    // const value = {
    //   pluginId: pluginID,
    // };
    // axios
    //   .post("/plugin/api/v1/password/list", value, {
    //     headers: { ClientType: "plugin", Authorization: token },
    //   })
    //   .then((res) => {
    //     this.setState({
    //       list: [...this.state.list, ...res.data],
    //     });
    //   });
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

export default connect(mapStateToProps, mapDispatchToProps)(PsdLibrary);
