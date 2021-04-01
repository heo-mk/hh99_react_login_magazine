import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, storage } from "../../shared/firebase";
import "moment";
import moment from "moment";

import { actionCreators as imageActions } from "./image";
import _, { create } from "lodash";

const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";
const DELETE_POST = "DELETE_POST";
const LOADING = "LOADING";

// 좋아요 토글액션
const LIKE_TOGGLE = "LIKE_TOGGLE";

const setPost = createAction(SET_POST, (post_list, paging) => ({ post_list, paging }));
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const deletePost  = createAction(DELETE_POST, (post_id) => ({post_id}));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));
// 좋아요 토글 액션생성자
const likeToggle = createAction(LIKE_TOGGLE, (post_id, is_like=null) => ({post_id, is_like}));

const initialState = {
  list: [],
  paging: { start: null, next: null, size: 3 },
  is_loading: false,
};

const initialPost = {
  // id: 0,
  // user_info: {
  //   user_name: "mean0",
  //   user_profile: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  // },
  image_url: "https://mean0images.s3.ap-northeast-2.amazonaws.com/4.jpeg",
  contents: "",
  comment_cnt: 0,
  like_cnt: 0,
  is_like: false,
  insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
};

const editPostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요!");
      return;
    }

    const _image = getState().image.preview;

    const _post_idx = getState().post.list.findIndex((p) => p.id === post_id);
    const _post = getState().post.list[_post_idx];

    console.log(_post);

    const postDB = firestore.collection("post");

    if (_image === _post.image_url) {
      postDB
        .doc(post_id)
        .update(post)
        .then((doc) => {
          dispatch(editPost(post_id, { ...post }));
          history.replace("/");
        });

      return;
    } else {
      const user_id = getState().user.user.uid;
      const _upload = storage
        .ref(`images/${user_id}_${new Date().getTime()}`)
        .putString(_image, "data_url");

      _upload.then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            console.log(url);

            return url;
          })
          .then((url) => {
            postDB
              .doc(post_id)
              .update({ ...post, image_url: url })
              .then((doc) => {
                dispatch(editPost(post_id, { ...post, image_url: url }));
                history.replace("/");
              });
          })
          .catch((err) => {
            window.alert("앗! 이미지 업로드에 문제가 있어요!");
            console.log("앗! 이미지 업로드에 문제가 있어요!", err);
          });
      });
    }
  };
};

const addPostFB = (contents = "", layout_type= "") => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");

    const _user = getState().user.user;

    const user_info = {
      // 유저정보는 리덕스에서 가져오기
      user_name: _user.user_name,
      user_id: _user.uid,
      user_profile: _user.user_profile,
    };

    const _post = {
      ...initialPost,
      contents: contents,
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
      layout_type: layout_type, // 리덕스에 추가된 값을 파이어스토어에 넣기
    };

    const _image = getState().image.preview;

    console.log(_image);
    console.log(typeof _image);

    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
      .putString(_image, "data_url");

    _upload.then((snapshot) => {
      snapshot.ref
        .getDownloadURL()
        .then((url) => {
          console.log(url);

          return url;
        })
        .then((url) => {
          postDB
            .add({ ...user_info, ..._post, image_url: url })
            .then((doc) => {
              let post = { user_info, ..._post, id: doc.id, image_url: url };
              dispatch(addPost(post));
              history.replace("/");

              dispatch(imageActions.setPreview(null));
            })
            .catch((err) => {
              window.alert("앗! 포스트 작성에 문제가 있어요!");
              console.log("post 작성에 실패했어요!", err);
            });
        })
        .catch((err) => {
          window.alert("앗! 이미지 업로드에 문제가 있어요!");
          console.log("앗! 이미지 업로드에 문제가 있어요!", err);
        });
    });
  };
};

// 게시글 삭제 미들웨어, id값으로 판단해서 지운다.
const deletePostFB = (id) => {
  return function (dispatch, getState, { history }) {
    // id가 없음 리턴!
    if(!id) {
      window.alert("게시글을 삭제할 권한이 없습니다!")
      return;
    }

    const postDB = firestore.collection("post");
    // 게시글을 id로 선택해 삭제!
    
    postDB
      .doc(id)
      .delete()
      .then((les) => {
        dispatch(deletePost(id));
        history.replace("/");
      })
      .catch((err) => {
        console.log(err);
      })
    }
  }

const getPostFB = (start = null, size = 3) => {
  return function (dispatch, getState, { history }) {

    let _paging = getState().post.paging;

    if(_paging.start && !_paging.next){
      return;
    }

    dispatch(loading(true));
    const postDB = firestore.collection("post");

    let query = postDB.orderBy("insert_dt", "desc");

    if(start){
      query = query.startAt(start);
    }


    query
      .limit(size + 1)
      .get()
      .then((docs) => {
        let post_list = [];

        let paging = {
          start: docs.docs[0],
          next: docs.docs.length === size+1? docs.docs[docs.docs.length -1] : null,
          size: size,
        }

        docs.forEach((doc) => {
          let _post = doc.data();

          // ['commenct_cnt', 'contents', ..]
          let post = Object.keys(_post).reduce(
            (acc, cur) => {
              if (cur.indexOf("user_") !== -1) {
                return {
                  ...acc,
                  user_info: { ...acc.user_info, [cur]: _post[cur] },
                };
              }
              return { ...acc, [cur]: _post[cur] };
            },
            { id: doc.id, user_info: {} }
          );

          post_list.push(post);
        });

        if(paging.next) {
          post_list.pop();
        }

        // post_list.pop();
        // console.log(post_list);

        if(getState().user.user){
          dispatch(setIsLike(post_list, paging));
        }else{
          dispatch(setPost(post_list, paging));
        }
      });
  };
};


const toggleLikeFB = (post_id) => {
  return function (dispatch, getState, {history}) {
    if(!getState().user.user){
      return;
    }
  
  const postDB = firestore.collection('post');
  const likeDB = firestore.collection('like');  

  const _idx = getState().post.list.findIndex((p) => p.id === post_id);

  const _post = getState().post.list[_idx];

  const user_id = getState().user.user.uid;
  
  if(_post.is_like){
    likeDB
      .where("post_id", "==", _post.id)
      .where("user_id", "==", user_id)
      .get()
      .then((docs) => {

        let batch = firestore.batch();

        docs.forEach((doc) => {
          batch.delete(likeDB.doc(doc.id));
        });

        batch.update(postDB.doc(post_id), {
          like_cnt:
            _post.like_cnt - 1 < 1 ? _post.like_cnt : _post.like_cnt -1,
        });

        batch.commit().then(() => {
          dispatch(likeToggle(post_id, !_post.is_like));
        });
      })
      .catch((err) => {
        console.log(err);
      })
    } else{
      likeDB.add({post_id: post_id, user_id: user_id}).then(doc => {
        postDB.doc(post_id).update({like_cnt: _post.like_cnt + 1}).then(doc => {
          dispatch(likeToggle(post_id, !_post.is_like));
        });
      });
    }
  };
};

const setIsLike = (_post_list, paging) => {
  return function (dispatch, getState, {history}){
    if (!getState().user.is_login){
      return;
    }
    const likeDB = firestore.collection("like");
    const post_ids = _post_list.map((p) => p.id);
    let like_query = likeDB.where("post_id", "in", post_ids);

    like_query.get().then((like_docs) => {
      let like_list = {};
      like_docs.forEach((doc) => {
        if(like_list[doc.data().post_id]){
          like_list[doc.data().post_id] = [
            ...like_list[doc.data().post_id],
            doc.data().user_id,
          ];
        } else{
          like_list[doc.data().post_id] = [doc.data().user_id];
        }
      });

      const user_id = getState().user.user.uid;
      let post_list = _post_list.map((p) => {
        if(like_list[p.id] && like_list[p.id].indexOf(user_id) !== -1) {
          return {...p, is_like: true};
        }

        return p;
      });

      dispatch(setPost(post_list, paging));
    });
  }
};  

const getOnePostFB = (id) => {
  return function(dispatch, getState, {history}){
    const postDB = firestore.collection("post");
    postDB
      .doc(id)
      .get()
      .then((doc) => {
        console.log(doc);
        console.log(doc.data());

        let _post = doc.data();
        let post = Object.keys(_post).reduce(
          (acc, cur) => {
            if (cur.indexOf("user_") !== -1) {
              return {
                ...acc,
                user_info: { ...acc.user_info, [cur]: _post[cur] },
              };
            }
            return { ...acc, [cur]: _post[cur] };
          },
          { id: doc.id, user_info: {} }
        );

        // dispatch(setPost([post]));
        dispatch(setIsLike([post]));
      });
  }
}

// const deletePostFB = (id) => {

// }

export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.push(...action.payload.post_list);

        draft.list = draft.list.reduce((acc, cur) => {
          if(acc.findIndex(a => a.id === cur.id) === -1){
            return [...acc, cur];
          }else{
            acc[acc.findIndex((a) => a.id === cur.id)] = cur;
            return acc;
          }
        }, []);


        if(action.payload.paging){
          draft.paging = action.payload.paging;
        }
        
        draft.is_loading = false;
      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),

    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);

        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),

    [LOADING]: (state, action) => produce(state, (draft) => {
      draft.is_loading = action.payload.is_loading;
    }),

    [DELETE_POST]: (state, action) => produce(state, (draft) => {
      let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);

      if(idx !== -1){
        // 배열에서 idx 위치의 요소를 1개 지운다.
        draft.list.splice(idx, 1);
      }
        draft.is_loading = action.payload.is_loading;
      }),
    
    [LIKE_TOGGLE]: (state, action) =>
      produce(state, (draft) => {

        // 배열에서 몇 번째에 있는 지 찾은 다음, is_like를 action에서 가져온 값으로 바꾸기!
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
        
        draft.list[idx].is_like = action.payload.is_like;
      }),  
  },
  initialState
);

const actionCreators = {
  setPost,
  addPost,
  editPost,
  getPostFB,
  addPostFB,
  editPostFB,
  getOnePostFB,
  deletePostFB,
  toggleLikeFB,
};

export { actionCreators };
