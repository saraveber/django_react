import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class CalendarPage extends StatefulWidget {
  @override
  _HourlyWeeklyCalendarState createState() => _HourlyWeeklyCalendarState();
}

class _HourlyWeeklyCalendarState extends State<CalendarPage> {
  Map<DateTime, Color> _selectedHours = {};
  DateTime _focusedDay = DateTime.now();

  @override
  void initState() {
    super.initState();
    _fetchExistingTerms(); // Fetch and color existing terms when the widget is initialized
  }

  List<DateTime> _generateWeekDays(DateTime startDay) {
    return List<DateTime>.generate(
      7,
      (index) => startDay.add(Duration(days: index)),
    );
  }

  @override
  Widget build(BuildContext context) {
    DateTime monday = _focusedDay.subtract(Duration(days: _focusedDay.weekday - 1));
    List<DateTime> weekDays = _generateWeekDays(monday);

    return Scaffold(
      appBar: AppBar(
        title: Text('Weekly Hourly Calendar'),
        actions: [
          IconButton(
            icon: Icon(Icons.arrow_back),
            onPressed: () {
              setState(() {
                _focusedDay = _focusedDay.subtract(Duration(days: 7));
              });
            },
          ),
          IconButton(
            icon: Icon(Icons.arrow_forward),
            onPressed: () {
              setState(() {
                _focusedDay = _focusedDay.add(Duration(days: 7));
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          _buildWeekHeader(weekDays),
          Expanded(
            child: _buildHourGrid(weekDays),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: _submitSelections,
              child: Text('Submit'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWeekHeader(List<DateTime> weekDays) {
    return Row(
      children: [
        SizedBox(width: 50), // Empty cell for the hours column
        ...weekDays.map((day) => Expanded(
              child: Center(
                child: Column(
                  children: [
                    Text(
                      DateFormat.E().format(day),
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    Text(
                      DateFormat.MMMd().format(day), // Show the date (e.g., Aug 22)
                      style: TextStyle(fontSize: 14),
                    ),
                  ],
                ),
              ),
            )).toList(),
      ],
    );
  }

  Widget _buildHourGrid(List<DateTime> weekDays) {
    // Define the hours range (7 AM to 10 PM)
    const int startHour = 7;
    const int endHour = 22;
    const int hoursInDay = endHour - startHour + 1;  // 16 hours (7 AM to 10 PM)

    return LayoutBuilder(
      builder: (context, constraints) {
        // Calculate the height of each cell
        final double cellHeight = constraints.maxHeight / hoursInDay;

        return GridView.builder(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 8, // 7 days + 1 for hours column
            childAspectRatio: constraints.maxWidth / (8 * cellHeight),
          ),
          itemCount: hoursInDay * 8, // 16 hours * (7 days + 1 for hours)
          itemBuilder: (context, index) {
            if (index % 8 == 0) {
              return Container(
                alignment: Alignment.center,
                height: cellHeight,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  color: Colors.grey[200],
                ),
                child: Text(
                  DateFormat.j().format(DateTime(2020, 1, 1, startHour + index ~/ 8)),
                  style: TextStyle(fontSize: 12),
                ),
              );
            } else {
              DateTime hourSlot = DateTime(
                weekDays[(index % 8) - 1].year,
                weekDays[(index % 8) - 1].month,
                weekDays[(index % 8) - 1].day,
                startHour + index ~/ 8,
                0,
                0,
              );
              return GestureDetector(
                onTap: () => _onHourSelected(hourSlot),
                child: Container(
                  height: cellHeight,
                  decoration: BoxDecoration(
                    color: _selectedHours[hourSlot] ?? Colors.white,
                    border: Border.all(color: Colors.grey),
                  ),
                  child: Center(
                    child: Text(''), // Optionally display something here
                  ),
                ),
              );
            }
          },
        );
      },
    );
  }

  void _onHourSelected(DateTime hourSlot) {
    setState(() {
      if (_selectedHours.containsKey(hourSlot)) {
        _selectedHours.remove(hourSlot);
      } else {
        _selectedHours[hourSlot] = Colors.blueAccent;
      }
    });
  }

  Future<void> _submitSelections() async {
    // Convert selected hours to a list and sort them
    List<DateTime> selectedHours = _selectedHours.keys.toList()
      ..sort((a, b) => a.compareTo(b)); // Sort the list

    List<Map<String, String>> groupedHours = [];

    // Initialize variables for grouping
    DateTime? start = selectedHours.isNotEmpty ? selectedHours.first : null;
    DateTime? end = start;

    for (int i = 1; i < selectedHours.length; i++) {
      // Check if the current hour is consecutive to the previous one
      if (selectedHours[i].difference(selectedHours[i - 1]).inHours == 1 &&
          selectedHours[i].day == selectedHours[i - 1].day) {
        // If consecutive, extend the end time
        end = selectedHours[i];
      } else {
        // If not consecutive, store the current group and start a new one
        if (start != null && end != null) {
          groupedHours.add({
            "start": start.toIso8601String(),
            "end": end.toIso8601String(),
          });
        }
        start = selectedHours[i];
        end = start;
      }
    }
    // Add the last group
    if (start != null && end != null) {
      groupedHours.add({
        "start": start.toIso8601String(),
        "end": end.toIso8601String(),
      });
    }

    // Perform the API call delete
    bool deleteSuccessful = await deleteExistingTerms();
    if (!deleteSuccessful) {
      // Handle deletion failure
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to delete existing terms.')));
      return;
    }

    // Perform the API call submit
    final response = await submitToApi(groupedHours);
    if (response.isSuccessful) {
      // Handle success, e.g., show a confirmation message
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Selections submitted successfully!')));
    } else {
      // Handle failure, e.g., show an error message
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to submit selections.')));
    }
  }

  // Method to fetch existing terms from the API and color the cells
  Future<void> _fetchExistingTerms() async {
    try {
      final response = await http.get(
        Uri.parse('http://127.0.0.1:8000/api/terms/'), // Adjust this URL as needed
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
      );

      if (response.statusCode == 200) {
        List<dynamic> terms = jsonDecode(response.body);
        setState(() {
          for (var term in terms) {
            DateTime startDate = DateTime.parse(term['start_date']);
            DateTime endDate = DateTime.parse(term['end_date']);

            // Ensure the comparison checks are precise for both date and time
            for (DateTime hour = startDate;
                hour.isBefore(endDate) || hour.isAtSameMomentAs(endDate);
                hour = hour.add(Duration(hours: 1))) {
                _selectedHours[DateTime.parse(hour.toIso8601String().replaceFirst('Z', ''))] = Colors.blueAccent;
            }
          }
        });
      } else {
        print('Failed to fetch terms: ${response.body}');
      }
    } catch (e) {
      print('Error during fetching terms: $e');
    }
  }

  // Method to delete existing terms
  Future<bool> deleteExistingTerms() async {
    try {
      final response = await http.delete(
        Uri.parse('http://127.0.0.1:8000/api/terms/delete-all/'), // Adjust this URL as needed
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
      );

      if (response.statusCode == 204) { // Assuming 204 No Content for successful deletion
        return true;
      } else {
        print('Failed to delete terms: ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error during deletion: $e');
      return false;
    }
  }

  Future<ApiResponse> submitToApi(List<Map<String, String>> groupedHours) async {
    // Create a list to store responses
    List<ApiResponse> responses = [];

    for (var group in groupedHours) {
      try {
        final response = await http.post(
          Uri.parse('http://127.0.0.1:8000/api/terms/'), // Assuming you're running on Android Emulator
          headers: <String, String>{
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: jsonEncode(<String, dynamic>{
            'start_date': group['start'],
            'end_date': group['end'],
          }),
        );

        if (response.statusCode != 201) {
          return ApiResponse(isSuccessful: false, message: 'Submission failed');
        }
      } catch (e) {
        return ApiResponse(isSuccessful: false, message: 'Submission failed');
      }
    }
    return ApiResponse(isSuccessful: true, message: 'Submission sucessfull');
  }
}

class ApiResponse {
  final bool isSuccessful;
  final String message;

  ApiResponse({required this.isSuccessful, required this.message});

  factory ApiResponse.fromJson(Map<String, dynamic> json) {
    return ApiResponse(
      isSuccessful: json['success'],
      message: json['message'],
    );
  }
}
