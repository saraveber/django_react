import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class MyUpcomingMatches extends StatefulWidget {
  @override
  _MyUpcomingMatchesState createState() => _MyUpcomingMatchesState();
}

class _MyUpcomingMatchesState extends State<MyUpcomingMatches> {
  final int currUserId = 1; // Example user ID, replace with your user context.
  List matches = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchMyAssignedMatches();
  }

  Future<void> fetchMyAssignedMatches() async {
    try {
      final response = await http.get(Uri.parse('http://127.0.0.1:8000/api/assignedmatches/'));
      if (response.statusCode == 200) {
        setState(() {
          matches = json.decode(response.body);
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load matches');
      }
    } catch (error) {
      print("Error fetching assigned matches: $error");
      setState(() {
        isLoading = false;
      });
    }
  }

  String getTeamNames(match) {
    final hostPlayer1 = match['match_obj']['team_host_obj']['player1_obj'];
    final hostPlayer2 = match['match_obj']['team_host_obj']['player2_obj'];
    final guestPlayer1 = match['match_obj']['team_guest_obj']['player1_obj'];
    final guestPlayer2 = match['match_obj']['team_guest_obj']['player2_obj'];

    if (hostPlayer2 != null) {
      return "${hostPlayer1['name']} ${hostPlayer1['surname']} and ${hostPlayer2['name']} ${hostPlayer2['surname']} : ${guestPlayer1['name']} ${guestPlayer1['surname']} and ${guestPlayer2['name']} ${guestPlayer2['surname']}";
    }
    return "${hostPlayer1['name']} ${hostPlayer1['surname']} : ${guestPlayer1['name']} ${guestPlayer1['surname']}";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('My Upcoming Matches'),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : matches.isEmpty
              ? Center(child: Text('No upcoming matches.', style: TextStyle(fontSize: 18.0)))
              : Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: GridView.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.75,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                    ),
                    itemCount: matches.length,
                    itemBuilder: (context, index) {
                      final match = matches[index];
                      final matchStartDate = DateTime.parse(match['start_date']);
                      final matchEndDate = DateTime.parse(match['end_date']);
                      final DateFormat dateFormat = DateFormat('yyyy-MM-dd');
                      final DateFormat timeFormat = DateFormat('HH:mm');

                      return Card(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(
                                getTeamNames(match),
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                            Divider(),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 8.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text("Match Details", style: TextStyle(fontWeight: FontWeight.bold)),
                                  SizedBox(height: 8.0),
                                  Text("Date: ${dateFormat.format(matchStartDate)}"),
                                  Text("Time: ${timeFormat.format(matchStartDate)} - ${timeFormat.format(matchEndDate)}"),
                                  Text("Tennis Field: ${match['tennis_field']}"),
                                  if (match['is_cancelled'])
                                    Text("Cancellation Details: ${match['reason_for_cancellation'] ?? 'No reason provided'}",
                                        style: TextStyle(color: Colors.red)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
