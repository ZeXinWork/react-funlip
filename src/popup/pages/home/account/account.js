/*global chrome*/

import React, { Component } from 'react'
import { handleLocalStorage } from '../../../../api'
import localforage from 'localforage'
import meVip from './icon_me_vip@2x.png'
import userPhoto from './img_me_photo@2x.png'
import arrowRight from './icon_arrowright@2x(1).png'
import equipment from './icon_me_equipment@2x.png'
import exit from './icon_me_exit@2x.png'
import security from './icon_me_security@2x.png'
import passwordIcon from './icon_me_password@2x.png'
import setting from './icon_me_setting@2x.png'
import folder from './icon_folder_备份 14@2x.png'
import './account.css'
export default class componentName extends Component {
  state = {
    userName: '',
    phone: '',
  }
  componentDidMount() {
    const userName = handleLocalStorage('get', 'userName')
    let newData = userName.split('_')
    let phone = newData[1]
    this.setState({
      userName,
      phone,
    })
  }
  render() {
    const history = this.props.history
    //登出账号
    const outLogin = () => {
      //发请求登出账号
      const sendMessageToContentBackgroundScript = (mes) => {
        mes.requestType = 'outLogin'

        chrome.runtime.sendMessage({ mes }, function (response) {
          let res = JSON.parse(response)
          if (res.code === 200) {
            handleLocalStorage('remove', 'token')
            handleLocalStorage('remove', 'pluginID')
            handleLocalStorage('remove', 'userName')
            handleLocalStorage('remove', 'autoFill')
            handleLocalStorage('remove', 'autoLogin')
            handleLocalStorage('remove', 'autoStore')
            handleLocalStorage('remove', 'phone')
            handleLocalStorage('remove', 'loginToken')
            handleLocalStorage('remove', 'folderId')
            handleLocalStorage('remove', 'folderName')
            handleLocalStorage('remove', 'lockedDelay')
            function sendMessageToContentScript(mes) {
              mes.type = 'deleteOutLogin'
              chrome.runtime.sendMessage({ mes }, function (response) {})
            }
            sendMessageToContentScript({})
            const token = handleLocalStorage('get', 'token')
            if (!token) {
              history.push('/login')
            }
          } else {
            alert(response.msg)
          }
        })
      }
      sendMessageToContentBackgroundScript({})
    }

    const goSet = () => {
      history.push('/mySet')
    }

    //跳转至关于我们页面
    const about = () => {
      history.push('/about')
    }
    return (
      <div className="account-wrapper">
        <div className="home-user-info-wrappers">
          <div className="home-user-info-wrapper">
            <img src={userPhoto} className="home-user-photo" alt="userPhone" />
            <div className="home-user-info">
              <div className="home-username cur">{this.state.userName}</div>
              <div className="home-telephone-Number cur">
                {this.state.phone}
              </div>
            </div>
            <div className="user-level cur">
              <img src={meVip} className="user-level-icon" alt="meVip" />
              <span className="user-level-text ">普通用户</span>
            </div>
          </div>
        </div>
        <div className="user-body-wrapper">
          <div
            className="getPassword mb-20 cur "
            onClick={() => {
              function sendMessageToContentScript(mes) {
                mes.type = 'showImage3'
                chrome.runtime.sendMessage({ mes }, function (response) {})
              }
              sendMessageToContentScript({})
              this.props.history.push('/home/createPSW')
            }}
          >
            <img src={passwordIcon} className="img-icon" alt="passwordIcon" />
            <span className="password-text user-text">密码生成器</span>
            <img
              src={arrowRight}
              alt="arrowRight"
              className="arrowRight-special cur"
            />
          </div>
          <div className="getPassword mb-20 cur " onClick={goSet}>
            <img src={setting} className="img-icon" alt="setting" />
            <span className="password-text user-text">安全设置</span>
            <img
              src={arrowRight}
              alt="arrowRight"
              className="arrowRight-common cur"
              onClick={goSet}
            />
          </div>
          <div className="device-control mb-20 cur ">
            <img
              src={equipment}
              className="control-icon img-icon"
              alt="equipment"
            />
            <span className="control-text user-text">设备管理</span>
            <img
              src={arrowRight}
              alt="arrowRight"
              className="arrowRight-common cur"
            />
          </div>
          <div className="home-sync mb-20 cur">
            <img src={folder} className="sync-icon img-icon" alt="folder" />
            <span className="sync-text user-text">同步数据</span>

            <img
              src={arrowRight}
              alt="arrowRight"
              className="arrowRight-common cur"
            />
          </div>
          <div className="home-about mb-20 cur" onClick={about}>
            <img
              src={security}
              className="about-icon img-icon"
              alt="security"
            />
            <span className="about-text user-text">关于我们</span>

            <img
              src={arrowRight}
              alt="arrowRight"
              className="arrowRight-common cur"
            />
          </div>
          <div className="home-out mb-20 cur" onClick={outLogin}>
            <img src={exit} className="out-icon img-icon" alt="exit" />
            <span className="out-text user-text">登出账号</span>
            <img
              src={arrowRight}
              alt="arrowRight"
              className="arrowRight-common cur"
            />
          </div>
        </div>
      </div>
    )
  }
}
