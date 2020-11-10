import React, { Component } from "react";
import "./savePsw.css";
import logo from "./icon_WePass_logo备份@2x.png";
import close from "./close.png";
import axios from "axios";
// 如何让这个页面被触发弹出？思路：1、获取页面上的表单提交按钮（a\input\button\div）成本大，不知道页面究竟使用哪个
//  2、找到监听表单提交的方法，只要提交不管成没成功，弹出页面 （1、目前没找到这样的方法 2、页面表单可能有多个（如何筛选正确的表单））
// 要弹出页面，必须找到一种触发插件被点击的事件
export default class SavePsw extends Component {
  state = {
    url: "",
  };
  async componentDidMount() {
    let url = window.location.href;
    let data;
    //只留下域名
    url = url.split("/").slice(3).join("/");
    this.setState(() => ({
      url,
    }));

    async function test() {
      return await axios.get("/api/passwordList.json");
    }

    async function getData() {
      const res = await test();
      console.log(res.data);
      return res;
    }
    data = await getData();
    console.log(data);
  }
  render() {
    const { url } = this.state;
    return (
      <div className="save-psw-wrapper">
        <div className="save-ps-header">
          <div className="save-header-left">
            <div>
              <img src={logo} alt="logo" className="logo" />
            </div>
            <div className="header-text">Funlip</div>
          </div>
          <div>
            <img src={close} alt="close" className="logo-right" />
          </div>
        </div>
        <div className="body-text">
          密码库中没有此网站的记录，是否需要创建一条？
        </div>
        <div className="save-psw-body">
          <div className="body-password">
            <div className="body-password-left">
              <div className="body-password-img">
                {/* 获取页面山的图标 */}
                <img src={`${window.location.href}/favicon.ico`} />
              </div>
              <div className="body-left-text">
                <div>{url}</div>
                {/**想获取密码，还得通信，如何通信？
                 * 必须考虑的问题：1、发通信的请求在哪个时机？ 只要弹出，content就发消息给popup，并把页面的密码传过来
                 *                2、密码如何渲染到组件？ 监听content 提前设一个state放密码 只要content传信息过来 更新state就会更新页面
                 */}
                <div>password</div>
              </div>
            </div>
            <div className="body-right-icon">右边图标</div>
          </div>
        </div>
        <div className="autoMid">
          <div className="button-layout">
            <div className="main ml-20">
              <div className="btn-1 ">
                <span className="password-text reset-psw">跳过此网站</span>
              </div>
            </div>
            <div className="btn-layout mr-20 set-bg  copy-psw">
              <span className="password-text">保存</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
