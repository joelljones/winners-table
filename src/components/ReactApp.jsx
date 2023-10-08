import { useEffect, useState } from "react";

function ReactApp() {
  const [matchesByLeague, setMatchesByLeague] = useState({
    today: {},
    tomorrow: {},
  });

  function getTodaysDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");

    return `${year}${month}${day}`;
  }

  const todaysDate = getTodaysDate();

  function getTomorrowsDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
    const day = tomorrow.getDate().toString().padStart(2, "0");

    return `${year}${month}${day}`;
  }

  const tomorrowsDate = getTomorrowsDate();

  async function getFetch(date) {
    try {
      console.log(`Fetching data for date: ${date}`);
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${date}`,
      );
      const data = await res.json();
      console.log("Data:", data);

      function Match(
        league,
        leagueName,
        formattedTime,
        homeTeamForm,
        homeTeam,
        awayTeam,
        awayTeamForm,
        winner,
        homeTeamWins,
        awayTeamWins,
        record,
        odds,
      ) {
        this.league = league;
        this.leagueName = leagueName;
        this.formattedTime = formattedTime;
        this.homeTeamForm = homeTeamForm;
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        this.awayTeamForm = awayTeamForm;
        this.winner = winner;
        this.homeTeamWins = homeTeamWins;
        this.awayTeamWins = awayTeamWins;
        this.record = record;
        this.odds = odds;
      }

      const winnersTable = [];

      for (const event of data.events) {
        const league = event.season.type;
        const leagueName = event.season.slug;
        const excludedLeagues = [
          "2023-ncaa-division-i-men",
          "2023-ncaa-division-i-women",
          "2023-24-russian-premier-league",
        ];

        const matchTime = event.date;
        const utcTime = new Date(matchTime);
        const options = {
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
        };
        const formattedTime = utcTime.toLocaleString("en-US", options);

        const homeTeamLogo = event.competitions[0].competitors[0].team.logo;
        const homeTeam = event.competitions[0].competitors[0].team.name;
        let homeTeamForm = "";
        if (event.competitions[0].competitors[0].form !== undefined) {
          homeTeamForm = event.competitions[0].competitors[0].form;
        }
        const homeTeamWins = [...homeTeamForm].filter(
          (char) => char.toLowerCase() === "w",
        ).length;

        const awayTeamLogo = event.competitions[0].competitors[1].team.logo;
        const awayTeam = event.competitions[0].competitors[1].team.name;
        let awayTeamForm = "";
        if (event.competitions[0].competitors[1].form) {
          awayTeamForm = event.competitions[0].competitors[1].form;
        }
        const awayTeamWins = [...awayTeamForm].filter(
          (char) => char.toLowerCase() === "w",
        ).length;

        let winner = "";
        if (
          (homeTeamWins >= 3 &&
            awayTeamWins <= 2 &&
            homeTeamWins - awayTeamWins >= 3) ||
          (homeTeamWins === 5 && awayTeamWins <= 3)
        ) {
          winner = homeTeam;
        }

        if (
          (awayTeamWins >= 3 &&
            homeTeamWins <= 2 &&
            awayTeamWins - homeTeamWins >= 3) ||
          (awayTeamWins === 5 && homeTeamWins <= 3)
        ) {
          winner = awayTeam;
        }

        const record = `${homeTeamWins}-${awayTeamWins}`;

        let odds = "";
        if (
          event.competitions[0].odds &&
          event.competitions[0].odds[0] &&
          event.competitions[0].odds[0].details !== undefined
        ) {
          odds = event.competitions[0].odds[0].details;
        }

        const matchObject = new Match(
          `${league}`,
          `${leagueName}`,
          `${formattedTime}`,
          `${homeTeamForm}`,
          `${homeTeam}`,
          `${awayTeam}`,
          `${awayTeamForm}`,
          `${winner}`,
          `${homeTeamWins}`,
          `${awayTeamWins}`,
          `${record}`,
          `${odds}`,
        );

        if (!excludedLeagues.includes(leagueName) && winner) {
          winnersTable.push(matchObject);
        }
      }

      const matchesByLeague = {};
      for (const match of winnersTable) {
        if (!matchesByLeague[match.league]) {
          matchesByLeague[match.league] = [];
        }
        matchesByLeague[match.league].push(match);
      }

      return matchesByLeague;
    } catch (err) {
      console.log(`error ${err}`);
      return null;
    }
  }

  useEffect(() => {
    console.log("Calling getFetch for today");
    getFetch(todaysDate).then((matches) => {
      setMatchesByLeague((prevState) => ({ ...prevState, today: matches }));
    });

    console.log("Calling getFetch for tomorrow");
    getFetch(tomorrowsDate).then((matches) => {
      setMatchesByLeague((prevState) => ({ ...prevState, tomorrow: matches }));
    });
  }, [todaysDate, tomorrowsDate]);

  // const todayOrTomorrow = (
  //   todaysDate === getTodaysDate() ? <div>TODAY</div> :
  //   tomorrowsDate === getTomorrowsDate() ? <div>TOMORROW</div> : null
  // );

  return (
    <div>
      {/* {todayOrTomorrow} */}
      {Object.entries(matchesByLeague).map(([key, matches], index) => (
        <div key={index}>
          <h2>{key === "today" ? "Today" : "Tomorrow"}</h2>
          {matches &&
            Object.entries(matches).map(([league, matches], index) => (
              <div key={index}>
                <h3>{matches[0].leagueName}</h3>
                {matches.map((match, matchIndex) => (
                  <div key={matchIndex}>
                    <div>
                      {match.formattedTime} : {match.homeTeamForm}{" "}
                      {match.homeTeam} vs {match.awayTeam} {match.awayTeamForm}{" "}
                      --- {match.winner} {match.record} {match.odds}
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default ReactApp;
