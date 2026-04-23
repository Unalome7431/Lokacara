package com.lokacara.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

// Stubs for Models (Assuming Certificate exists)
data class EventRegistration(val event: Event?)
data class Certificate(val id: Int, val eventRegistration: EventRegistration?)

@Composable
fun DashboardScreen(joinedEvents: List<Event>, hostedEvents: List<Event>, certificates: List<Certificate>, onHomeClick: () -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        Button(onClick = onHomeClick) { Text("Home") }
        
        Text("My Dashboard", modifier = Modifier.padding(vertical = 16.dp))

        Text("Joined Events")
        joinedEvents.forEach { Text("- ${it.title}") }

        Text("Hosted Events", modifier = Modifier.padding(top = 16.dp))
        hostedEvents.forEach { Text("- ${it.title}") }

        Text("Certificates", modifier = Modifier.padding(top = 16.dp))
        certificates.forEach { Text("- Certificate for ${it.eventRegistration?.event?.title ?: "Unknown Event"}") }
    }
}
