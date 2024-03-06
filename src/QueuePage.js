import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import ReactTimeAgo from "react-time-ago";

import { WEBSOCKET_ENDPOINT } from "./constants";

const QueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState([]);
  const [flash, setFlash] = useState(false);
  const { lastJsonMessage: data } = useWebSocket(
    `${WEBSOCKET_ENDPOINT}/queue`,
    {
      shouldReconnect: () => true,
    }
  );

  let blinkInterval;

  const flashRed = () => {
    let count = 0;
    blinkInterval = setInterval(() => {
      setFlash(true);
      setTimeout(() => {
        setFlash(false);
      }, 400);
      if (count++ === 4) clearInterval(blinkInterval);
    }, 800);
  };

  useEffect(() => {
    if (data) {
      if (nowServing.length < data.nowServing.length) {
        flashRed();
      }
      setNowServing(data.nowServing);
      setQueue(data.queue);
    }
  }, [data]);

  return (
    <div className="flex flex-row space-x-12 max-h-[90vh]">
      <div className="w-[400px]">
        <p className="text-4xl font-bold mb-4"> Up Next </p>{" "}
        <div
          className="text-5xl font-bold p-4"
          style={{ backgroundColor: flash ? "transparent" : "#db0f00" }}
        >
          {" "}
          {nowServing.map((team, index) => (
            <p key={index} className="mb-1">
              <div className="flex flex-row">
                <div className="w-56"> {team.number} </div>{" "}
                <ReactTimeAgo date={team.at} locale="en-US" timeStyle="mini" />
              </div>{" "}
            </p>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      <div className="w-3/4">
        <p className="text-4xl font-bold mb-4"> Current Queue </p>{" "}
        <ol className="list-decimal text-3xl columns-3 px-8">
          {" "}
          {queue.map((team, index) => (
            <li key={index}> {team.number} </li>
          ))}{" "}
        </ol>{" "}
      </div>{" "}
    </div>
  );
};

export default QueuePage;
