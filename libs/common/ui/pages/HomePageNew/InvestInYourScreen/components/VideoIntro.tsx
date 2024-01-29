import React, { FC, memo, useEffect, useRef, useState } from "react";
import animationData from "../resources/buttonData/button_dark_slow.json";
import animationDataWhite from "../resources/buttonData/button_White_slow.json";
import { Modal } from "react-bootstrap";
import VideoModal from "./VideoModal/VideoModal";
import style from "./VideoIntro.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import YouTube from "react-youtube";
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });



interface IVideoModal {
  url: string;
}

const VideoIntro: FC<IVideoModal> = ({ url }) => {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [widthWindow, setWidthWindow] = useState<number | null>(null);
  let videoCode = url.split("=")[1];

  const playerRef = useRef<any>(null);

  useEffect(() => {
    // On mount, start video playback
    if (playerRef.current) {
      playerRef.current?.internalPlayer?.playVideo();
    }
  }, []);

  const theme = useSelector(
    (state: RootState) => state.app.appReducer.appTheme
  );

  useEffect(() => {
    const handleResize = (event: any) => {
      setWidthWindow(event.target.innerWidth);
    };
    setWidthWindow(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isTabletOrMob = widthWindow !== null && widthWindow <= 996;

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: theme === "theme-light" ? animationDataWhite : animationData,
    style: {
      width: isTabletOrMob ? 100 : 120,
      height: isTabletOrMob ? 100 : 120,
      cursor: "pointer",
    },
  };

  const handlerClick = () => {
    setOpenModal(true);
  };

  const View = <Lottie {...defaultOptions} />;

  return (
    <>
      <div onClick={handlerClick}>{View}</div>

      {openModal ? (
        <VideoModal onOpenModal={setOpenModal} topCloseAsset>
          <div>
            {/* <iframe
              width="100%"
              height="90vh"
              className={style.frame}
              src={`https://www.youtube.com/embed/${videoCode}?autoplay=1`}
              allow="autoplay"
              //   allowFullScreen
            ></iframe> */}
            <YouTube
              videoId={videoCode}
              className={style.frame}
              opts={{
                
                width: "100%",
                height: "100%",
                playerVars: {
                  
                  autoplay: 1,
                  mute:1
                },
              }}
              
              onReady={(event) => {
                // Save a reference to the player
                playerRef.current = event.target;
              }}
            />
          </div>
        </VideoModal>
      ) : null}
    </>
  );
};

export default memo(VideoIntro);
