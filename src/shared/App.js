import "./App.css";
import React from "react";

import { ConnectedRouter } from "connected-react-router";
import { history } from "../redux/configureStore";

// pages에 index.js 파일을 만들고, index.js 내에서 모든 파일을 임포트, 익스포트 해주면
// 이런 식으로도 불러 올 수 있어요.
import { Login, Signup, PostDetail, PostList, PostWrite } from "../pages";
import Search from "./Search";
import Notification from "../pages/Notification";

import {Header} from "../components";
import { Grid, Button } from "../elements";

import { useDispatch } from "react-redux";
import { actionCreators as userActions } from "../redux/modules/user";

import { apiKey } from "./firebase";
import { Route } from "react-router-dom";

import Permit from "./Permit";

function App() {
  const dispatch = useDispatch();

  const _session_key = `firebase:authUser:${apiKey}:[DEFAULT]`;
  const is_session = sessionStorage.getItem(_session_key) ? true : false;

  React.useEffect(() => {
    if (is_session) {
      dispatch(userActions.loginCheckFB());
    }
  }, []);

  return (
    <React.Fragment>
      <Grid>
        {/* connectedrouter로 리덕스와 컴포넌트를 묶어줄거예요. 여기 들어가는 history는 우리가 만든 커스텀 history예요. */}
        <ConnectedRouter history={history}>
          <Header></Header>
          {/* 아직 목록 페이지가 없으니, 루트 경로(/)는 Login을 엮어줄게요! */}
          <Route path="/" exact component={PostList} />
          <Route path="/login" exact component={Login} />
          <Route path="/signup" exact component={Signup} />
          <Route path="/write" exact component={PostWrite} />
          <Route path="/write/:id" exact component={PostWrite} />
          <Route path="/post/:id" exact component={PostDetail}/>
          <Route path="/search" exact component={Search} />
          <Route path="/noti" exact component={Notification} />
        </ConnectedRouter>
      </Grid>
      <Permit>
        <Button
          is_float
          _onClick={() => {
            history.push("/write");
          }}
        >
          +
        </Button>
      </Permit>
    </React.Fragment>
  );
}

export default App;
