package com.lokacara.ui

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// Stubs for Models
data class EventCategory(val name: String)
data class Event(val id: Int, val title: String, val description: String, val category: EventCategory?)

@Composable
fun HomeScreen(events: List<Event>, isAuthenticated: Boolean, onLoginClick: () -> Unit, onDashboardClick: () -> Unit, onJoinEvent: (Int) -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        if (isAuthenticated) {
            Button(onClick = onDashboardClick) { Text("Dashboard") }
        } else {
            Button(onClick = onLoginClick) { Text("Login") }
        }
        Text("Latest Events", modifier = Modifier.padding(vertical = 8.dp))
        LazyColumn {
            items(events) { event ->
                Column(modifier = Modifier
                    .padding(vertical = 8.dp)
                    .border(1.dp, Color.Black)
                    .padding(10.dp)) {
                    Text(event.title)
                    Text("Category: ${event.category?.name ?: "None"}")
                    Text(event.description)
                    Button(onClick = { onJoinEvent(event.id) }) { Text("Join Event") }
                }
            }
        }
    }
}
