import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { ENDPOINT, WEBSOCKET_ENDPOINT } from "./constants";

const RULES = [
  { ruleId: "S1" },
  { ruleId: "S2" },
  { ruleId: "S3" },
  { ruleId: "S4" },
  { ruleId: "G1" },
  { ruleId: "G2" },
  { ruleId: "G3" },
  { ruleId: "G4" },
  { ruleId: "G5" },
  { ruleId: "G6" },
  { ruleId: "G7" },
  { ruleId: "G8" },
  { ruleId: "G9" },
  { ruleId: "G10" },
  { ruleId: "G11" },
  { ruleId: "G12" },
  { ruleId: "G13" },
  { ruleId: "G14" },
  { ruleId: "G15" },
  { ruleId: "G16" },
  { ruleId: "G17" },
  { ruleId: "SG1" },
  { ruleId: "SG2" },
  { ruleId: "SG3" },
  { ruleId: "SG4" },
  { ruleId: "SG5" },
  { ruleId: "SG6" },
  { ruleId: "SG7" },
  { ruleId: "SG8" },
  { ruleId: "SG9" },
  { ruleId: "SG10" },
  { ruleId: "SG11" },
];

const RefereePage = () => {
  const [teams, setTeams] = useState([]);

  const { lastJsonMessage: data } = useWebSocket(
    `${WEBSOCKET_ENDPOINT}/queue`,
    {
      shouldReconnect: () => true,
    }
  );

  const [violations, setViolations] = useState([]);
  const [uniques, setUniques] = useState([]);

  const [formData, setFormData] = useState({
    team: "",
    rule: "",
    sev: "",
    index: "All",
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
    }
  }, [data]);

  // when the submit button is pressed
  const onSubmit = async (e) => {
    e.preventDefault();
    // check for three minor violations
    //for loop to count all violations that match the form data
    const i = violations.filter(
      (t) =>
        t.number === formData.team &&
        t.ruleId === formData.rule &&
        t.severity === formData.sev
    );
    // prompt for confirmation
    if (
      window.confirm(
        `Add ${formData.sev} ${formData.rule} violation for ${formData.team}\n${formData.team} has ${i.length} total violations of this type`
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

  const displayTable = (e) => {
    e.preventDefault();
    setFormData({ ...formData, index: e.target.value });
    console.log(formData.index);
  };

  const RemoveViolation = async (team, rule, severity) => {
    // count number of violations
    const i = violations.filter(
      (t) => t.number === team && t.ruleId === rule && t.severity === severity
    );
    // prompt for confirmation
    if (
      window.confirm(
        `Remove ${severity} ${rule} violation for ${team}\n${team} has ${i.length} total violations of this type`
      )
    ) {
      // create output object
      const out = {
        team: team,
        rule: rule,
        severity: severity,
      };
      const res = await fetch(`${ENDPOINT}/remove_violation`, {
        method: "POST",
        body: JSON.stringify(out),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-10">
        <form onSubmit={onSubmit}>
          <h1 className="text-xl mb-2 font-bold"> Add Violations </h1>
          <div>
            <select
              className="select select-bordered w-full"
              onChange={(e) =>
                setFormData({ ...formData, team: e.target.value })
              }
              defaultValue="Team"
            >
              <option disabled selected>
                Team
              </option>
              {teams.map((team) => {
                return <option value={team.number}> {team.number} </option>;
              })}
            </select>
          </div>
          <div>
            <select
              className="select select-bordered w-full"
              onChange={(e) =>
                setFormData({ ...formData, rule: e.target.value })
              }
              defaultValue="Rule"
            >
              <option disabled selected>
                Rule
              </option>
              {RULES.map((rule) => {
                return <option value={rule.ruleId}> {rule.ruleId} </option>;
              })}
            </select>
          </div>
          <div>
            <select
              className="select select-bordered w-full"
              onChange={(e) =>
                setFormData({ ...formData, sev: e.target.value })
              }
              defaultValue="Severity"
            >
              <option disabled selected>
                Severity
              </option>
              <option value="Minor"> Minor </option>;
              <option value="Major"> Major </option>;
            </select>
          </div>
          <div>
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
      </div>
      <div>
        <form>
          <h1 className="text-xl mb-2 font-bold"> Violations By Team </h1>
          <div className="flex flex-row">
            <select
              className="select select-bordered w-full"
              onChange={displayTable}
              defaultValue="All"
            >
              <option> All </option>
              {teams.map((team) => {
                if (
                  violations.filter((t) => t.number === team.number).length > 0
                ) {
                  return <option value={team.number}>{team.number}</option>;
                }
              })}
            </select>
          </div>
        </form>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th> Team </th> <th> Violation </th>
            </tr>
          </thead>
          <tbody hidden={formData.index == "All"}>
            {violations
              .filter((t) => t.number === formData.index)
              .map((team) => (
                <tr>
                  <td> {team.number} </td> <td> {team.ruleId} </td>
                  <td> {team.severity} </td>
                  <button
                    className="btn btn-square btn-outline btn-error"
                    onClick={() =>
                      RemoveViolation(team.number, team.ruleId, team.severity)
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </tr>
              ))}
          </tbody>
          <tbody hidden={formData.index !== "All"}>
            {violations.map((team) => (
              <tr>
                <td> {team.number} </td> <td> {team.ruleId} </td>
                <td> {team.severity} </td>
                <button
                  className="btn btn-square btn-outline btn-error"
                  onClick={() =>
                    RemoveViolation(team.number, team.ruleId, team.severity)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RefereePage;

/*
      <label className="text-xl mb-2 font-bold">Veiw Violations</label>
<ol className="list">
        
      </ol>

*/
