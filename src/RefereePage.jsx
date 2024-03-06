import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { ENDPOINT, WEBSOCKET_ENDPOINT } from "./constants";

const RULES = [{ ruleId: "G1" }, { ruleId: "SG1" }];

const RefereePage = () => {
  const [teams, setTeams] = useState([]);

  const { lastJsonMessage: data } = useWebSocket(
    `${WEBSOCKET_ENDPOINT}/queue`,
    {
      shouldReconnect: () => true,
    }
  );

  const [violations, setViolations] = useState([]);

  const [formData, setFormData] = useState({
    team: "",
    rule: "",
    sev: "",
  });

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
      setViolations(data.violations);
      console.log(data.violations);
      console.log(violations);
    }
  }, [data]);

  // when the submit button is pressed
  const onSubmit = async (e) => {
    // prevent reload of the browser
    e.preventDefault();
    // prompt for confirmation
    if (
      window.confirm(
        `Add ${formData.sev} ${formData.rule} violation for ${formData.team}`
      )
    ) {
      // create output object
      const out = {
        team: formData.team,
        rule: formData.rule,
        severity: formData.sev,
      };
      console.log(out);
      // send data to the server
      const res = await fetch(`${ENDPOINT}/add_violation`, {
        method: "POST",
        body: JSON.stringify(out),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={onSubmit}>
        <div className="flex flex-col items-center">
          <h1 className="text-xl mb-2 font-bold"> Add Violations </h1>
          <select
            className="select select-bordered w-full"
            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
            defaultValue="Team"
          >
            <option disabled selected>
              Team
            </option>
            {teams.map((team) => {
              return <option value={team.number}>{team.number}</option>;
            })}
          </select>
          <select
            className="select select-bordered w-full"
            onChange={(e) => setFormData({ ...formData, rule: e.target.value })}
            defaultValue="Rule"
          >
            <option disabled selected>
              Rule
            </option>
            {RULES.map((rule) => {
              return <option value={rule.ruleId}>{rule.ruleId}</option>;
            })}
          </select>
          <select
            className="select select-bordered w-full"
            onChange={(e) => setFormData({ ...formData, sev: e.target.value })}
            defaultValue="Severity"
          >
            <option disabled selected>
              Severity
            </option>
            <option value="Minor">Minor</option>;
            <option value="Major">Major</option>;
          </select>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={
              formData.team === "" ||
              formData.rule === "" ||
              formData.sev === ""
            }
          >
            Submit
          </button>
        </div>
      </form>
      <div className="flex flex-col items-center"></div>
      <label className="text-xl mb-2 font-bold">Veiw Violations</label>
      <ol className="list">
        {violations.map((team) => (
          <li>
            {team.number} {team.ruleId} {team.severity}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RefereePage;
