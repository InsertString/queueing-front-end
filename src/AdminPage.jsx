import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import ReactTimeAgo from "react-time-ago";

import { WEBSOCKET_ENDPOINT, ENDPOINT } from "./constants";

const AdminPage = () => {
  const [queue, setQueue] = useState([]);
  const [nowServing, setNowServing] = useState([]);
  const { lastJsonMessage: data } = useWebSocket(
    `${WEBSOCKET_ENDPOINT}/queue`,
    {
      shouldReconnect: () => true,
    }
  );

  const handleNext = async () => {
    await fetch(`${ENDPOINT}/serve`, { method: "POST" });
  };

  const handleRemove = async (team) => {
    await fetch(`${ENDPOINT}/remove`, {
      method: "POST",
      body: JSON.stringify({ team }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleBack = async (team) => {
    await fetch(`${ENDPOINT}/unserve`, {
      method: "POST",
      body: JSON.stringify({ team }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  useEffect(() => {
    if (data) {
      setNowServing(data.nowServing);
      setQueue(data.queue);
    }
  }, [data]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Backspace") {
        handleNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-row space-x-12 max-h-[90vh]">
      <div className="w-[400px] space-y-4">
        <p className="text-4xl font-bold mb-4">Up Next</p>
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={handleNext}
        >
          Add team to Up Next (⌫)
        </button>
        <div
          className="text-2xl font-bold p-4"
          style={{ backgroundColor: "#db0f00" }}
        >
          {nowServing.map((team, index) => (
            <p key={index} className="mb-1">
              <div className="flex flex-row">
                <div className="w-32">{team.number}</div>
                <div className="w-24">
                  <ReactTimeAgo
                    date={team.at}
                    locale="en-US"
                    timeStyle="mini"
                  />
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleRemove(team.number)}
                >
                  Remove
                </button>
                <button
                  className="btn btn-primary btn-sm ml-2"
                  onClick={() => handleBack(team.number)}
                >
                  Move back
                </button>
              </div>
            </p>
          ))}
        </div>
      </div>
      <div className="w-3/4">
        <p className="text-4xl font-bold mb-4">Current Queue</p>
        <ol className="list-decimal text-xl columns-3 px-8">
          {queue.map((team, index) => (
            <div key={index} className="flex flex-row mb-2">
              <li className="w-24">{team.number}</li>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleRemove(team.number)}
              >
                Remove
              </button>
            </div>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default AdminPage;
