package com.repairhub.controller;

import com.repairhub.entity.Guide;
import com.repairhub.entity.User;
import com.repairhub.repository.GuideRepository;
import com.repairhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class GuideController {
    
    @Autowired
    private GuideRepository guideRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/guides")
    public ResponseEntity<List<Map<String, Object>>> getGuides() {
        List<Guide> guides = guideRepository.findAllByOrderByIdDesc();
        List<Map<String, Object>> guideData = guides.stream()
                .map(guide -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", guide.getId());
                    map.put("item_name", guide.getItemName());
                    map.put("guide_content", guide.getGuideContent());
                    map.put("date", guide.getDate());
                    map.put("user_id", guide.getUser().getId());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(guideData);
    }
    
    @GetMapping("/guides/{id}")
    public ResponseEntity<Map<String, Object>> getGuide(@PathVariable Long id) {
        Optional<Guide> guideOpt = guideRepository.findById(id);
        if (guideOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Guide guide = guideOpt.get();
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", guide.getId());
        response.put("item_name", guide.getItemName());
        response.put("guide_content", guide.getGuideContent());
        response.put("date", guide.getDate());
        response.put("user_id", guide.getUser().getId());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/guides")
    public ResponseEntity<Map<String, Object>> createGuide(@RequestBody Map<String, Object> request) {
        String itemName = (String) request.get("item_name");
        String guideContent = (String) request.get("guide_content");
        Long userId = Long.valueOf(request.get("user_id").toString());
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        Guide guide = new Guide();
        guide.setItemName(itemName);
        guide.setGuideContent(guideContent);
        guide.setDate(LocalDate.now());
        guide.setUser(userOpt.get());
        
        Guide savedGuide = guideRepository.save(guide);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", savedGuide.getId());
        response.put("item_name", savedGuide.getItemName());
        response.put("guide_content", savedGuide.getGuideContent());
        response.put("date", savedGuide.getDate());
        response.put("user_id", savedGuide.getUser().getId());
        
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/guides/{id}")
    public ResponseEntity<Map<String, Object>> updateGuide(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Optional<Guide> guideOpt = guideRepository.findById(id);
        if (guideOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Guide guide = guideOpt.get();
        
        if (request.containsKey("item_name")) {
            guide.setItemName((String) request.get("item_name"));
        }
        if (request.containsKey("guide_content")) {
            guide.setGuideContent((String) request.get("guide_content"));
        }
        
        Guide savedGuide = guideRepository.save(guide);
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", savedGuide.getId());
        response.put("item_name", savedGuide.getItemName());
        response.put("guide_content", savedGuide.getGuideContent());
        response.put("date", savedGuide.getDate());
        response.put("user_id", savedGuide.getUser().getId());
        
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/guides/{id}")
    public ResponseEntity<Map<String, String>> deleteGuide(@PathVariable Long id) {
        if (!guideRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        guideRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Guide deleted successfully"));
    }
}
