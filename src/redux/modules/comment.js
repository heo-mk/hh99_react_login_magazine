import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, realtime } from "../../shared/firebase";
import "moment";
import moment from "moment";
import { actionCreators as postActions } from "./post";
import firebase from "firebase/app";


const SET_COMMENT = "SET_COMMENT";
const ADD_COMMENT = "ADD_COMMENT"; 

const LOADING = "LOADING";

const setComment = createAction(SET_COMMENT, (post_id, comment_list) => ({post_id, comment_list}));
const addComment = createAction(ADD_COMMENT, (post_id, comment) => ({post_id, comment}));

const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
  list: {},
  is_loading: false,
};

const getCommentFB = (post_id) => {
    return function(dispatch, getState, {history}){
      if(!post_id){
        return;
      }
      const commentDB = firestore.collection("comment");

      commentDB
        .where("post_id", "==", post_id)
        .orderBy("insert_dt", "desc")
        .get()
        .then((docs) => {
          let list = [];

          docs.forEach((doc) => {
            list.push({...doc.data(), id: doc.id});
          })

          dispatch(setComment(post_id, list));
        }).catch(err => {
          console.log('댓글 정보를 가져올 수가 없네요!', err);
        });
    };
};

const addCommentFB = (post_id, contents) => {
  return function (dispatch, getState, { history }) {
    const commentDB = firestore.collection("comment");
    const user_info = getState().user.user;

    let comment = {
      post_id: post_id,
      user_id: user_info.uid,
      user_name: user_info.user_name,
      user_profile: user_info.user_profile,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
    };

    // firestore에 코멘트 정보를 넣어요!
    commentDB.add(comment).then((doc) => {
      const postDB = firestore.collection("post");
      comment = { ...comment, id: doc.id };

      const post = getState().post.list.find((l) => l.id === post_id);

      //   firestore에 저장된 값을 +1해줍니다!
      const increment = firebase.firestore.FieldValue.increment(1);
      
      // post에도 comment_cnt를 하나 플러스 해줍니다.
      postDB
        .doc(post_id)
        .update({ comment_cnt: increment })
        .then((_post) => {

          dispatch(addComment(post_id, comment));
          // 리덕스에 post가 있을 때만 post의 comment_cnt를 +1해줍니다.
          if (post) {
            dispatch(
              postActions.editPost(post_id, {
                comment_cnt: parseInt(post.comment_cnt) + 1,
              })
            );

            const _noti_item = realtime.ref(`noti/${post.user_info.user_id}/list`).push();  // /list에다 알림 내역 저장
            _noti_item.set({
              post_id: post.id,
              user_name: comment.user_name,
              image_url: post.image_url,
              insert_dt: comment.insert_dt
            }, (err) => {
              if(err){
                console.log("알림 저장 실패했습니다! 헐!");
              }else{
                const notiDB = realtime.ref(`noti/${post.user_info.user_id}`);

                notiDB.update({read: false}); 
              } 
            });
          };
        } 
      );
    });
  };
}


export default handleActions(
  {
      [SET_COMMENT]: (state, action) => produce(state, (draft) => {
        draft.list[action.payload.post_id] = action.payload.comment_list;
      }),

      [ADD_COMMENT]: (state, action) => produce(state, (draft) => {
        draft.list[action.payload.post_id].unshift(action.payload.comment);
      }),

      [LOADING]: (state, action) => 
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      })      
  },
  initialState
);

const actionCreators = {
  getCommentFB,
  setComment,
  addComment,
  addCommentFB
};

export { actionCreators };