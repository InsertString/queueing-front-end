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

  const [formData, setFormData] = useState({
    team: "",
    rule: "",
    sev: "Minor",
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
      <div>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col space-y-4 justify-center">
            <div className="divider divider-error text-xl mb-2 font-bold">
              Add Violations
            </div>
            <select
              className="select select-bordered w-full"
              onChange={(e) =>
                setFormData({ ...formData, team: e.target.value })
              }
              defaultValue="Team"
            >
              <option disabled>Team</option>
              {teams.map((team) => {
                return <option value={team.number}> {team.number} </option>;
              })}
            </select>
            <div className="flex flex-row space-x-4">
              <select
                className="select select-bordered w-full"
                onChange={(e) =>
                  setFormData({ ...formData, rule: e.target.value })
                }
                defaultValue="Rule"
              >
                <option disabled>Rule</option>
                {RULES.map((rule) => {
                  return <option value={rule.ruleId}> {rule.ruleId} </option>;
                })}
              </select>
              <select
                className="select select-bordered w-full"
                onChange={(e) =>
                  setFormData({ ...formData, sev: e.target.value })
                }
                defaultValue="Minor"
              >
                <option disabled>Severity</option>
                <option value="Minor"> Minor </option>;
                <option value="Major"> Major </option>;
              </select>
              <button
                className="btn btn-error btn-outline"
                type="submit"
                disabled={
                  formData.team === "" ||
                  formData.rule === "" ||
                  formData.sev === ""
                }
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </div>
      <div>
        <form>
          <div className="flex flex-col space-y-4 justify-center">
            <div className="divider divider-error text-xl mb-2 font-bold">
              View Violations
            </div>
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
        <table className="table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Rule</th>
              <th>Type</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody hidden={formData.index == "All"}>
            {violations
              .filter((t) => t.number === formData.index)
              .map((team) => (
                <tr>
                  <td>
                    <b>{team.number}</b>
                  </td>
                  <td>
                    <b>{team.ruleId}</b>
                  </td>
                  <td
                    style={{
                      color: team.severity === "Major" ? "#de6057" : "#ebb31a",
                    }}
                  >
                    <b>{team.severity}</b>
                  </td>

                  <td>
                    <button
                      className="btn btn-square btn-outline btn-error btn-sm"
                      onClick={() =>
                        RemoveViolation(team.number, team.ruleId, team.severity)
                      }
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
          <tbody hidden={formData.index !== "All"}>
            {violations.map((team) => (
              <tr>
                <td>
                  <b>{team.number}</b>
                </td>
                <td>
                  <b>{team.ruleId}</b>
                </td>
                <td
                  style={{
                    color: team.severity === "Major" ? "#de6057" : "#ebb31a",
                  }}
                >
                  <b>{team.severity}</b>
                </td>
                <td>
                  <button
                    className="btn btn-square btn-outline btn-error btn-sm"
                    onClick={() =>
                      RemoveViolation(team.number, team.ruleId, team.severity)
                    }
                  >
                    {" "}
                    ✖
                  </button>
                </td>
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
