import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:provider/provider.dart';

class ResultsPage extends StatefulWidget {
  @override
  _ResultsPageState createState() => _ResultsPageState();
}

class _ResultsPageState extends State<ResultsPage> {
  List<League> leagues = [];
  bool loading = false;
  League? selectedLeague;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    setState(() {
      loading = true;
    });

    try {
      final leaguesResponse = await http.get(Uri.parse('http://127.0.0.1:8000//api/leagues/'));
      final teamsResponse = await http.get(Uri.parse('http://127.0.0.1:8000//api/teams/'));
      final roundsResponse = await http.get(Uri.parse('http://127.0.0.1:8000//api/rounds/'));
      final matchesResponse = await http.get(Uri.parse('http://127.0.0.1:8000//api/matches/'));

      if (leaguesResponse.statusCode == 200 && teamsResponse.statusCode == 200 &&
          roundsResponse.statusCode == 200 && matchesResponse.statusCode == 200) {
        final leaguesData = json.decode(leaguesResponse.body);
        final teamsData = json.decode(teamsResponse.body);
        final roundsData = json.decode(roundsResponse.body);
        final matchesData = json.decode(matchesResponse.body);

        // Process and combine the data
        List<League> loadedLeagues = [];

        for (var leagueData in leaguesData) {
          List<Team> leagueTeams = [];
          for (var teamData in teamsData) {
            if (teamData['league'] == leagueData['id']) {
              leagueTeams.add(Team.fromJson(teamData));
            }
          }

          // Sort teams by points and then by wins
          leagueTeams.sort((a, b) {
            if (a.points == b.points) {
              return b.wins.compareTo(a.wins);
            }
            return b.points.compareTo(a.points);
          });

          for (int i = 0; i < leagueTeams.length; i++) {
            leagueTeams[i].place = i + 1;
          }

          // Process matches and rounds
          List<Round> leagueRounds = [];
          List<Match> leagueMatches = [];

          for (var matchData in matchesData) {
            if (matchData['league'] == leagueData['id']) {
              leagueMatches.add(Match.fromJson(matchData));
            }
          }

          for (var roundData in roundsData) {
            if (leagueMatches.any((match) => match.roundNumber == roundData['round_number'])) {
              List<Match> matchesForRound = leagueMatches
                  .where((match) => match.roundNumber == roundData['round_number'])
                  .toList();
              leagueRounds.add(Round.fromJson(roundData, matchesForRound));
            }
          }

          loadedLeagues.add(League(
            id: leagueData['id'],
            name: leagueData['name'],
            type: leagueData['type'],
            teams: leagueTeams,
            rounds: leagueRounds,
          ));
        }

        setState(() {
          leagues = loadedLeagues;
          selectedLeague = leagues.isNotEmpty ? leagues[0] : null;
        });
      } else {
        // Handle error
      }
    } catch (e) {
      print('Error fetching data: $e');
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Match Results'),
      ),
      body: loading
          ? Center(child: CircularProgressIndicator())
          : leagues.isEmpty
              ? Center(child: Text('No leagues available'))
              : Column(
                  children: [
                    DropdownButton<League>(
                      value: selectedLeague,
                      onChanged: (League? newValue) {
                        setState(() {
                          selectedLeague = newValue!;
                        });
                      },
                      items: leagues.map<DropdownMenuItem<League>>((League league) {
                        return DropdownMenuItem<League>(
                          value: league,
                          child: Text(league.name),
                        );
                      }).toList(),
                    ),
                    if (selectedLeague != null) ...[
                      Expanded(
                        child: ListView(
                          children: [
                            DataTable(
                              columns: [
                                DataColumn(label: Text('Place')),
                                DataColumn(label: Text('Player 1')),
                                if (selectedLeague!.type != 'S')
                                  DataColumn(label: Text('Player 2')),
                                DataColumn(label: Text('Matches Played')),
                                DataColumn(label: Text('Wins')),
                                DataColumn(label: Text('Losses')),
                                DataColumn(label: Text('Points')),
                              ],
                              rows: selectedLeague!.teams.map((team) {
                                return DataRow(
                                  cells: [
                                    DataCell(Text(team.place.toString())),
                                    DataCell(Text('${team.player1Name}')),
                                    if (selectedLeague!.type != 'S')
                                      DataCell(Text('${team.player2Name ?? '-'}')),
                                    DataCell(Text(team.numberOfPlayedMatches.toString())),
                                    DataCell(Text(team.wins.toString())),
                                    DataCell(Text(team.losses.toString())),
                                    DataCell(Text(team.points.toString())),
                                  ],
                                );
                              }).toList(),
                            ),
                            for (var round in selectedLeague!.rounds) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(vertical: 8.0),
                                child: Text('Round ${round.roundNumber}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              ),
                              DataTable(
                                columns: [
                                  DataColumn(label: Text('Match')),
                                  DataColumn(label: Text('Team 1')),
                                  DataColumn(label: Text('Team 2')),
                                ],
                                rows: round.matches.map((match) {
                                  return DataRow(
                                    cells: [
                                      DataCell(Text('${match.roundNumber}-${match.id}')),
                                      DataCell(Text('${match.teamHostName}')),
                                      DataCell(Text('${match.teamGuestName}')),
                                    ],
                                  );
                                }).toList(),
                              ),
                            ]
                          ],
                        ),
                      ),
                    ]
                  ],
                ),
    );
  }
}

class League {
  final int id;
  final String name;
  final String type;
  final List<Team> teams;
  final List<Round> rounds;

  League({
    required this.id,
    required this.name,
    required this.type,
    required this.teams,
    required this.rounds,
  });
}

class Team {
  final int id;
  final String player1Name;
  final String? player2Name;
  final int points;
  final int wins;
  final int losses;
  final int numberOfPlayedMatches;
  int place;

  Team({
    required this.id,
    required this.player1Name,
    this.player2Name,
    required this.points,
    required this.wins,
    required this.losses,
    required this.numberOfPlayedMatches,
    this.place = 0,
  });

  factory Team.fromJson(Map<String, dynamic> json) {
    return Team(
      id: json['id'],
      player1Name: json['player1_obj']['name'],
      player2Name: json['player2_obj'] != null ? json['player2_obj']['name'] : null,
      points: json['points'],
      wins: json['wins'],
      losses: json['losses'],
      numberOfPlayedMatches: json['number_of_played_matches'],
    );
  }
}

class Round {
  final int roundNumber;
  final List<Match> matches;

  Round({
    required this.roundNumber,
    required this.matches,
  });

  factory Round.fromJson(Map<String, dynamic> json, List<Match> matches) {
    return Round(
      roundNumber: json['round_number'],
      matches: matches,
    );
  }
}

class Match {
  final int id;
  final int roundNumber;
  final String teamHostName;
  final String teamGuestName;

  Match({
    required this.id,
    required this.roundNumber,
    required this.teamHostName,
    required this.teamGuestName,
  });

  factory Match.fromJson(Map<String, dynamic> json) {
    return Match(
      id: json['id'],
      roundNumber: json['round_number'],
      teamHostName: json['team_host']['player1_obj']['name'],
      teamGuestName: json['team_guest']['player1_obj']['name'],
    );
  }
}
