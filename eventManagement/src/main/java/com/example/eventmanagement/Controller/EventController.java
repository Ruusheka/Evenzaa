package com.example.eventmanagement.Controller;

import com.example.eventmanagement.Model.Event;
import com.example.eventmanagement.Service.EventService;
import com.example.eventmanagement.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/events")
@CrossOrigin(origins = "*", allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class EventController {

    @Autowired
    private EventService service;

    // ─── CREATE EVENT ───────────────────────────────────────
    @PostMapping("/")
    public Event addEvent(@RequestBody Event event,
                          @RequestHeader("Authorization") String token) {
        String facultyId = JwtUtil.validateToken(token.substring(7));
        event.setFacultyId(facultyId);
        return service.addEvent(event);
    }

    // ─── GET ALL EVENTS ──────────────────────────────────────
    @GetMapping("/")
    public List<Event> getAllEvents() {
        return service.getAllEvents();
    }

    // ─── GET EVENT BY ID ─────────────────────────────────────
    @GetMapping("/{id}")
    public Event getById(@PathVariable String id) {
        return service.getById(id).orElse(null);
    }

    // ─── GET STUDENT'S REGISTERED EVENTS ─────────────────────
    @GetMapping("/student/{rollNo}")
    public List<Event> getByStudent(@PathVariable Integer rollNo) {
        return service.getByStudent(rollNo);
    }

    // ─── GET STUDENT'S CANCELLED EVENTS ──────────────────────
    @GetMapping("/cancelled/{rollNo}")
    public List<Event> getCancelledByStudent(@PathVariable Integer rollNo) {
        return service.getCancelledByStudent(rollNo);
    }

    // ─── GET EVENTS BY MONTH ─────────────────────────────────
    @GetMapping("/month/{month}")
    public List<Event> getByMonth(@PathVariable int month) {
        return service.getByMonth(month);
    }

    // ─── REGISTER STUDENT FOR EVENT ──────────────────────────
    @PostMapping("/register/{eventId}/{rollNo}")
    public Map<String, String> registerStudent(@PathVariable String eventId, @PathVariable Integer rollNo) {
        String result = service.registerStudent(eventId, rollNo);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return response;
    }

    // ─── CANCEL STUDENT REGISTRATION ─────────────────────────
    @PostMapping("/cancel/{eventId}/{rollNo}")
    public Map<String, String> cancelRegistration(@PathVariable String eventId, @PathVariable Integer rollNo) {
        String result = service.cancelRegistration(eventId, rollNo);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return response;
    }

    // ─── UPDATE EVENT ─────────────────────────────────────────
    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable String id,
                             @RequestBody Event event,
                             @RequestHeader("Authorization") String token) {
        String facultyId = JwtUtil.validateToken(token.substring(7));
        return service.updateEvent(id, event, facultyId);
    }

    // ─── DELETE EVENT ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    public Map<String, String> deleteEvent(@PathVariable String id,
                              @RequestHeader("Authorization") String token) {
        String facultyId = JwtUtil.validateToken(token.substring(7));
        String result = service.deleteEvent(id, facultyId);
        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return response;
    }
}