import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { ENDPOINT, WEBSOCKET_ENDPOINT } from "./constants";

const KioskPage = () => {
  const [teams, setTeams] = useState([]);
  const { lastJsonMessage: data } = useWebSocket(
    `${WEBSOCKET_ENDPOINT}/queue`,
    {
      shouldReconnect: () => true,
    }
  );
  const [queued, setQueued] = useState([]);

  useEffect(() => {
    const getTeams = async () => {
      const res = await fetch(`${ENDPOINT}/teams`);
      const teamsData = await res.json();
      setTeams(teamsData);
    };
    getTeams();
  }, []);

  useEffect(() => {
    if (data) {
      setQueued([
        ...data.nowServing.map((t) => t.number),
        ...data.queue.map((t) => t.number),
      ]);
    }
  }, [data]);

  const handleClick = async (team) => {
    if (window.confirm(`Add team ${team} to the queue?`)) {
      const res = await fetch(`${ENDPOINT}/add`, {
        method: "POST",
        body: JSON.stringify({ team }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status !== 200) {
        window.alert(`${team} is already in queue`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-xl mb-2 font-bold"> Join the queue </p>{" "}
      <div className="flex flex-row flex-wrap w-full items-center">
        {" "}
        {teams.map((t) => (
          <div className="px-1 py-2 w-28" key={t.number}>
            <button
              className="btn btn-primary btn-lg w-full h-8"
              disabled={queued.includes(t.number)}
              onClick={() => handleClick(t.number)}
            >
              {t.number}{" "}
            </button>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
};

export default KioskPage;
