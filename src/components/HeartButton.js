import React from "react";
import {useState} from 'react'; 
import styled from "styled-components";

// 분홍 하트, 회색 하트 이미지 가져오기
import heart_pink from "../shared/heart_pink.png";
import heart_gray from "../shared/heart_gray.png";


// 하트 버튼은 일단 모양새만 잡아줄거예요!
const HeartButton = (props) => {
  
  const [btnChange, setBtnChange] = useState(false); //전체값 
  const changeHeart = () => {
    setBtnChange(!btnChange);
  }

  return (
  <React.Fragment>
      <Heart
        onClick={(e) => {
          if(btnChange === false) {
            changeHeart();
            e.preventDefault();
            e.stopPropagation();
          }else{
            changeHeart();
            e.preventDefault();
            e.stopPropagation();
          }
        }}>
        {btnChange === false? <img src={heart_gray}/> : <img src={heart_pink}/>}
      </Heart>
    </React.Fragment>
  );
};


  // return (
  //   <React.Fragment>
      

  //     <Heart onClick={() => {
        
  //     }}
  //     btnChange === false? icon_url={heart_gray}:icon_url={heart_gray}
  //     >
        

const Heart = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  background: url(${(props) => props.icon_url});
  background-size: cover;
  cursor: pointer;
`;

export default HeartButton;
