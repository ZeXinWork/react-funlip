/*global chrome*/

import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Account from '../account/account'
import lock from './icon_password_nor@2x(1).png'
import preLock from './icon_password_pre@2x.png'
import PsdLibrary from '../passwordlibary/passwordLibrary'
import Folder from '../folder/folder'
import Folder_pre from './icon_folder_pre@2x.png'
import createPSW from '../createPsw/createPSW'
import password_nor from './icon_password_nor@2x.png'
import folderIcon from './icon_folder_nor@2x.png'
import generate from './icon_password_generator_nor@2x.png'
import generate_pre from './icon_password_generator_pre@2x.png'
import me_pre from './icon_me_pre@2x.png'
import me_no from './icon_me_nor@2x.png'
import addIcon from './btn_add@2x.png'

import './home.css'
import { handleLocalStorage } from '../../../../api'

export default class Home extends Component {
  state = {
    img1: true,
    img2: false,
    img3: false,
    img4: false,
  }
  componentDidMount() {
    //home页面四个图标点击时换色
    let iconItem = document.getElementsByClassName('item-icon')
    for (let i = 0; i < iconItem.length; i++) {
      iconItem[i].onclick = function () {
        setImg(i)
      }
    }

    //用state的状态值控制该显示什么颜色
    const setImg = (index) => {
      if (index == 0) {
        this.setState({
          img1: true,
          img2: false,
          img3: false,
          img4: false,
        })
      }
      if (index == 1) {
        this.setState({
          img1: false,
          img2: true,
          img3: false,
          img4: false,
        })
      }
      if (index == 2) {
        this.setState({
          img1: false,
          img2: false,
          img3: true,
          img4: false,
        })
      }
      if (index == 3) {
        this.setState({
          img1: false,
          img2: false,
          img3: false,
          img4: true,
        })
      }
    }
  }
  render() {
    //跳转到我的
    const toAccount = () => {
      this.props.history.push('/home/account')
    }
    //跳转到密码生成器
    const tocreatePSW = () => {
      this.props.history.push('/home/createPSW')
    }
    //跳转至密码库页
    const pwsLibrary = () => {
      this.props.history.push('/home/psd')
    }
    //跳转至文件夹页面
    const folder = () => {
      this.props.history.push('/home/folder')
    }

    const setLock = () => {
      handleLocalStorage('set', 'autoLock', true)
      this.props.history.push('/autoLock')
    }
    const _this = this
    chrome.extension.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request == 'showImage3') {
        let flag = true
        if (_this.state.img3) {
          flag = false
        }
        if (flag) {
          _this.setState({
            img1: false,
            img2: false,
            img3: true,
            img4: false,
          })
        }
      } else if (request == 'showImage2') {
        let flag = true
        if (_this.state.img2) {
          flag = false
        }
        if (flag) {
          _this.setState({
            img1: false,
            img2: true,
            img3: false,
            img4: false,
          })
        }
      } else if (request == 'showImage4') {
        let flag = true
        if (_this.state.img4) {
          flag = false
        }
        if (flag) {
          _this.setState({
            img1: false,
            img2: false,
            img3: false,
            img4: true,
          })
        }
      }
    })

    return (
      <div className="home-wrapper">
        <div className="lock-wrapper">
          <div className="lock-item-wrapper" onClick={setLock}>
            <img src={lock} className="lock-icon" />
            <span className="lock-text">锁定</span>
          </div>
        </div>
        <div className="home-header">
          <Switch>
            <Route path="/home/account" component={Account} />
            <Route path="/home/createPSW" component={createPSW} />
            <Route path="/home/psd" component={PsdLibrary} />
            <Route path="/home/folder" component={Folder} />
            <Redirect to="/home/psd" />
          </Switch>
        </div>
        <div className="home-classification">
          <div className="item-classification">
            <div className="home-classification">
              <div className="fly-item">
                <img
                  src={addIcon}
                  className="fly-ball"
                  onClick={() => {
                    this.props.history.push('/newPsw')
                  }}
                />
              </div>
              <div className="item-classification">
                <div>
                  {this.state.img1 ? (
                    <img
                      src={preLock}
                      className=" item-icon img1"
                      onClick={pwsLibrary}
                      alt="preLock"
                    />
                  ) : (
                    <img
                      src={password_nor}
                      className=" item-icon img1"
                      onClick={pwsLibrary}
                      alt="password_nor"
                    />
                  )}
                </div>
                <div>
                  {this.state.img2 ? (
                    <img
                      src={Folder_pre}
                      className=" item-icon img2"
                      onClick={folder}
                    />
                  ) : (
                    <img
                      src={folderIcon}
                      className=" item-icon img2"
                      onClick={folder}
                    />
                  )}
                </div>
                <div>
                  {this.state.img3 ? (
                    <img
                      src={generate_pre}
                      className=" item-icon img3"
                      onClick={tocreatePSW}
                      alt="generate_pre"
                    />
                  ) : (
                    <img
                      src={generate}
                      className=" item-icon img3"
                      onClick={tocreatePSW}
                      alt="generate"
                    />
                  )}
                </div>
                <div>
                  {this.state.img4 ? (
                    <img
                      src={me_pre}
                      className="mb-6 item-icon img4 "
                      onClick={toAccount}
                    />
                  ) : (
                    <img
                      src={me_no}
                      className="mb-6 item-icon img4 "
                      onClick={toAccount}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
