// TODAY
//  get & format today's date
function getTodaysDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  return `${year}${month}${day}`;
}
const todaysDate = getTodaysDate();

// TOMORROW
//  get & format tomorrow's date
function getTomorrowsDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
  const day = tomorrow.getDate().toString().padStart(2, "0");

  return `${year}${month}${day}`;
}
const tomorrowsDate = getTomorrowsDate();

const date = todaysDate;

// FETCH
fetch(
  `https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${date}`,
)
  .then((res) => res.json()) // parse response as JSON
  .then((data) => {
    // TODAY OR TOMORROW
    date === todaysDate ? console.log("TODAY") : console.log("TOMORROW");

    // MATCH OBJECT CONSTRUCTOR
    function Match(
      league,
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

    // loop through events
    for (const event of data.events) {
      // LEAGUE
      const league = event.season.slug;
      const excludedLeagues = [
        "2023-ncaa-division-i-men",
        "2023-ncaa-division-i-women",
      ];

      // TIME
      const matchTime = event.date;
      const utcTime = new Date(matchTime);
      const options = {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
      };
      const formattedTime = utcTime.toLocaleString("en-US", options);

      // EVENT NAME
      const eventName = event.name;

      // HOME TEAM
      const homeTeamLogo = event.competitions[0].competitors[0].team.logo;
      const homeTeam = event.competitions[0].competitors[0].team.name;
      let homeTeamForm = "";
      if (event.competitions[0].competitors[0].form !== undefined) {
        homeTeamForm = event.competitions[0].competitors[0].form;
      }
      const homeTeamWins = [...homeTeamForm].filter(
        (char) => char.toLowerCase() === "w",
      ).length;

      // AWAY TEAM
      const awayTeamLogo = event.competitions[0].competitors[1].team.logo;
      const awayTeam = event.competitions[0].competitors[1].team.name;
      let awayTeamForm = "";
      if (event.competitions[0].competitors[1].form) {
        awayTeamForm = event.competitions[0].competitors[1].form;
      }
      const awayTeamWins = [...awayTeamForm].filter(
        (char) => char.toLowerCase() === "w",
      ).length;

      // PROJECTED WINNER
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

      // RECORD
      const record = `${homeTeamWins}-${awayTeamWins}`;

      // ODDS
      let odds = "";
      if (
        event.competitions[0].odds &&
        event.competitions[0].odds[0] &&
        event.competitions[0].odds[0].details !== undefined
      ) {
        odds = event.competitions[0].odds[0].details;
      }

      // MATCH OBJECT
      const matchObject = new Match(
        `${league}`,
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

      // if league is not excluded & there is a winner, push match info to winnersTable array
      if (!excludedLeagues.includes(league) && winner) {
        winnersTable.push(matchObject);
      }
    }
    // TABLE TO BE PRINTED TO CONSOLE
    const tableToPrint = winnersTable.map(
      ({
        league,
        formattedTime,
        homeTeamForm,
        homeTeam,
        awayTeam,
        awayTeamForm,
        winner,
        record,
        odds,
      }) => {
        return {
          league,
          formattedTime,
          homeTeamForm,
          homeTeam,
          awayTeam,
          awayTeamForm,
          winner,
          record,
          odds,
        };
      },
    );

    // console.table
    console.table(tableToPrint);
  })
  .catch((err) => {
    console.log(`error ${err}`);
  });
