/* global chrome */
import React, { Fragment } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Login from "./pages/login";
import mySet from "./pages/set/set";
import passwordNumber from "./pages/passwordNumber";
import AutoLock from "./pages/autolock";
import Fogot from "./pages/forgot";
import PasswordGenerator from "./common/passwordGenerator";
import SavePsw from "./pages/savePsw";
import CheckNumber from "./pages/checkNumber/index";
import setMainPsw from "./pages/setMainPsw";
import Home from "./pages/home/home";
import CnPsw from "./pages/newPsw";
import PswDetail from "./pages/home/passwordDetail/passworddetial";
import MyAbout from "./pages/home/about/about";
import ResetPsw from "./pages/reset/resetPassword";
import FolderDetail from "./pages/home/folder/folderDetail/folderDetail";
import FolderAdd from "./pages/home/folder/moveFolder/moverFolder";
import "@/content";

function Popup() {
  return (
    <Fragment>
      <BrowserRouter>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/home" component={Home} />
          <Route path="/forgot" component={Fogot} />
          <Route path="/savePsw" component={SavePsw} />
          <Route path="/autoLock" component={AutoLock} />
          <Route path="/setMP" component={setMainPsw} />
          <Route path="/newPsw" component={CnPsw} />
          <Route path="/mySet" component={mySet} />
          <Route path="/check" component={CheckNumber} />
          <Route path="/PswDetail" component={PswDetail} />
          <Route path="/about" component={MyAbout} />
          <Route path="/reset" component={ResetPsw} />
          <Route path="/pswNum" component={passwordNumber} />
          <Route path="/pswG" component={PasswordGenerator} />
          <Route path="/folderDetail" component={FolderDetail} />
          <Route path="/folderAdd" component={FolderAdd} />
          <Redirect to={"/login"} />
        </Switch>
      </BrowserRouter>
    </Fragment>
  );
}

export default Popup;
