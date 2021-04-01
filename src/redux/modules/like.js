import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, storage } from "../../shared/firebase";
// 리얼타임 데이터 베이스
import {firebase, realtime} from "../../shared/firebase"

// 시간체크용 모멘트
import "moment";
import moment from "moment";

//파이어베이스
import firebase from "firebase/app";

// 리덕스
import { actionCreators as postActions } from './post';

// 액션 타입부터 정해줍니다!
const ADD_LIKE = "ADD_LIKE";
const REMOVE_LIKE = "REMOVE_USER";
const GET_LIKE = "GET_LIKE";

// 액션 생성 함수를 만들어요.
//  redux-actions의 createAction을 사용해서 만들어줍니다.
const addLike = createAction(ADD_LIKE, (like) => ({ like }));
const removeLike = createAction(REMOVE_LIKE, (like) => ({ like }));
const getLike = createAction(GET_LIKE, (like) => ({ like }));

// initialState를 만듭니다.
// 기본 값을 미리 정해주는거예요.
// 좋아요의 초기값을 0으로 정해주기.
const initialState = {
  like: 0,
};
// 여기까진 OK!

// 미들웨어(액션이 일어나고 -> 리듀서 내의 어떤 로직이 실행되기 사이의 중간다리 역할을 해줄 함수들)을 작성합니다!
// 좋아요 데이터를 파이어베이스에 저장하고 가져오기
// 좋아요 하나 더하기 - 그 데이터 파이어베이스에 저장
const addLikeFB = (user_id, post_id) => {
  return funcion (dispatch, getState, {history}){
    
    const postDB = firestore.collection('post');
    const user_info = getState().user.user;   // 리덕스 유저 정보 가져오기
    const post = getState().post.list.find(l => l.id === post_id); // 해당 포스트 정보 가져오기
    const like_cnt = post.like_cnt;

    const increment = firebase.firestore.Field

  }  
}

// 좋아요 하나 줄이기 - 그 데이터 파이어베이스에 저장
const removeLikeFB = (id, pwd, user_name) => {
  // return function (dispatch, getState, { history }) {

};

// 좋아요 갯수를 파이어베이스에서 가져오기
const getLikeFB = () => {
  
};


// reducer
export default handleActions(
  {
    [ADD_LIKE]: (state, action) =>
      produce(state, (draft) => {
        draft.user = action.payload.user;
        draft.is_login = true;
      }),
    [REMOVE_LIKE]: (state, action) =>
      produce(state, (draft) => {
        draft.user = null;
        draft.is_login = false;
      }),
    [GET_LIKE]: (state, action) => produce(state, (draft) => {}),
  },
  initialState
);

// 만든 액션생성자들(+중간다리들)을 외부에서 호출할 수 있도록 내보내줍니다. 내보낼 필요가 없는 건 굳이 내보내지 않아도 괜찮아요!
const actionCreators = {
  addLike,
  removeLike,
  getLike,
  addLikeFB,
  removeLikeFB,
  getLikeFB,
};

export { actionCreators };
